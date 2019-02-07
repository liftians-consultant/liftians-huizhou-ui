import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';
import { Grid, Button, Input, Icon } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import _ from 'lodash';

import api from 'api';
import OrderListTable from 'components/common/OrderListTable/OrderListTable';
import OperationTaskMenu from 'components/OperationTaskMenu/OperationTaskMenu';
import InputDialogModal from 'components/common/InputDialogModal';

import { setStationTaskType, checkCurrentUnFinishTask } from 'redux/actions/stationAction';
import { getTaskStatus, getCancelReasonList } from 'redux/actions/statusAction';
import { resetTaskPage, setRemoveDialog } from 'redux/actions/pickTaskAction';

import './PickTaskPage.css';
import * as log4js from 'log4js2';

class PickTaskPage extends Component {
  log = log4js.getLogger('PickTaskPage');

  locale = process.env.REACT_APP_LOCALE;

  pageSize = 10;

  deleteIndex = 0;

  orderLimit = 10;

  taskTypeOption = [
    { key: 1, tranlationKey: 'label.unprocessed', index: 1, value: '0' },
    { key: 2, tranlationKey: 'label.inProgess', index: 2, value: '1' },
    { key: 3, tranlationKey: 'label.finished', index: 3, value: '5' },
    { key: 4, tranlationKey: 'label.cancelled', index: 4, value: '-1' },
  ];

  isLoaded = false;

  state = {
    activeTaskType: '0',
    ordersList: [],
    inputLoading: false,
    tableLoading: false,
    pages: 1,
    openBinScanModal: false,
    lastOrderBarcode: '',
    binScanErrorMessage: '',
    cancelErrorMessage: '',
    isLimit: false,
  }

  NewOrderTableColumn = [
    {
      key: 'label.barcode',
      accessor: 'barCode',
    }, {
      key: 'label.productBarcode',
      accessor: 'productBarCode',
      maxWidth: 100,
    }, {
      key: 'label.quantity',
      accessor: 'quantity',
      maxWidth: 100,
    }, {
      key: 'label.unit',
      accessor: 'unit',
      maxWidth: 80,
    }, {
      key: 'label.batch',
      accessor: 'batch',
      maxWidth: 80,
    }, {
      key: 'label.manufacturer',
      accessor: 'manufacturerName',
    }, {
      key: 'label.status',
      accessor: 'statusName',
    }, {
      key: 'label.remove',
      Cell: row => (
        <Icon name="delete" size="big" onClick={() => this.handleRemoveOrder(row.index)} />
      ),
      maxWidth: 100,
    },
  ];

  OrdersTableColumn = [];

  constructor() {
    super();

    this.scanRef = React.createRef();
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFetchTableData = this.handleFetchTableData.bind(this);
    this.handleStartBtn = this.handleStartBtn.bind(this);
    this.handleBinScanSubmit = this.handleBinScanSubmit.bind(this);
    this.handleRemoveScanSubmit = this.handleRemoveScanSubmit.bind(this);
  }

  componentWillMount() {
    clearInterval(window.productInterval);

    this.translateTableColumn();

    this.setStationTaskType();
    this.startStationOperationCall();

    this.props.getCancelReasonList();

    this.props.getTaskStatus().then(() => {
      this.getStationOrderList([1], 1);
      this.checkTaskCountOverflow();
      this.isLoaded = true;
    });
  }

  componentDidMount() {
    this.focusInput();
  }

  componentWillUnmount() {
    this.props.resetTaskPage();
  }

  focusInput() {
    this.scanRef.current.focus();
  }

  translateTableColumn = () => {
    const { t } = this.props;
    const newColumn = this.NewOrderTableColumn.map((obj) => {
      obj.Header = t(obj.key);
      return obj;
    });

    const newOptions = this.taskTypeOption.map((obj) => {
      obj.text = t(obj.tranlationKey);
      return obj;
    });

    this.NewOrderTableColumn = [...newColumn];
    newColumn.pop();
    this.OrdersTableColumn = newColumn;

    this.taskTypeOption = [...newOptions];
  }

