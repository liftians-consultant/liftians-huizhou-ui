import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';
import { Grid, Button, Input, Icon } from 'semantic-ui-react';
import { toast } from 'react-toastify';

import api from 'api';
import OrderListTable from 'components/common/OrderListTable/OrderListTable';
// import PickOrderTableColumns from 'models/PickOrderTableModel';
import OperationTaskMenu from 'components/OperationTaskMenu/OperationTaskMenu';
import InputDialogModal from 'components/common/InputDialogModal';
import ConfirmDialogModal from 'components/common/ConfirmDialogModal/ConfirmDialogModal';

import { setStationTaskType, checkCurrentUnFinishTask } from 'redux/actions/stationAction';
import { getTaskStatus } from 'redux/actions/statusAction';

import './PickTaskPage.css';
import * as log4js from 'log4js2';

class PickTaskPage extends Component {
  log = log4js.getLogger('PickTaskPage');

  locale = process.env.REACT_APP_LOCALE;

  pageSize = 10;

  deleteIndex = 0;

  taskTypeOption = [
    { key: 1, text: 'New', index: 1, value: '0' },
    { key: 2, text: 'In Progress', index: 2, value: '1' },
    { key: 3, text: 'Complete', index: 3, value: '5' },
    { key: 4, text: 'Cancelled', index: 4, value: '5' },
  ];

  isLoaded = false;

  state = {
    activeTaskType: '0',
    newOrdersList: [],
    ordersList: [],
    inputLoading: false,
    tableLoading: false,
    pages: 1,
    openBinScanModal: false,
    lastOrderBarcode: '',
    binBarcode: '',
    openRemoveConfirm: false,
    binScanErrorMessage: '',
  }

