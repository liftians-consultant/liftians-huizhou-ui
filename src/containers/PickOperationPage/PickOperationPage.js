import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';
import _ from 'lodash';
import { Grid, Dimmer, Loader, Input } from 'semantic-ui-react';
import { toast } from 'react-toastify';

import api from 'api';
import ProductInfoDisplay from 'components/common/ProductInfoDisplay/ProductInfoDisplay';
import PodShelfInfo from 'components/Operation/PodShelfInfo/PodShelfInfo';

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
  FIRST_LOCATION_SCAN: '21',
  PRODUCT_SCAN: '22',
  SECOND_LOCATION_SCAN: '1',
};

const pickScanMessage = {
  0: 'operation.scanLocation',
  1: 'operation.pickAndScanProduct',
  2: 'operation.scanLocationAgain',
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
    pickedAmount: 0,
    loading: true,
    stillTask: 0,
    taskStatus: 0, // 0 unstart, 1 already scan location, 2 already scan product
  };

  idleCounter = 0;

  log = log4js.getLogger('PickOperationPage');

  checkPodInterval = {};

  productInterval = {};

  constructor(props) {
    super(props);

    this.scanInputRef = React.createRef();
    this.orderFinishInputRef = React.createRef();

    // Bind the this context to the handler function
    this.retrieveNextOrder = this.retrieveNextOrder.bind(this);
    this.handleScanKeyPress = this.handleScanKeyPress.bind(this);
  }

  componentWillMount() {
    this.logInfo('Into Pick Operation Page');

    // TODO: Subscribe to websocket
    this.listenToWebSocket();
  }

  componentWillUnmount() {
    this.logInfo('Leaving Pick Operation Page');
    clearInterval(window.productInterval);
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
    window.productInterval = setInterval(() => {
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
        clearInterval(window.productInterval);
      }
    }, 500);
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

        if (!res.success) {
          if (res.code === status.FIRST_LOCATION_SCAN) {
            toast.success('Correct Location');
            this.setState({ taskStatus: taskStatus + 1 });
          } else if (res.code === status.PRODUCT_SCAN) {
            toast.success('Correct Product');
            this.setState({
              taskStatus: taskStatus + 1,
            });
          }
        } else if (res.success && res.data.botLeave) {
          toast.success('Correct Location');
          if (this.state.stillTask === 0) {
            toast.success('All Task Finished');

            setTimeout(() => {
              this.props.history.push('/pick-task');
            }, 500);
          }
          this.getProductInfo();
        }
      });

      this.setFocusToScanInput();
    }
  }

  render() {
    const { podInfo, currentPickProduct, pickedAmount,
      currentHighlightBox, currentBinColor, taskStatus,
    } = this.state;

    const { t } = this.props;

    return (
      <div className="pick-operation-page">
        <Dimmer active={this.state.loading}>
          <Loader content={t('operation.waitingForPod')} indeterminate size="massive" />
        </Dimmer>
        <div className="page-title">
          {t('label.pickOperation')}
        </div>
        <div className="order-title">
          OrderNo:
          {' '}
          {currentPickProduct.barCode}
        </div>
        <Grid>
          <Grid.Row>
            <Grid.Column width={5}>
              <PodShelfInfo
                podInfo={podInfo}
                highlightBox={currentHighlightBox}
                showAdditionBtns={false}
              />
            </Grid.Column>

            <Grid.Column width={11}>
              <div>
                <ProductInfoDisplay
                  product={currentPickProduct}
                  amount={currentPickProduct.quantity - pickedAmount}
                  currentBarcode={currentPickProduct.productBarCode}
                  showBox={taskStatus === 2}
                  unit={currentPickProduct.unit}
                  binColor={currentBinColor}
                />
                <div className="action-group-container">
                  <div className="scan-input-group">
                    <br />
                    <div className="scan-description">
                      {t(pickScanMessage[taskStatus])}
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
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

PickOperationPage.propTypes = {
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
    getStationDeviceList,
    addHoldersToSetupWaitlist,
    addBinToHolder,
    unassignBinFromHolder,
    hideChangeBinModal,
    changeHolderBin,
    checkCurrentUnFinishTask,
  }),
  withNamespaces(),
)(PickOperationPage);
