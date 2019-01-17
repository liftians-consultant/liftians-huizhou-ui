import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Grid, Button, Dimmer, Loader, Input } from 'semantic-ui-react';
import { toast } from 'react-toastify';

import api from 'api';
import ETagService from 'services/ETagService';
import ProductInfoDisplay from 'components/common/ProductInfoDisplay/ProductInfoDisplay';
import NumPad from 'components/common/NumPad/NumPad';
import WarningModal from 'components/common/WarningModal/WarningModal';
import BinSetupModal from 'components/common/BinSetupModal/BinSetupModal';
import ChangeBinModal from 'components/Operation/ChangeBinModal/ChangeBinModal';
import BinGroup from 'components/Operation/BinGroup/BinGroup';
import OrderFinishModal from 'components/Operation/OrderFinishModal/OrderFinishModal';
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

class PickOperationPage extends Component {
  state = {
    podInfo: {
      podId: 0,
      podSide: 0,
      shelfBoxes: [],
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
    showBox: true,
    openOrderFinishModal: false,
    openWrongProductModal: false,
    openShortageConfirmModal: false,
    warningMessage: '',
    currentBarcode: '', // just for assembly
    binSetupLoading: false,
    openTaskFinishModal: false,
  };

  taskStatus = 0; // 0 unstart, 1 already scan location, 2 already scan product

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
    this.handleOkBtnClick = this.handleOkBtnClick.bind(this);
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

        this.setState(prevState => ({
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
          },
          loading: false,
        }));
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

    let isReceive = false;
    this.productInterval = setInterval(() => {
      if (!isReceive) {
        api.station.getStationProductInfo().then((res) => {
          if (res.success) {
            this.taskStatus = res.data.taskProgress;
            this.setState({
              currentPickProduct: res.data.deliveryTask || {},
              currentHighlightBox: {
                row: res.data.shelfId,
                column: res.data.boxId,
              },
              currentBinColor: res.data.binColor,
              showBox: false,
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

      console.log('before', this.taskStatus);
      if (this.taskStatus === 0 || this.taskStatus === 2) {
        scanType = LOCATION_TYPE;
      } else if (this.taskStatus === 1) {
        scanType = PRODUCT_TYPE;
      } else {
        scanType = null;
      }

      api.pick.pushDeliveryProcess(scanType, scannedValue).then((res) => {
        console.log('code:', res);
        switch (res.code) {
          case 'status.FIRST_LOCATION_SCAN':
            toast.success('Correct Location');
            this.taskStatus = this.taskStatus + 1;
            break;
          case status.PRODUCT_SCAN:
            toast.success('Correct Product');
            this.taskStatus = this.taskStatus + 1;
            this.setState({ showBox: true });
            break;
          case status.SECOND_LOCATION_SCAN:
            toast.success('Correct Location');
            this.setState({ showBox: false });
            this.getProductInfo();

            // if (res.data.isBotLeave) {

            // }
            break;
          default:
            break;
        }
        console.log('after', this.taskStatus);
      });

      this.setFocusToScanInput();
    }
  }

  /* WARNING: SIMULATION ONLY */
  handleScanBtnClick() {
    if (!this.state.showBox) {
      const data = {
        podId: this.state.currentPickProduct.podID,
        podSide: this.state.currentPickProduct.podSide,
        shelfId: this.state.currentPickProduct.shelfID,
        boxId: this.state.currentPickProduct.boxID,
      };
      api.pick.getProductSerialNum(data).then((res) => {
        const barCodeIndex = res.data[0].barCode ? 0 : 1; // sometimes there will have empty barcode data return...
        this.logInfo(`[SCANNED][SIMULATE] Get barcode ${res.data[barCodeIndex].barcode}`);
        if (this.businessMode === 'pharmacy') {
          const barcode = this.state.pickedAmount === 0 ? res.data[barCodeIndex].barcode : `${this.state.barcode},${res.data[barCodeIndex].barcode}`;
          const pickedAmount = this.state.pickedAmount + 1;

          ETagService.turnPickLightOnById(this.state.currentPickProduct.binPosition, pickedAmount);
          this.logInfo(this.checkETagResondInterval);
          if (!this.checkETagResondInterval) {
            this.setPharmacyWaitForEtagInterval();
          }

          if (pickedAmount === this.state.currentPickProduct.quantity) {
            this.setState({ showBox: true, barcode, pickedAmount });
          } else {
            this.setState({ barcode, pickedAmount });
          }
        } else if (this.businessMode === 'ecommerce') {
          this.logInfo(`[SCANNED] SIMULATE Barcode: ${res.data[barCodeIndex].barcode}`);
          this.setState({ showBox: true, barcode: res.data[barCodeIndex].barcode });
          this.initPickLight();
        }
      });
    } else {
      this.setState({ barcode: '' });
    }
  }

  handleShortageClick() {
    this.logInfo('[SHORTAGE] Button Clicked!');
    this.setState({ openShortageConfirmModal: true });
  }

  handleShortageModalConfirmed(result) {
    if (result) {
      this.logInfo('[SHORTAGE] Modal Confirmed');
      // this.finishPick();
      toast.success('Shortage Confirmed');
    }

    this.setState({ openShortageConfirmModal: false });
  }

  /* SIMULATION */
  handleWrongProductBtnClick() {

  }


  closeWrongProductModal() {
    this.setState({ openWrongProductModal: false });
    this.setFocusToScanInput();
  }

  handleOkBtnClick() {

  }

  handleTaskFinishClose() {
    this.setState({ openTaskFinishModal: false });
    this.props.history.push('/pick-task');
  }

  render() {
    const { warningMessage, podInfo, currentPickProduct, pickedAmount, showBox,
      orderList, openOrderFinishModal, openWrongProductModal, barcode, currentBarcode,
      binSetupLoading, currentHighlightBox, currentBinColor
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
                orderList={orderList}
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
                    <div className="scan-input-holder">
                      <Input
                        type="text"
                        placeholder="Enter or Scan Box Barcode"
                        ref={this.scanInputRef}
                        onKeyPress={this.handleScanKeyPress}
                      />
                    </div>
                  </div>
                  <div className="action-btn-group">
                    {/* { process.env.REACT_APP_ENV === 'DEV' && (
                      <Button primary size="medium" onClick={() => this.handleScanBtnClick()}>
                        Scan
                      </Button>
                    )} */}
                  </div>
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
  stationId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
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