  NewOrderTableColumn = [
    {
      key: 'label.barcode',
      accessor: 'barCode',
    }, {
      key: 'label.productId',
      accessor: 'productId',
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
      accessor: 'manufacturer',
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
    this.backBtnHandler = this.backBtnHandler.bind(this);
    this.handleStartBtn = this.handleStartBtn.bind(this);
    this.handleBinScanSubmit = this.handleBinScanSubmit.bind(this);
    this.handleRemoveConfirmAction = this.handleRemoveConfirmAction.bind(this);
  }

  componentWillMount() {
    this.translateTableColumn();

    this.setStationTaskType();
    this.startStationOperationCall();

    this.props.getTaskStatus().then(() => {
      this.getStationOrderList([1], 1);
      this.isLoaded = true;
    });
  }

  componentDidMount() {
    this.focusInput();
  }

  focusInput() {
    this.scanRef.current.focus();
  }

  backBtnHandler = () => {
    console.log('back');
    this.props.history.goBack();
  }

  translateTableColumn = () => {
    const { t } = this.props;
    const newColumn = this.NewOrderTableColumn.map((obj) => {
      obj.Header = t(obj.key);
      return obj;
    });

    this.NewOrderTableColumn = [...newColumn];
    newColumn.pop();
    this.OrdersTableColumn = newColumn;
  }

  transformOrderRecord(orderList) {
    const { taskStatusList } = this.props;
    return orderList.map((obj) => {
      obj.statusName = taskStatusList[obj.stat].name;
      return obj;
    });
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
    if (activeTaskType === '0') {
      this.getStationOrderList([1], state.page);
    } else if (activeTaskType === '1') {
      this.getStationOrderList([2, 3, 4], state.page);
    } else if (activeTaskType === '5') {
      this.getStationOrderList([5], state.page);
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
          const { stationId } = this.props;
          this.setState({ tableLoading: true });

          // get unstarted order
          api.pick.getStationOrderList(stationId, [1], 1, this.pageSize).then((result) => {
            if (result.success) {
              // TODO: Also need to set pages
              this.setState({
                tableLoading: false,
                ordersList: this.transformOrderRecord(result.data),
              }, () => {
                if (result.data.length > 0) {
                  this.setState({ openBinScanModal: true });
                }
              });
            }
          }).catch(() => {
            this.setState({ tableLoading: false });
          });

          this.scanRef.current.inputRef.value = '';
          this.scanRef.current.focus();
        }
      }).catch(() => {
        toast.error('[Server error] Error while retreive order from asm');
        this.setState({ inputLoading: false });
      });
    }
  }

  getStationOrderList(taskTypeList, pageNum) {
    const { stationId } = this.props;
    this.setState({ tableLoading: true });

    // get unstarted order
    api.pick.getStationOrderList(stationId, taskTypeList, pageNum, this.pageSize).then((res) => {
      if (res.success) {
        // TODO: Also need to set pages
        this.setState({
          tableLoading: false,
          ordersList: this.transformOrderRecord(res.data),
        });
      }
    }).catch(() => {
      this.setState({ tableLoading: false });
    });
  }

  setStationTaskType() {
    this.props.setStationTaskType('P');
  }

  startStationOperationCall() {
    api.station.startStationOperation('P').then((res) => {
      if (!res.success) {
        toast.error('Cannot start station. Please contact your system admin');
      }
      this.log.info('[PICK TASK] Station Started with P');
    }).catch(() => {
      toast.error('Server Error. Please contact your system admin');
      this.log.info('[PICK TASK] ERROR');
    });
  }

  bindBinToOrder = (binBarCode, orderBarCode) => {
    api.pick.bindBinToOrder(orderBarCode, binBarCode).then((res) => {
      if (!res.success) {
        this.setState({ binBarcode: '' });
        return;
      }

      toast.success(`${binBarCode} succuessfully bind to ${orderBarCode}`);

      this.setState({ openBinScanModal: false, binBarcode: '' });
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
      }
    });
  }

  handleStartBtn = () => {
    this.log.info('[HANDLE START BTN] Btn clicked');
    // const barcodeList = this.state.newOrdersList.map(obj => obj.id);
    const barcodeList = this.state.ordersList.map(obj => obj.id);
    api.pick.startPickTask(barcodeList).then((res) => {
      if (res.success) {
        if (res.data.success === 0) {
          // res.data.errorDesc -> object
          // TODO: print all error
          toast.error('Cant start operation. Invalid data');
          return;
        }
        this.props.history.push('/operation');
      }
    });
  }

  handleRemoveOrder = (index) => {
    this.deleteIndex = index;
    this.setState({ openRemoveConfirm: true });
  }

  handleRemoveConfirmAction(result) {
    if (result) {
      const { newOrdersList } = this.state;
      newOrdersList.splice(this.deleteIndex, 1);
      this.setState({ newOrdersList: [...newOrdersList] });
    }
    this.setState({ openRemoveConfirm: false });
  }

  handleBinScanChange = (e, { value }) => {
    this.setState({ binBarcode: value });
  }

  handleBinScanSubmit = () => {
    if (this.state.binBarcode === '') {
      this.setState({ binScanErrorMessage: 'Cannot be empty' });
      return;
    }

    // const { newOrdersList } = this.state;
    // const lastOrderBarcode = newOrdersList[newOrdersList.length - 1].barCode;

    const { binBarcode, lastOrderBarcode } = this.state;
    this.bindBinToOrder(binBarcode, lastOrderBarcode);
  }

  render() {
    const {
      tableLoading, ordersList, newOrdersList, inputLoading, pages, activeTaskType,
      openBinScanModal, binBarcode, openRemoveConfirm, binScanErrorMessage,
    } = this.state;
    const { t } = this.props;

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
                  disabled={newOrdersList.length >= 5}
                  placeholder="Enter Barcode"
                />
              )}
            </Grid.Column>
            <Grid.Column width={11}>
              <div className="order-list-btn-group">
                <Button
                  size="huge"
                  primary
                  onClick={() => this.handleStartBtn()}
                  disabled={ordersList.length === 0}
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
          headerText="Scan Bin binBarcode"
          inputValue={binBarcode}
          onClose={() => {}}
          onInputChange={this.handleBinScanChange}
          onSubmit={this.handleBinScanSubmit}
          errorMessage={binScanErrorMessage}
          inputType="text"
        />

        <ConfirmDialogModal
          size="mini"
          open={openRemoveConfirm}
          close={this.handleRemoveConfirmAction}
          header="Remove Order"
          content="Are you sure you want to remove this order?"
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
  };
}

export default compose(
  connect(mapStateToProps, {
    setStationTaskType,
    checkCurrentUnFinishTask,
    getTaskStatus,
  }),
  withNamespaces(),
)(PickTaskPage);
