import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';
import { Grid, Button, Input, Icon } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import _ from 'lodash';
import moment from 'moment';

import api from 'api';
import OrderListTable from 'components/common/OrderListTable/OrderListTable';
import OperationTaskMenu from 'components/OperationTaskMenu/OperationTaskMenu';
import InputDialogModal from 'components/common/InputDialogModal';

import { setStationTaskType } from 'redux/actions/stationAction';
import { getTaskStatus, getCancelReasonList } from 'redux/actions/statusAction';
import { resetTaskPage, setRemoveDialog } from 'redux/actions/pickTaskAction';
import { clearAllInterval } from 'utils/utils';

import './ReplenishTaskPage.css';
import * as log4js from 'log4js2';

class ReplenishTaskPage extends Component {
  log = log4js.getLogger('ReplenishTaskPage');

  locale = process.env.REACT_APP_LOCALE;

  pageSize = 10;

  deleteIndex = 0;

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
  };

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

  FinishTableColumn = [];

  constructor() {
    super();

    this.scanRef = React.createRef();
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFetchTableData = this.handleFetchTableData.bind(this);
    this.handleStartBtn = this.handleStartBtn.bind(this);
    this.handleContinueBtn = this.handleContinueBtn.bind(this);
    this.getStationOrderList = this.getStationOrderList.bind(this);
    this.handleRemoveScanSubmit = this.handleRemoveScanSubmit.bind(this);
  }


  componentWillMount() {
    clearAllInterval();

    this.translateTableColumn();

    this.setStationTaskType();
    this.startStationOperationCall();

    this.props.getCancelReasonList();

    this.props.getTaskStatus().then(() => {
      this.getStationOrderList([1], 1);
      this.loaded = true;
    });
  }

  componentDidMount() {
    this.focusInput();
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

    this.NewOrderTableColumn = [...newColumn];
    newColumn.pop();
    this.OrdersTableColumn = [...newColumn];
    newColumn.push({
      Header: t('label.completeTime'),
      accessor: 'completetime',
    });
    this.FinishTableColumn = [...newColumn];

    const newOptions = this.taskTypeOption.map((obj) => {
      obj.text = t(obj.tranlationKey);
      return obj;
    });

    this.taskTypeOption = [...newOptions];
  }

  transformOrderRecord(orderList) {
    const { taskStatusList } = this.props;

    const array = orderList.map((obj) => {
      if (!taskStatusList[obj.stat]) return obj;
      obj.statusName = taskStatusList[obj.stat].name;

      if (obj.completetime) {
        obj.completetime = moment(obj.completetime).format(process.env.REACT_APP_TABLE_DATE_FORMAT);
      }
      return obj;
    });

    return array;
  }

  preProcessInputValue(value) {
    if (value === 'START') {
      if (this.state.ordersList.length === 0) {
        toast.info(this.props.t('message.error.noNewOrder'));
      } else {
        this.handleStartBtn();
      }
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
    } else if (activeTaskType === '-1') {
      this.getStationOrderList([-1], state.page);
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
        activeTaskType: '0',
      });

      api.replenish.retreiveReceiveFromAsm(e.target.value).then((res) => {
        this.setState({ inputLoading: false });
        if (res.success) {
          this.getStationOrderList([1], 1);

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
    api.replenish.getStationReplenishList(stationId, taskTypeList, pageNum, this.pageSize).then((res) => {
      if (res.success) {
        // TODO: Also need to set pages
        this.setState({
          tableLoading: false,
          ordersList: this.transformOrderRecord(res.data.list),
        }, () => {
          callback(res);
        });
      }
    }).catch(() => {
      this.setState({ tableLoading: false });
    });
  }

  setStationTaskType() {
    this.props.setStationTaskType('R');
  }

  startStationOperationCall() {
    api.station.startStationOperation('R').then((res) => {
      if (!res.success) {
        toast.error(this.props.t('message.eerror.cannotStartStation'));
      }
      this.log.info('[REPLENISH TASK] Station Started with R');
    }).catch(() => {
      toast.error(this.props.t('message.error.contactAdmin'));
      this.log.info('[REPLENISH TASK] ERROR');
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
    // const barcodeList = this.state.newOrdersList.map(obj => obj.id);
    const barcodeList = this.state.ordersList.map(obj => obj.id);
    api.replenish.startReceiveTask(barcodeList).then((res) => {
      if (res.success) {
        if (res.data.success === 0) {
          toast.error(this.props.t('message.error.cannotStartOperation'));
          return;
        }
        this.props.history.push('/replenish-operation');
      }
    });
  }

  handleContinueBtn = () => {
    this.props.history.push('/replenish-operation');
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

  render() {
    const {
      tableLoading, ordersList, inputLoading, pages, activeTaskType,
      cancelErrorMessage,
    } = this.state;
    const { t, openRemoveModal } = this.props;

    return (
      <div className="ui replenish-task-page-container">
        <div className="page-title">
          {t('label.replenishmentList')}
        </div>
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
                    columns={activeTaskType === '5' ? this.FinishTableColumn : this.OrdersTableColumn}
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
                  placeholder={t('label.scanOrderBarcode')}
                />
              )}
            </Grid.Column>
            <Grid.Column width={11}>
              <div className="order-list-btn-group">
                { activeTaskType === '0' && (
                  <Button
                    size="huge"
                    primary
                    onClick={() => this.handleStartBtn()}
                    disabled={ordersList.length === 0}
                  >
                    {t('label.start')}
                  </Button>
                )}
                { activeTaskType === '1' && (
                  <Button
                    size="huge"
                    onClick={() => this.handleContinueBtn()}
                    disabled={ordersList.length === 0}
                  >
                    {t('label.continue')}
                  </Button>
                )}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>

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

ReplenishTaskPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  stationId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    username: state.user.username,
    stationId: state.station.id,
    taskStatusList: state.status.taskStatusList,
    openRemoveModal: state.pickTask.openRemoveDialog,
  };
}

export default compose(
  connect(mapStateToProps, {
    setStationTaskType,
    getTaskStatus,
    getCancelReasonList,
    resetTaskPage,
    setRemoveDialog,
  }),
  withNamespaces(),
)(ReplenishTaskPage);
