import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Segment, Grid, Button, Dimmer, Loader, Input } from 'semantic-ui-react';
import { toast } from 'react-toastify';

import api from 'api';
import PodShelf from 'components/common/PodShelf/PodShelf';
import NumPad from 'components/common/NumPad/NumPad';
import WarningModal from 'components/common/WarningModal/WarningModal';
import ProductInfoDisplay from 'components/common/ProductInfoDisplay/ProductInfoDisplay';
import InfoDialogModal from 'components/common/InfoDialogModal';
import ConfirmDialogModal from 'components/common/ConfirmDialogModal/ConfirmDialogModal';

import { checkCurrentUnFinishTask } from 'redux/actions/stationAction';
import './ReplenishOperationPage.css';
import * as log4js from 'log4js2';


class ReplenishOperationPage extends Component {
  state = {
    podInfo: {
      podId: 0,
      podSide: 0,
      shelfBoxes: [],
    },
    currentReplenishProduct: {
      totalReplenishQuantity: 0,
    },
    taskId: 0,
    replenishedAmount: 0,
    loading: true,
    barcodeList: [],
    boxBarcode: '',
    openWrongProductModal: false,
    openChangeLocationModal: false,
    warningMessage: {
      onCloseFunc: () => {},
      headerText: '',
      contentText: '',
    },
    openTaskFinishModal: false,
  };

  log = log4js.getLogger('ReplenishOperPage');

  businessMode = process.env.REACT_APP_BUSINESS_MODE;

  checkPodInterval = {};

  scanBoxInputRef = null;

  scanProductInputRef = null;

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
    this.scanBoxInputRef = React.createRef();
    this.scanProductInputRef = React.createRef();

