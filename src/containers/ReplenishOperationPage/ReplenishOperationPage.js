import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';
import { Grid, Dimmer, Loader, Input, Button } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import Websocket from 'react-websocket';
import i18n from 'i18n';

import appConfig from 'services/AppConfig';
import api from 'api';
import PodShelfInfo from 'components/Operation/PodShelfInfo/PodShelfInfo';
import ProductInfoDisplay from 'components/common/ProductInfoDisplay/ProductInfoDisplay';

import { checkCurrentUnFinishTask } from 'redux/actions/stationAction';
import { getStationTaskStatus } from 'redux/actions/statusAction';
import './ReplenishOperationPage.css';
import * as log4js from 'log4js2';

const LOCATION_TYPE = 0;
const PRODUCT_TYPE = 1;
const CHANGE_LOCATION_TYPE = 2;

const status = {
  FIRST_LOCATION_SCAN: '21',
  PRODUCT_SCAN: '22',
  SECOND_LOCATION_SCAN: '23',
  CHANGE_LOCATION_SCAN: '99',
};

const pickScanMessage = {
  0: 'operation.scanLocation',
  1: 'operation.pickAndScanProduct',
  2: 'operation.scanLocationAgain',
};

const replenishScanMessage = {
  0: 'operation.scanLocation',
  1: 'operation.scanAndPlaceProduct',
  2: 'operation.scanLocationAgain',
};

const changeBinScanMessage = {
  28: '請再次掃描舊架位條碼',
  1: '請掃描新架位條碼',
  26: '請掃描新架位條碼',
};

class ReplenishOperationPage extends Component {
  state = {
    podInfo: {
      podId: 0,
      podSide: 0,
      shelfBoxes: [],
      locationBarcode: '',
    },
    currentReplenishProduct: {
      quantity: 0,
    },
    currentHighlightBox: {
      row: 0,
      column: 0,
    },
    loading: true,
    stillTask: 0,
    taskStatus: 0,
    actionType: 0,
    stationTaskStat: null,
    isChangeLocation: false,
  };

  wsUrl = `${appConfig.getWsUrl()}/api`;

  log = log4js.getLogger('ReplenishOperPage');

  language = i18n.language;

  constructor(props) {
    super(props);

    // Setup Ref for input fields
    this.scanInputRef = React.createRef();

    // Bind the this context to the handler function
    this.handleScanKeyPress = this.handleScanKeyPress.bind(this);
    this.handleWsData = this.handleWsData.bind(this);
    this.handleWsOpen = this.handleWsOpen.bind(this);
    this.handleWsClose = this.handleWsClose.bind(this);
  }

  componentWillMount() {
    this.logInfo('Enter ReplenishOperationPage');

    this.props.getStationTaskStatus();

    // TODO: Subscribe to websocket
    this.listenToWebSocket();
  }

  componentWillUnmount() {
    clearInterval(window.productInterval);
  }

  componentDidMount() {
    this.setFocusToScanInput();
  }

  logInfo(msg) {
    this.log.info(msg);
  }

  listenToWebSocket() {
    this.getProductInfo();
  }

  setFocusToScanInput() {
    this.scanInputRef.current.inputRef.value = '';
    this.scanInputRef.current.focus();
  }

  getPodInfo() {
    api.station.getStationPodLayout().then((res) => {
      if (!res.success) {
        return;
      }

      if (res.data.length) {
        this.logInfo(`[GET POD INFO] Success: Pod height: ${res.data.length}`);

        const { row, column } = this.state.currentHighlightBox;

        const locationBarcode = res.data.find(obj => obj.shelfId === row && obj.boxId === column).barCode;

        this.setState({
          podInfo: {
            podId: res.data[0].podId,
            podSide: res.data[0].podSide,
            shelfBoxes: _.chain(res.data)
              .groupBy('shelfId')
              .map((elmt) => {
                // chain maxBy here doesnt work... keep returning boxId:1
                const maxElmt = _.maxBy(elmt, 'boxId');
                return _.pick(maxElmt, ['shelfId', 'boxId']);
              })
              .values()
              .sortBy('shelfID')
              .map(elmt => parseInt(elmt.boxId, 10))
              .reverse()
              .value(),
            locationBarcode,
          },
          loading: false,
        });
      } else {
        this.logInfo('[GET POD INFO] Failed: Empty array returned..');
        setTimeout(() => {
          this.logInfo('[GET POD INFO] Retrying');
          this.getPodInfo();
        }, 1000);
      }
    }).catch((err) => {
      this.logInfo(`[ERROR] getting pod info. ${err}`);
    });
  }

