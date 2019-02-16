import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';
import { Grid, Dimmer, Loader, Input } from 'semantic-ui-react';
import { toast } from 'react-toastify';

import api from 'api';
import PodShelfInfo from 'components/Operation/PodShelfInfo/PodShelfInfo';
import ProductInfoDisplay from 'components/common/ProductInfoDisplay/ProductInfoDisplay';

import { checkCurrentUnFinishTask } from 'redux/actions/stationAction';
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
  2: 'operation.scanLocation',
};

const replenishScanMessage = {
  0: 'operation.scanLocation',
  1: 'operation.scanAndPlaceProduct',
  2: 'operation.scanLocationAgain',
};

const changeBinScanMessage = {
  0: 'Please scan the original box location again',
  1: 'Please scan the new location',
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
    isChangeLocation: false,
  };

  log = log4js.getLogger('ReplenishOperPage');

  constructor(props) {
    super(props);

    // Setup Ref for input fields
    this.scanInputRef = React.createRef();

    // Bind the this context to the handler function
    this.handleScanKeyPress = this.handleScanKeyPress.bind(this);
  }

  componentWillMount() {
    this.logInfo('Enter ReplenishOperationPage');

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
    }, 3000);
  }

  preProcessInputValue(value) {
    if (value === '%CHANGE_SHELF%') {
      this.setState({ isChangeLocation: true });
      return true;
    }

    return false;
  }

  /* Production */
  handleScanKeyPress(e) {
    if (e.key === 'Enter' && e.target.value) {
      e.persist();

      if (this.preProcessInputValue(e.target.value)) {
        return;
      }

      this.logInfo(`[SCANNED] ${e.target.value}`);
      const scannedValue = e.target.value;
      let scanType;

      const { isChangeLocation, taskStatus } = this.state;
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
      api.replenish.pushReceiveProcess(scanType, scannedValue).then((res) => {
        console.log('code:', res);

        // handle isChangeLocation == true
        switch (res.code) {
          case status.CHANGE_LOCATION_SCAN:
            this.setState({ taskStatus: res.data.taskProgress });
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
      });

      this.setFocusToScanInput();
    }
  }


  render() {
    const { podInfo, currentReplenishProduct, taskStatus, actionType,
      currentHighlightBox, isChangeLocation } = this.state;
    const { t } = this.props;

    const scanMessage = actionType === 1 ? pickScanMessage : replenishScanMessage;

    return (
      <div className="replenish-operation-page">
        <Dimmer active={this.state.loading}>
          <Loader content={t('operation.waitingForPod')} indeterminate size="massive" />
        </Dimmer>
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
              />
              <div className="action-group-container">
                <div className="scan-input-group">
                  <br />
                  <div className="scan-description">
                    { isChangeLocation ? changeBinScanMessage[actionType] : t(scanMessage[taskStatus]) }
                  </div>
                  <div className="scan-input-holder">
                    <Input
                      type="text"
                      ref={this.scanInputRef}
                      onKeyPress={this.handleScanKeyPress}
                    />
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

// function mapStateToProps(state) {
//   return {
//   };
// }

export default compose(
  connect(null, {
    checkCurrentUnFinishTask,
  }),
  withNamespaces(),
)(ReplenishOperationPage);
