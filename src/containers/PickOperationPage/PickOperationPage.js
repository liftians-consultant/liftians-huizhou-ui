import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Grid, Dimmer, Loader, Input } from 'semantic-ui-react';
import { toast } from 'react-toastify';

import api from 'api';
import ProductInfoDisplay from 'components/common/ProductInfoDisplay/ProductInfoDisplay';
import WarningModal from 'components/common/WarningModal/WarningModal';
import WrongProductModal from 'components/Operation/WrongProductModal/WrongProductModal';
import PodShelfInfo from 'components/Operation/PodShelfInfo/PodShelfInfo';
import ConfirmDialogModal from 'components/common/ConfirmDialogModal/ConfirmDialogModal';
import InfoDialogModal from 'components/common/InfoDialogModal';

import {
  getStationDeviceList,
  addHoldersToSetupWaitlist,
  addBinToHolder,
  unassignBinFromHolder,
  hideChangeBinModal,
  changeHolderBin,
} from 'redux/actions/operationAction';
import { checkCurrentUnFinishTask } from 'redux/actions/stationAction';

import './PickOperationPage.css';

import * as log4js from 'log4js2';

const LOCATION_TYPE = 0;
const PRODUCT_TYPE = 1;

const status = {
  FIRST_LOCATION_SCAN: '20',
  PRODUCT_SCAN: '21',
  SECOND_LOCATION_SCAN: '22',
};

const scanMessage = {
  0: '請掃描 location code',
  1: '請掃描 product code',
  2: '請再次掃描 location code',
};

class PickOperationPage extends Component {
  state = {
    podInfo: {
      podId: 0,
      podSide: 0,
      shelfBoxes: [],
      locationBarcode: '',
    },
    currentPickProduct: {
      quantity: 0,
    },
    currentHighlightBox: {
      row: 0,
      column: 0,
    },
    currentBinColor: '',
    orderList: [],
    pickedAmount: 0,
    loading: true,
    barcode: '',
    showBox: false,
    openWrongProductModal: false,
    openShortageConfirmModal: false,
    warningMessage: '',
    openTaskFinishModal: false,
    stillTask: 0,
    taskStatus: 0, // 0 unstart, 1 already scan location, 2 already scan product
  };

  idleCounter = 0;

  log = log4js.getLogger('PickOperationPage');

  checkPodInterval = {};

  checkETagResondInterval = false;

  businessMode = process.env.REACT_APP_BUSINESS_MODE;

  productInterval = {};

  finishedOrder = {
    binNum: 0,
    orderNo: '235345',
  };

  constructor(props) {
    super(props);

    this.scanInputRef = React.createRef();
    this.orderFinishInputRef = React.createRef();

    // Bind the this context to the handler function
    this.retrieveNextOrder = this.retrieveNextOrder.bind(this);
    this.closeWrongProductModal = this.closeWrongProductModal.bind(this);
    this.handleScanBtnClick = this.handleScanBtnClick.bind(this);
    this.handleScanKeyPress = this.handleScanKeyPress.bind(this);
    this.handleShortageClick = this.handleShortageClick.bind(this);
    this.closeWarningModal = this.closeWarningModal.bind(this);
    this.handleShortageModalConfirmed = this.handleShortageModalConfirmed.bind(this);
  }

  componentWillMount() {
    this.logInfo('Into Pick Operation Page');

    // TODO: Subscribe to websocket
    this.listenToWebSocket();
  }

  componentWillUnmount() {
    this.logInfo('Leaving Pick Operation Page');
    clearInterval(this.productInterval);
  }

  componentDidMount() {
    this.setFocusToScanInput();
  }

  logInfo(msg) {
    this.log.info(msg);
  }

  // mock function for websocket
  listenToWebSocket() {
    // this.getPodInfo();
    this.getProductInfo();
  }

  setFocusToScanInput() {
    this.scanInputRef.current.inputRef.value = '';
    this.scanInputRef.current.focus();
  }