  getProductInfo() {
    this.logInfo('[GET PRODUCT INFO] Getting product info');
    this.setState({ loading: true });

    let isReceive = false;
    window.productInterval = setInterval(() => {
      if (!isReceive) {
        api.replenish.getReceiveProductInfo().then((res) => {
          console.log('GET PRODUCT', res);
          if (res.success) {
            this.setState({
              taskStatus: res.data.taskProgress,
              currentReplenishProduct: res.data.receiveTask || {},
              currentHighlightBox: {
                row: res.data.shelfId,
                column: res.data.boxId,
              },
              stillTask: res.data.stillTask,
              actionType: res.data.type,
              stationTaskStat: res.data.stationTaskStat,
              isChangeLocation: false,
            }, () => {
              isReceive = true;
            });
          }
        }).catch((err) => {
          this.log.error(`[ERROR] getting product ${JSON.stringify(err)}`);
          console.error('[ERROR] getting product', err);
        });
      } else {
        this.logInfo('STOP INTERVAL');
        console.log(`[location] ${this.state.currentReplenishProduct.locationCode}`);
        console.log(`[product] ${this.state.currentReplenishProduct.productBarCode}`);
        this.getPodInfo();
        clearInterval(window.productInterval);
      }
    }, 500);
  }

  preProcessInputValue(value) {
    if (value === 'change') {
      this.setState(prevState => ({ isChangeLocation: !prevState.isChangeLocation }));
      return true;
    }

    return false;
  }

  handleScanKeyPress(e) {
    if (e.key === 'Enter' && e.target.value) {
      e.persist();

      let scannedValue = e.target.value;

      this.setFocusToScanInput();

      if (this.preProcessInputValue(scannedValue)) {
        return;
      }

      let scanType;
      const { taskStatus, stationTaskStat } = this.state;
      let { isChangeLocation } = this.state;

      if (scannedValue === 'empty' && stationTaskStat !== 26) {
        isChangeLocation = true;
        scannedValue = null;
      }

      if (isChangeLocation) {
        scanType = CHANGE_LOCATION_TYPE;
      } else if (taskStatus === 0 || taskStatus === 2) {
        scanType = LOCATION_TYPE;
      } else if (taskStatus === 1) {
        scanType = PRODUCT_TYPE;
      } else {
        scanType = null;
      }

      const { t } = this.props;
      console.log(`scanType: ${scanType}, scannedValue: ${scannedValue}`);
      api.replenish.pushReceiveProcess(scanType, scannedValue).then((res) => {
        console.log(`[response] code: ${res.code}, taskProgress: ${res.data.taskProgress}`);

        if (res.success) {
          if (isChangeLocation) {
            this.getProductInfo();
            return;
          }
          switch (res.code) {
            case status.CHANGE_LOCATION_SCAN:
              this.setState({
                taskStatus: res.data.taskProgress,
              });
              this.getProductInfo();
              break;
            case status.FIRST_LOCATION_SCAN:
              toast.success(t('operation.correctLocation'));
              this.setState({ taskStatus: res.data.taskProgress });
              break;
            case status.PRODUCT_SCAN:
              toast.success(t('operation.correctProduct'));
              this.setState({
                taskStatus: res.data.taskProgress,
              });
              break;
            case status.SECOND_LOCATION_SCAN:
            case '1':
              toast.success(t('operation.correctLocation'));
              if (this.state.stillTask === 0) {
                toast.success(t('message.allTaskFinished'));

                setTimeout(() => {
                  this.props.history.push('/replenish-task');
                }, 500);
              }
              this.getProductInfo();
              break;
            default:
              break;
          }
        } else {
          toast.error(`Error Code: ${res.code}, \nMessage: ${res.data.resultDesc}`);
        }

        this.setState({ isChangeLocation: false });
      });
    }
  }