  transformOrderRecord(orderList) {
    const { taskStatusList } = this.props;

    let array = orderList.map((obj) => {
      if (!taskStatusList[obj.stat]) return obj;
      obj.statusName = taskStatusList[obj.stat].name;
      return obj;
    });

    array = _.sortBy(array, ['id']);

    return array;
  }

  preProcessInputValue(value) {
    if (value === 'START') {
      this.handleStartBtn();
      return true;
    }

    return false;
  }

  handleFetchTableData(state) {
    if (!this.isLoaded) return;

    const { activeTaskType } = this.state;
    const newPage = state.page + 1; // index start from 0.
    if (activeTaskType === '0') {
      this.getStationOrderList([1], newPage);
    } else if (activeTaskType === '1') {
      this.getStationOrderList([2, 3, 4], newPage);
    } else if (activeTaskType === '5') {
      this.getStationOrderList([5], newPage);
    } else if (activeTaskType === '-1') {
      this.getStationOrderList([-1], newPage);
    }
  }

  handleInputChange(e) {
    if (e.key === 'Enter' && e.target.value) {
      e.persist();

      if (this.preProcessInputValue(e.target.value)) {
        return;
      }

      this.setState({
        inputLoading: true,
        lastOrderBarcode: e.target.value,
        activeTaskType: '0',
      });

      api.pick.retrieveOrderFromAsm(e.target.value).then((res) => {
        this.setState({ inputLoading: false });
        if (res.success) {
          this.getStationOrderList([1], 1, (result) => {
            if (result.data.list.length > 0) {
              this.setState({ openBinScanModal: true });
            }
            this.checkTaskCountOverflow();
          });

          this.scanRef.current.inputRef.value = '';
          this.scanRef.current.focus();
        }
      }).catch(() => {
        toast.error(this.props.t('message.error.retreiveOrderFromAsm'));
        this.setState({ inputLoading: false });
      });
    }
  }

  getStationOrderList(taskTypeList, pageNum, callback = () => {}) {
    const { stationId } = this.props;
    this.setState({ tableLoading: true });

    // get unstarted order
    api.pick.getStationOrderList(stationId, taskTypeList, pageNum, this.pageSize).then((res) => {
      if (res.success) {
        this.setState({
          tableLoading: false,
          ordersList: this.transformOrderRecord(res.data.list),
          pages: res.data.pageNum,
        }, () => {
          callback(res);
        });
      }
    }).catch(() => {
      this.setState({ tableLoading: false });
    });
  }

  checkTaskCountOverflow() {
    const { stationId } = this.props;

    api.pick.getStationOrderList(stationId, [1, 2, 3, 4], 1, this.pageSize).then((res) => {
      if (res.success) {
        if (res.data.list.length >= this.orderLimit) {
          this.setState({ isLimit: true });
        } else {
          this.setState({ isLimit: false });
        }
      }
    }).catch(() => {
    });
  }

  setStationTaskType() {
    this.props.setStationTaskType('P');
  }

  startStationOperationCall() {
    api.station.startStationOperation('P').then((res) => {
      if (!res.success) {
        toast.error(this.props.t('message.eerror.cannotStartStation'));
      }
      this.log.info('[PICK TASK] Station Started with P');
    }).catch(() => {
      toast.error(this.props.t('message.error.contactAdmin'));
      this.log.info('[PICK TASK] ERROR');
    });
  }

  bindBinToOrder = (binBarCode, orderBarCode) => {
    api.pick.bindBinToOrder(orderBarCode, binBarCode).then((res) => {
      if (!res.success) {
        return;
      }

      toast.success(this.props.t('message.binBindToOrder', { orderBarCode, binBarCode }));

      this.setState({ openBinScanModal: false });
      this.focusInput();
    });
  }

  handleTaskChange = (e, { value }) => {
    this.setState({ activeTaskType: value }, () => {
      if (value === '0') {
        this.getStationOrderList([1], 1);
      } else if (value === '1') {
        this.getStationOrderList([2, 3, 4], 1);
      } else if (value === '5') {
        this.getStationOrderList([5], 1);
      } else if (value === '-1') {
        this.getStationOrderList([-1], 1);
      }
    });
  }