    // Bind the this context to the handler function
    this.selectReplenishedAmount = this.selectReplenishedAmount.bind(this);
    this.retrieveNextOrder = this.retrieveNextOrder.bind(this);
    this.handleProductScanBtnClick = this.handleProductScanBtnClick.bind(this);
    this.finishReplenish = this.finishReplenish.bind(this);
    this.closeWrongBoxModal = this.closeWrongBoxModal.bind(this);
    this.closeWrongProductModal = this.closeWrongProductModal.bind(this);
    this.handleBoxScanKeyPress = this.handleBoxScanKeyPress.bind(this);
    this.handleProductScanKeyPress = this.handleProductScanKeyPress.bind(this);
    this.setFocusToInputManual = this.setFocusToInputManual.bind(this);
    this.closeWarningModal = this.closeWarningModal.bind(this);
    this.handleTaskFinishClose = this.handleTaskFinishClose.bind(this);
  }

  componentWillMount() {
    this.logInfo('Enter ReplenishOperationPage');
    this.getUpcomingPod();
  }

  componentWillUnmount() {
    clearInterval(this.checkPodInterval);
  }

  componentDidMount() {
    this.setFocusToBoxScanInput();
  }

  logInfo(msg) {
    this.log.info(msg);
  }

  setFocusToInputManual() {
    if (this.state.boxBarcode) {
      this.setFocusToProductScanInput();
    } else {
      this.setFocusToBoxScanInput();
    }
  }

  setFocusToBoxScanInput() {
    this.scanBoxInputRef.current.focus();
    this.scanBoxInputRef.current.inputRef.value = '';
    this.scanProductInputRef.current.inputRef.value = '';
  }

  setFocusToProductScanInput() {
    this.scanProductInputRef.current.inputRef.value = '';
    this.scanProductInputRef.current.focus();
  }

  selectReplenishedAmount(num) {
    this.setState(prevState => ({ replenishedAmount: prevState.replenishedAmount + num }), () => {
      this.finishReplenish(num);
    });
  }

  getUpcomingPod() {
    // TODO: add simulation mode to .env
    let isRecieve = false;
    let counter = 0;
    this.setState({ loading: true });
    this.checkPodInterval = setInterval(() => {
      if (!isRecieve) {
        counter += 1;

        if (counter > process.env.REACT_APP_PICKING_IDLE_TIME) {
          this.props.checkCurrentUnFinishTask(this.props.stationId).then((response) => {
            this.logInfo(`[GET UPCOMING PDO] Idle: Check num of task at Station: ${response.taskCount}`);
            if (response.taskCount === 0) {
              this.logInfo('[GET UPCOMING POD] Timed out. Jumping back replenish-task page');
              toast.success('All Task Finished!');
              this.setState({ openTaskFinishModal: true });
              clearInterval(this.checkPodInterval);
            } else {
              counter = 0;
            }
          });
        } else {
          api.station.atStationTask(this.props.stationId).then((res) => {
            if (res.data > 0) {
              this.logInfo(`Pod arrive station with TaskId ${res.data}`);
              this.setState({ taskId: res.data }, () => { isRecieve = true; });
            }
          });
        }
      } else {
        this.logInfo('[GET UPCOMING POD] Stop interval');
        clearInterval(this.checkPodInterval);
        this.retrieveNextOrder();
        this.setFocusToBoxScanInput();
      }
    }, 1500);
  }

  // eslint-disable-next-line
  validateReplenishData(data) {
    if (data.taskId > 0 && data.boxBarcode !== '' && data.productBarcodeList !== '' && data.replenishQty > 0) {
      return true;
    }
    return false;
  }

  finishReplenish(replenishAmount, isNextPod = false, retry = false) {
    this.setState({ loading: true });
    const product = this.state.currentReplenishProduct;
    const barcodeList = this.state.barcodeList.filter(o => o.scanned).map(o => o.barcode).join(','); // only take barcode that are scanned
    // if (this.state.businessMode === 'pharmacy' ) {
    //   barcodeList = this.state.barcodeList.slice(0, replenishAmount).join(',');
    // }
    const data = {
      taskId: this.state.taskId,
      boxBarcode: this.state.boxBarcode,
      sourceLinesId: product.source_lines_id,
      productId: product.productID,
      productBarcodeList: barcodeList,
      replenishQty: replenishAmount,
      locateActType: product.locate_act_type,
    };

    if (!this.validateReplenishData(data)) {
      const warningMessage = {
        onCloseFunc: this.closeWarningModal,
        headerText: 'Invalid Data',
        contentText: 'The replenish data is not correct. Please contact your admin and make sure you have the right data',
      };
      this.setState({ openWrongProductModal: true, warningMessage });
      return;
    }

    this.logInfo(`[REPLENISH] Request data ${data}`);
    this.logInfo(`[REPLENISH] BoxBarcode ${data.boxBarcode}`);
    api.replenish.atStationSubmitReplenishProduct(data).then((res) => {
      if (res.data) { // return 1 if success
        this.logInfo('[REPLENISH] Success');

        if (isNextPod) {
          this.forcePodToLeaveStation();
          return;
        }

        if (this.state.replenishedAmount === parseInt(this.state.currentReplenishProduct.totalReplenishQuantity, 10)) {
          this.logInfo('[REPLENISH] Order Finish, Retrieving next bill');
          this.retrieveNextOrder();
          this.setFocusToBoxScanInput();
        } else {
          // replenish not yet finished
          this.setFocusToProductScanInput();
          this.setState({ loading: false });
        }
      } else {
        // TODO: ERROR MESSAGE
        this.logInfo('[REPLENISH] Failed');
        let { replenishedAmount } = this.state;
        replenishedAmount -= replenishAmount;
        this.setState({ loading: false, replenishedAmount });
      }
    }).catch((err) => {
      this.logInfo('[ERROR] atStationAfterReplenishProduct', err);
      if (!retry) {
        this.logInfo('[REPLENISH] Retrying');
        this.finishReplenish(replenishAmount, isNextPod, true);
      }
    });
  }

  retrieveNextOrder() {
    this.setState({ loading: true });
    this.getProductList();
    // this.getPodInfo();
  }

  forcePodToLeaveStation() {
    api.station.forcePodToLeaveStationByTaskId(this.props.stationId, this.state.taskId).then(() => {
      this.logInfo(`[REPLENISH] Force Pod with TaskId ${this.state.taskId} to leave`);
      this.getUpcomingPod();
      this.setFocusToBoxScanInput();
    });
  }

  getPodInfo() {
    this.logInfo(`[REPLENISH] GetPodInfo: current replenishing product: ${this.state.currentReplenishProduct}`);

    this.getProductBarcodeList(); // SIMULATION: GET BARCODE

    api.station.getPodLayoutInfoByTaskID(this.state.taskId).then((res) => {
      // console.log(res.data);
      if (res.data.length) {
        const podInfo = {
          ...this.state.podInfo, // eslint-disable-line
          shelfBoxes: _.chain(res.data).sortBy('shelfID').map(elmt => parseInt(elmt.maxBox, 10)).reverse()
            .value(),
        };
        this.setState({ podInfo, loading: false });
      }
    }).catch((err) => {
      console.error('[ERROR] Getting pod info', err);
    });
  }

  getProductList() {
    api.replenish.getReplenishInfoByTaskId(this.state.taskId).then((res) => {
      // console.log(res.data);
      // res.data = testProduct;
      if (res.data.length) {
        this.setState({
          currentReplenishProduct: res.data[0],
          podInfo: {
            podId: res.data[0].podID,
            podSide: res.data[0].podSide,
            shelfBoxes: [],
          },
          replenishedAmount: 0,
          boxBarcode: '',
        }, this.getPodInfo);
      } else {
        // when nothing return, that means the pod is finished
        // and need to wait for the next pod come in to station
        this.logInfo('[GET PRODUCT LIST] No order return from the server');
        this.getUpcomingPod();
      }
    }).catch((err) => {
      console.error('[ERROR] Getting products list', err);
    });
  }

  scanValidation(barcode) {
    // if (this.businessMode === 'pharmacy') {
    if (barcode === this.state.currentReplenishProduct.scanCode) {
      return true;
    }
    return false;

    // } else if (this.businessMode === 'ecommerce') {
    //   if (barcode === this.state.currentReplenishProduct.barcode) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // }
  }

  getProductBarcodeList(callback) {
    const { productID, source_lines_id } = this.state.currentReplenishProduct; // eslint-disable-line
    api.replenish.getProductInfoByTaskId(this.state.taskId, source_lines_id, productID, 100).then((res) => {
      if (res.data) {
        const barcodeList = res.data.map(item => ({
          barcode: item.productBarCode,
          scanned: false,
        }));
        this.logInfo(`[GET PRODUCT BARCODE LIST] Barcode List: ${barcodeList}`);
        this.setState({ barcodeList });
      }

      if (callback) {
        callback();
      }
    }).catch((err) => {
      this.logInfo('[ERROR] WHILE GETTING BARCODE LIST');
      console.log(err);
    });
  }

  /* Simulation: when the user scan the product */
  handleProductScanBtnClick() {
    if (this.businessMode === 'pharmacy') {
      // all product have unique barcode. scann all product then send out the finish request

      this.setState(prevState => ({ replenishedAmount: prevState.replenishedAmount + 1 }), () => {
        this.logInfo(`[SCAN PRODUCT] Replenished amount: ${this.state.replenishedAmount}`);
        if (this.state.replenishedAmount === this.state.currentReplenishProduct.totalReplenishQuantity) {
          this.finishReplenish(this.state.replenishedAmount);
        }
      });
    } else if (this.businessMode === 'ecommerce') {
      // only one barcode will be return and all product use same barcode
      // scanned once, send request everything number pad is clicked.
      this.logInfo('[SCAN PRODUCT] SIMULATION: product scanned');
      this.setState(prevState => ({ barcodeList: [{ barcode: prevState.currentReplenishProduct.scanCode, scanned: true }] }));
    }
  }


  /* Production Scan box handler */
  handleBoxScanKeyPress(e) {
    if (e.key === 'Enter' && e.target.value) {
      const value = e.target.value;
      this.logInfo(`[SCAN BOX] Box scanned: ${value}`);

      // validate box barcode
      const productInfo = this.state.currentReplenishProduct;
      const correctBoxCode = 1000000000 + (1000 * productInfo.podID) + productInfo.podSide * 100 + productInfo.shelfID * 10 + productInfo.boxID;
      if (value === String(correctBoxCode)) {
        this.logInfo('[SCAN BOX] Box correct');
        this.setState({ boxBarcode: value }, () => {
          this.setFocusToProductScanInput();
        });
      } else {
        const podId = parseInt(value.substring(1, 6), 10);
        const podSide = parseInt(value.substring(7, 8), 10);
        if (podId !== productInfo.podID || podSide !== productInfo.podSide) {
          toast.warn('Wrong pod or pod side. Please make sure again.');
          this.setFocusToBoxScanInput();
          return;
        }
        this.logInfo('[SCAN BOX] Different Box');
        this.setState({ openChangeLocationModal: true, boxBarcode: value });
      }
    }
  }

  validatePharmacyBarcode(barcode) {
    return new Promise((resolve) => {
      const barcodeIndex = _.findIndex(this.state.barcodeList, o => o.barcode === barcode);
      // validate if barcode is in barcode list
      if (barcodeIndex === -1) { // TODO: this is not right, its an object now. User lodash
        resolve({ valid: false, message: 'This barcode is not in the replenish list.' });
      }

      // check for duplicate
      if (this.state.barcodeList[barcodeIndex].scanned === true) {
        resolve({ valid: false, message: 'Duplicate barcode!' });
      }

      // // check if barcode on shelf
      // api.pick.getInventoryByProductBarcode(barcode, this.state.podInfo.podId, this.state.podInfo.podSide).then( res => {
      //   // api.pick.getInventoryByProductBarcode('T168000', 33 , 0).then( res => {
      //   console.log('[VALIDATE BARCODE]', res);
      //   if (res.data.length > 0) { // barcode is on the shelf
      //     resolve({ valid: true });
      //   } else {
      //     resolve({ valid: false, message: 'Wrong Product (this barcode is not on the shelf)'});
      //   }
      // }).catch(err => {
      //   resolve({ valid: false, message: 'Something went wrong while validating the barcode.'});
      // });
      const { barcodeList } = this.state;
      barcodeList[barcodeIndex].scanned = true;
      this.logInfo(`[SCAN PRODUCT] Barcode List ${barcodeList}`);
      this.setState({ barcodeList }, () => resolve({ valid: true }));
    });
  }

  // Production
  handleProductScanKeyPress(e) {
    if (e.key === 'Enter' && e.target.value) {
      this.logInfo(`[SCAN PRODUCT] Product Scanned: ${e.target.value}`);

      if (this.businessMode === 'pharmacy') {
        this.validatePharmacyBarcode(e.target.value).then((result) => {
          if (result.valid) {
            // all product have unique barcode. scann all product then send out the finish request
            this.setState(prevState => ({ replenishedAmount: prevState.replenishedAmount + 1 }), () => {
              this.logInfo(`[SCAN PRODUCT] Replenished amount: ${this.state.replenishedAmount}`);
              this.setFocusToProductScanInput();
              if (this.state.replenishedAmount === this.state.currentReplenishProduct.totalReplenishQuantity) {
                this.finishReplenish(this.state.replenishedAmount);
              }
            });
          } else {
            this.logInfo('[SCANNED] Invalid Barcode');
            const warningMessage = {
              onCloseFunc: this.closeWrongProductModal,
              headerText: 'Warning',
              contentText: result.message,
            };
            this.setState({ openWrongProductModal: true, warningMessage });
          }
        });
      } else if (this.businessMode === 'ecommerce') {
        // only one barcode will be return and all product use same barcode
        // scanned once, send request everything number pad is clicked.
        if (this.scanValidation(e.target.value)) {
          this.logInfo('[SCAN PRODUCT] Product correct');
          this.setState({ barcodeList: [{ barcode: e.target.value, scanned: true }] });
        } else {
          this.logInfo('[SCAN PRODUCT] Wrong product!');
          this.setState({ openWrongProductModal: true, warningMessage: this.wrongProductWarningMessage });
          setTimeout(() => {
            this.closeWrongProductModal();
          }, 3000);
        }
      }
    }
  }

  /* Simulation: when user scan the box barcode */
  handleScanBoxBtnClick() {
    const productInfo = this.state.currentReplenishProduct;
    // generate box barcode
    const boxBarcode = 1000000000 + (1000 * productInfo.podID) + productInfo.podSide * 100 + productInfo.shelfID * 10 + productInfo.boxID;
    console.log(`[SCAN BOX] SIMULATION: ${boxBarcode}`);
    this.setState({ boxBarcode });
    this.setFocusToProductScanInput();
  }

  handleNextPodBtnClick() {
    if (this.businessMode === 'pharmacy') {
      this.finishReplenish(this.state.replenishedAmount, true);
    } else if (this.businessMode === 'ecommerce') {
      this.forcePodToLeaveStation();
    }
  }

  handleWrongProductBtnClick() {
    this.setState({ openWrongProductModal: true });
  }

  closeWrongBoxModal(result) {
    this.setState({ openChangeLocationModal: false });
    if (result) { // change box
      // check if new box is used
      const { boxBarcode } = this.state;
      api.pick.getProductByLocationCode(boxBarcode).then((res) => {
        if (res.data) {
          if (res.data.length > 0) {
            toast.warn(`${boxBarcode} is already registered. Please either use the suggested box or choose a empty box.`);
            this.setFocusToBoxScanInput();
          } else {
            toast.success(`${boxBarcode} is free. Please scan product.`);
            this.setFocusToProductScanInput();
          }
        }
      }).catch(() => toast.error('[SERVER ERROR] Cannot get product by location code.'));
    } else { // dont change box
      this.setFocusToBoxScanInput();
    }
  }

  closeWrongProductModal() {
    this.setState({ openWrongProductModal: false });
    this.setFocusToProductScanInput();
  }

  closeWarningModal() {
    this.setState({ openWrongProductModal: false });
  }

  handleTaskFinishClose() {
    this.setState({ openTaskFinishModal: false });
    this.props.history.push('/replenish-task');
  }

  render() {
    const { podInfo, currentReplenishProduct, replenishedAmount, barcodeList, boxBarcode, warningMessage, openChangeLocationModal } = this.state;
    const highlightBox = {
      row: currentReplenishProduct ? parseInt(currentReplenishProduct.shelfID, 10) : 0,
      column: currentReplenishProduct ? parseInt(currentReplenishProduct.boxID, 10) : 0,
    };
    const isScanned = (barcodeList.filter(o => o.scanned).length > 0);

    return (
      <div className="replenish-operation-page">
        <Dimmer active={this.state.loading}>
          <Loader content="Waiting for pod..." indeterminate size="massive" />
        </Dimmer>
        <Grid>
          <Grid.Row>
            <Grid.Column width={5}>
              <div className="pod-info-block">
                <span>
                  Pod #
                  {podInfo.podId}
                  {' '}

                </span>
                <span>
                  -
                  {podInfo.podSide}
                </span>
              </div>
              <Segment.Group>
                <Segment>
                  <PodShelf podInfo={podInfo} highlightBox={highlightBox} />
                </Segment>
              </Segment.Group>

              <div>
                <Button color="red">
                  Shortage
                </Button>
              </div>
            </Grid.Column>

            <Grid.Column width={11}>
              <ProductInfoDisplay
                product={currentReplenishProduct}
                amount={currentReplenishProduct.totalReplenishQuantity - this.state.replenishedAmount}
                currentBarcode={currentReplenishProduct.scanCode}
              />
              <div className="action-group-container">
                <div className="scan-input-group">
                  <div className="scan-input-holder">
                    <Input
                      type="text"
                      placeholder="Enter or Scan Box Barcode"
                      // value={boxBarcode}
                      ref={this.scanBoxInputRef}
                      onKeyPress={this.handleBoxScanKeyPress}
                    />
                  </div>
                  <div className="scan-input-holder">
                    <Input
                      type="text"
                      placeholder="Enter or scan Product Barcode"
                      ref={this.scanProductInputRef}
                      onKeyPress={this.handleProductScanKeyPress}
                    />
                  </div>
                </div>
                <div className="action-btn-group">
                  {/* <Button primary onClick={ () => this.setFocusToInputManual() }>Set Focus</Button> */}
                  <Button primary size="medium" onClick={() => this.handleNextPodBtnClick()}>
                    Next Pod
                  </Button>
                </div>

                { process.env.REACT_APP_ENV === 'DEV' && (
                  <div>
                    <Button primary size="medium" onClick={() => this.handleScanBoxBtnClick()}>
                      Scan Box
                    </Button>
                    <Button primary size="medium" onClick={() => this.handleProductScanBtnClick()} disabled={this.state.boxBarcode === 0}>
                      Scan Product
                    </Button>
                  </div>
                )}

                { this.businessMode === 'ecommerce' && ((isScanned && boxBarcode) && (
                  <NumPad
                    highlightAmount={currentReplenishProduct.totalReplenishQuantity - replenishedAmount}
                    callback={this.selectReplenishedAmount}
                    disabled={!isScanned || !boxBarcode}
                  />
                ))}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <WarningModal
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
        />
      </div>
    );
  }
}

ReplenishOperationPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  stationId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    stationId: state.station.id,
  };
}

export default connect(mapStateToProps, {
  checkCurrentUnFinishTask,
})(ReplenishOperationPage);
