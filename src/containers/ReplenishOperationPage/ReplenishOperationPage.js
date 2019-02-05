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
// import WarningModal from 'components/common/WarningModal/WarningModal';
import ProductInfoDisplay from 'components/common/ProductInfoDisplay/ProductInfoDisplay';
// import InfoDialogModal from 'components/common/InfoDialogModal';
// import ConfirmDialogModal from 'components/common/ConfirmDialogModal/ConfirmDialogModal';

import { checkCurrentUnFinishTask } from 'redux/actions/stationAction';
import './ReplenishOperationPage.css';
import * as log4js from 'log4js2';

const LOCATION_TYPE = 0;
const PRODUCT_TYPE = 1;

const status = {
  FIRST_LOCATION_SCAN: '20',
  PRODUCT_SCAN: '21',
  SECOND_LOCATION_SCAN: '22',
};

const pickScanMessage = {
  0: 'operation.scanLocation',
  1: 'operation.pickAndScanProduct',
  2: 'operation.scanLocation',
};

const replenishScanMessage = {
  0: 'operation.scanLocation',
  1: 'operation.scanAndPlaceProduct',
  2: 'operation.scanLocation',
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
    // openWrongProductModal: false,
    // openChangeLocationModal: false,
    // warningMessage: {
    //   onCloseFunc: () => {},
    //   headerText: '',
    //   contentText: '',
    // },
    stillTask: 0,
    taskStatus: 0,
    actionType: 0,
  };

  log = log4js.getLogger('ReplenishOperPage');

  businessMode = process.env.REACT_APP_BUSINESS_MODE;

  productInterval = {};

  wrongBoxWarningMessage = {
    onCloseFunc: this.closeWrongBoxModal,
    headerText: 'Change Location',
    contentText: 'You scanned a different location! Are you sure?',
  };

  wrongProductWarningMessage = {
    onCloseFunc: this.closeWrongProductModal,
    headerText: 'Wrong Product',
    contentText: 'You scanned a wrong product! Please make sure you have the right product and try again.',
  };

  finishedOrder = {
    binNum: 3,
    orderNo: '235345',
  };

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
    clearInterval(this.productInterval);
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
    this.productInterval = setInterval(() => {
      if (!isReceive) {
        api.replenish.getReceiveProductInfo().then((res) => {
          console.log('GET PRODUCT', res);
          if (res.success) {
            this.setState({
              taskStatus: res.data.taskProgress,
              currentReplenishProduct: res.data.deliveryTask || {},
              currentHighlightBox: {
                row: res.data.shelfId,
                column: res.data.boxId,
              },
              stillTask: res.data.stillTask,
              actionType: res.data.type,
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
        clearInterval(this.productInterval);
      }
    }, 3000);
  }

  /* Production */
  handleScanKeyPress(e) {
    if (e.key === 'Enter' && e.target.value) {
      e.persist();

      this.logInfo(`[SCANNED] ${e.target.value}`);
      const scannedValue = e.target.value;
      let scanType;

      const { taskStatus } = this.state;
      if (taskStatus === 0 || taskStatus === 2) {
        scanType = LOCATION_TYPE;
      } else if (taskStatus === 1) {
        scanType = PRODUCT_TYPE;
      } else {
        scanType = null;
      }

      const { t } = this.props;
      api.replenish.pushReceiveProcess(scanType, scannedValue).then((res) => {
        console.log('code:', res);
        switch (res.code) {
          case status.FIRST_LOCATION_SCAN:
            toast.success(t('operation.correctLocation'));
            this.setState({ taskStatus: taskStatus + 1 });
            break;
          case status.PRODUCT_SCAN:
            toast.success(t('operation.correctProduct'));
            this.setState({
              taskStatus: taskStatus + 1,
            });
            break;
          case status.SECOND_LOCATION_SCAN:
            toast.success(t('operation.correctLocation'));
            if (this.state.stillTask === 0) {
              toast.success('All Task Finished');
              clearInterval(this.productInterval);
              this.props.history.push('/pick-task');
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
      currentHighlightBox } = this.state;
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
                    {t(scanMessage[taskStatus])}
                  </div>
                  <div className="scan-input-holder">
                    <Input
                      type="text"
                      placeholder="Enter or Scan Box Barcode"
                      ref={this.scanInputRef}
                      onKeyPress={this.handleScanKeyPress}
                    />
                  </div>
                </div>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        {/* <WarningModal
          open={this.state.openWrongProductModal}
          onClose={warningMessage.onCloseFunc.bind(this)} // eslint-disable-line
          headerText={warningMessage.headerText}
          contentText={warningMessage.contentText}
        />

        <ConfirmDialogModal
          size="small"
          open={openChangeLocationModal}
          close={this.closeWrongBoxModal}
          header="Change Location"
          content="You scanned a different location! Are you sure?"
        />

        <InfoDialogModal
          open={this.state.openTaskFinishModal}
          onClose={this.handleTaskFinishClose}
          headerText="Finished"
          contentText="Yay! All orders are finished"
        /> */}
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