  handleChangeLocation = () => {
    this.handleScanKeyPress({
      key: 'Enter',
      target: {
        value: 'change',
      },
      persist: () => {},
    });
  }

  handleEmptyLocation = () => {
    this.handleScanKeyPress({
      key: 'Enter',
      target: {
        value: 'empty',
      },
      persist: () => {},
    });
  }

  handleWsOpen = () => {
    console.log('[WebSocket] connected');
  }

  handleWsClose = () => {
    console.log('[WebSocket] Closed');
  }

  handleWsData = (data) => {
    console.log('[WebSocket] Data received:', data);
  }


  render() {
    const { podInfo, currentReplenishProduct, taskStatus, actionType,
      currentHighlightBox, isChangeLocation, stationTaskStat } = this.state;
    const { t, stationTaskStatus } = this.props;

    const scanMessage = actionType === 1 ? pickScanMessage : replenishScanMessage;

    return (
      <div className="replenish-operation-page">
        <Websocket
          url={this.wsUrl}
          onMessage={this.handleWsData}
          onOpen={this.handleWsOpen}
          onClose={this.handleWsClose}
          reconnect
          debug
          ref={(websocket) => {
            this.refWebSocket = websocket;
          }}
        />
        <Dimmer active={this.state.loading}>
          <Loader content={t('operation.waitingForPod')} indeterminate size="massive" />
        </Dimmer>
        <div className="page-title">
          {t('label.replenishOperation')}
        </div>
        <div className="order-title">
          OrderNo:
          {' '}
          {currentReplenishProduct.barCode}
        </div>
        <Grid>
          <Grid.Row>
            <Grid.Column width={5}>
              <PodShelfInfo
                podInfo={podInfo}
                highlightBox={currentHighlightBox}
                onShortageClicked={this.handleShortageClick}
                showAdditionBtns={false}
              />
            </Grid.Column>

            <Grid.Column width={11}>
              <ProductInfoDisplay
                product={currentReplenishProduct}
                amount={currentReplenishProduct.quantity}
                currentBarcode={currentReplenishProduct.productBarCode}
                unit={currentReplenishProduct.unit}
                taskStatus={stationTaskStat === null ? '' : stationTaskStatus[stationTaskStat][this.language]}
              />
              <div className="action-group-container">
                <div className="scan-input-group">
                  <br />
                  <div className="scan-description">
                    { isChangeLocation ? changeBinScanMessage[stationTaskStat] : t(scanMessage[taskStatus]) }
                  </div>
                  <div className="scan-input-holder">
                    <Input
                      type="text"
                      ref={this.scanInputRef}
                      onKeyPress={this.handleScanKeyPress}
                    />
                  </div>
                  <div>
                    <Button primary size="medium" onClick={() => this.handleChangeLocation()}>
                      {isChangeLocation ? t('label.cancelChangeLocation') : t('label.changeLocation')}
                    </Button>
                    <Button
                      primary
                      size="medium"
                      onClick={() => this.handleEmptyLocation()}
                      // disabled={stationTaskStat === 26}
                    >
                      {t('label.changeShelf')}
                    </Button>
                  </div>
                </div>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

ReplenishOperationPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    stationTaskStatus: state.status.stationTaskStatus,
  };
}

export default compose(
  connect(mapStateToProps, {
    checkCurrentUnFinishTask,
    getStationTaskStatus,
  }),
  withNamespaces(),
)(ReplenishOperationPage);