  retrieveNextOrder() {
    this.setState({ loading: true });
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
        // this.setState({ podInfo, loading: false });
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
        api.station.getStationProductInfo().then((res) => {
          if (res.success) {
            this.setState({
              taskStatus: res.data.taskProgress,
              currentPickProduct: res.data.deliveryTask || {},
              currentHighlightBox: {
                row: res.data.shelfId,
                column: res.data.boxId,
              },
              currentBinColor: res.data.binColor,
              showBox: false,
              stillTask: res.data.stillTask,
            }, () => {
              isReceive = true;
            });
          }
        }).catch((err) => {
          this.log.error(`[ERROR] getting products list ${JSON.stringify(err)}`);
          console.error('[ERROR] getting products list', err);
        });
      } else {
        this.logInfo('STOP INTERVAL');
        console.log(`[location] ${this.state.currentPickProduct.locationCode}`);
        console.log(`[product] ${this.state.currentPickProduct.productBarCode}`);
        this.getPodInfo();
        clearInterval(this.productInterval);
      }
    }, 3000);
  }

  closeWarningModal() {
    this.setFocusToScanInput();
    this.setState({ warningMessage: '' });
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

      api.pick.pushDeliveryProcess(scanType, scannedValue).then((res) => {
        console.log('code:', res);
        switch (res.code) {
          case status.FIRST_LOCATION_SCAN:
            toast.success('Correct Location');
            this.setState({ taskStatus: taskStatus + 1 });
            break;
          case status.PRODUCT_SCAN:
            toast.success('Correct Product');
            this.setState({
              taskStatus: taskStatus + 1,
              showBox: true,
            });
            break;
          case status.SECOND_LOCATION_SCAN:
            toast.success('Correct Location');
            this.setState({ showBox: false });
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

  // TODO: change
  handleShortageClick() {
    this.logInfo('[SHORTAGE] Button Clicked!');
    this.setState({ openShortageConfirmModal: true });
  }

  // TODO: change
  handleShortageModalConfirmed(result) {
    if (result) {
      this.logInfo('[SHORTAGE] Modal Confirmed');
      // this.finishPick();
      toast.success('Shortage Confirmed');
    }

    this.setState({ openShortageConfirmModal: false });
  }

  closeWrongProductModal() {
    this.setState({ openWrongProductModal: false });
    this.setFocusToScanInput();
  }

  handleTaskFinishClose() {
    this.setState({ openTaskFinishModal: false });
    this.props.history.push('/pick-task');
  }

  render() {
    const { warningMessage, podInfo, currentPickProduct, pickedAmount, showBox,
      openWrongProductModal, barcode,
      currentHighlightBox, currentBinColor, taskStatus,
    } = this.state;

    return (
      <div className="pick-operation-page">
        <Dimmer active={this.state.loading}>
          <Loader content="Waiting for pod..." indeterminate size="massive" />
        </Dimmer>
        <Grid>
          <Grid.Row>
            <Grid.Column width={5}>
              <PodShelfInfo
                podInfo={podInfo}
                highlightBox={currentHighlightBox}
                onShortageClicked={this.handleShortageClick}
                showAdditionBtns
              />
            </Grid.Column>

            <Grid.Column width={11}>
              <div>
                <ProductInfoDisplay
                  product={currentPickProduct}
                  amount={currentPickProduct.quantity - pickedAmount}
                  currentBarcode={currentPickProduct.productBarCode}
                  showBox={showBox}
                  unit={currentPickProduct.unit}
                  binColor={currentBinColor}
                />
                <div className="action-group-container">
                  <div className="scan-input-group">
                    <br />
                    <div className="scan-description">
                      {scanMessage[taskStatus]}
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
                  {/* <div className="action-btn-group">
                    { process.env.REACT_APP_ENV === 'DEV' && (
                      <Button primary size="medium" onClick={() => this.handleScanBtnClick()}>
                        Scan
                      </Button>
                    )}
                  </div> */}
                </div>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        { openWrongProductModal && (
          <WrongProductModal
            podInfo={podInfo}
            productId={barcode}
            open={openWrongProductModal}
            close={this.closeWrongProductModal}
          />
        )
        }

        { warningMessage && (
          <WarningModal
            open
            onClose={this.closeWarningModal}
            headerText="Warning"
            contentText={warningMessage}
          />
        )
        }

        <ConfirmDialogModal
          size="mini"
          open={this.state.openShortageConfirmModal}
          close={this.handleShortageModalConfirmed}
          header="Shortage"
          content="Are you sure you want to report a shortage?"
        />

        <InfoDialogModal
          open={this.state.openTaskFinishModal}
          onClose={this.handleTaskFinishClose}
          headerText="Finished"
          contentText="Yay! All orders are finished"
        />

      </div>
    );
  }
}

PickOperationPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    username: state.user.username,
    stationId: state.station.id,
    taskCount: state.station.info.taskCount,
    deviceList: state.operation.deviceList,
    binSetupWaitlist: state.operation.binSetupWaitlist,
    currentSetupHolder: state.operation.currentSetupHolder,
    currentSetupHolderIndex: state.operation.currentSetupHolder.deviceIndex,
    openChangeBinModal: state.operation.openChangeBinModal,
  };
}
export default connect(mapStateToProps, {
  getStationDeviceList,
  addHoldersToSetupWaitlist,
  addBinToHolder,
  unassignBinFromHolder,
  hideChangeBinModal,
  changeHolderBin,
  checkCurrentUnFinishTask,
})(PickOperationPage);