  handleStartBtn = () => {
    this.log.info('[HANDLE START BTN] Btn clicked');
    const barcodeList = this.state.ordersList.map(obj => obj.id);
    api.pick.startPickTask(barcodeList).then((res) => {
      if (res.success) {
        if (res.data.success === 0) {
          toast.error(this.props.t('message.error.cannotStartOperation'));
          return;
        }
        this.props.history.push('/operation');
      }
    });
  }

  handleRemoveOrder = (index) => {
    this.deleteIndex = index;
    this.props.setRemoveDialog(true);
  }

  handleRemoveScanSubmit = (cancelCodeStr) => {
    // validate cancel code
    if (_.has(this.props.cancelReasonList, cancelCodeStr)) {
      toast.error(this.props.t('message.error.cancelCodeNotExist'));
      return;
    }

    this.getStationOrderList([1], 1);
    this.props.setRemoveDialog(false);
  }

  handleBinScanSubmit = (value) => {
    if (value === '') {
      this.setState({ binScanErrorMessage: this.props.t('message.cannotBeEmpty') });
      return;
    }

    const { lastOrderBarcode } = this.state;
    this.bindBinToOrder(value, lastOrderBarcode);
  }

  render() {
    const {
      tableLoading, ordersList, inputLoading, pages, activeTaskType,
      openBinScanModal, binScanErrorMessage, cancelErrorMessage, isLimit,
    } = this.state;
    const { t, openRemoveModal } = this.props;

    return (
      <div className="ui pick-task-page-container">
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <OperationTaskMenu
                activeTaskType={activeTaskType}
                taskTypeOption={this.taskTypeOption}
                onTaskChange={this.handleTaskChange}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <div className="orderlist-table-container">
                { activeTaskType === '0' ? (
                  <OrderListTable
                    listData={ordersList}
                    loading={tableLoading}
                    columns={this.NewOrderTableColumn}
                    onFetchData={this.handleFetchTableData}
                    pages={pages}
                  />
                ) : (
                  <OrderListTable
                    listData={ordersList}
                    loading={tableLoading}
                    columns={this.OrdersTableColumn}
                    onFetchData={this.handleFetchTableData}
                    pages={pages}
                  />
                )}
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={5}>
              { activeTaskType === '0' && (
                <Input
                  onKeyPress={this.handleInputChange}
                  size="big"
                  ref={this.scanRef}
                  loading={inputLoading}
                  disabled={isLimit}
                  placeholder={t('label.scanOrderBarcode')}
                />
              )}
            </Grid.Column>
            <Grid.Column width={11}>
              <div className="order-list-btn-group">
                <Button
                  size="huge"
                  primary
                  onClick={() => this.handleStartBtn()}
                  disabled={activeTaskType !== '0' || ordersList.length === 0}
                >
                  {t('label.start')}
                </Button>
                {/* <Button size="huge" secondary onClick={() => this.handlePauseBtn()}>
                  {t('label.pause')}
                </Button> */}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <InputDialogModal
          open={openBinScanModal}
          headerText={t('label.scanBinBarcode')}
          onSubmit={this.handleBinScanSubmit}
          errorMessage={binScanErrorMessage}
          inputType="text"
        />

        <InputDialogModal
          open={openRemoveModal}
          headerText={t('label.cancelOrder')}
          onSubmit={this.handleRemoveScanSubmit}
          errorMessage={cancelErrorMessage}
          inputType="text"
          onClose={() => this.props.setRemoveDialog(false)}
        />
      </div>
    );
  }
}

PickTaskPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  stationId: PropTypes.string.isRequired,
  setStationTaskType: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    username: state.user.username,
    stationId: state.station.id,
    taskStatusList: state.status.taskStatusList,
    cancelReasonList: state.status.cancelReasonList,
    openRemoveModal: state.pickTask.openRemoveDialog,
    // removeScanErrorMessage: state.
  };
}

export default compose(
  connect(mapStateToProps, {
    setStationTaskType,
    checkCurrentUnFinishTask,
    getTaskStatus,
    getCancelReasonList,
    resetTaskPage,
    setRemoveDialog,
  }),
  withNamespaces(),
)(PickTaskPage);
