import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Button, Input, Icon } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';

import api from 'api';
import OrderListTable from 'components/common/OrderListTable/OrderListTable';
import OperationTaskMenu from 'components/OperationTaskMenu/OperationTaskMenu';
import ConfirmDialogModal from 'components/common/ConfirmDialogModal/ConfirmDialogModal';
import PickOrderTableColumns from 'models/PickOrderTableModel';

import { setStationTaskType } from 'redux/actions/stationAction';
import { getTaskStatus } from 'redux/actions/statusAction';

import './ReplenishTaskPage.css';
import * as log4js from 'log4js2';

class ReplenishTaskPage extends Component {
  log = log4js.getLogger('ReplenishTaskPage');

  locale = process.env.REACT_APP_LOCALE;

  pageSize = 10;

  deleteIndex = 0;

  taskTypeOption = [
    { key: 1, text: 'New', index: 1, value: '0' },
    // { key: 2, text: 'In Progress', index: 2, value: '1' },
    // { key: 3, text: 'Complete', index: 3, value: '5' },
  ];

  state = {
    activeTaskType: '0',
    ordersList: [],
    inputLoading: false,
    tableLoading: false,
    pages: 1,
    openRemoveConfirm: false,
  };

  NewOrderTableColumn = [
    {
      Header: 'Barcode',
      accessor: 'barCode',
    }, {
      Header: 'Product',
      accessor: 'productId',
      maxWidth: 100,
    }, {
      Header: 'Quantity',
      accessor: 'quantity',
      maxWidth: 100,
    }, {
      Header: 'Unit',
      accessor: 'unit',
      maxWidth: 80,
    }, {
      Header: 'Batch',
      accessor: 'batch',
      maxWidth: 80,
    }, {
      Header: 'Manufacturer',
      accessor: 'manufacturer',
    }, {
      Header: 'Status',
      accessor: 'statusName',
    }, {
      Header: 'Remove',
      Cell: row => (
        <Icon name="delete" size="big" onClick={() => this.handleRemoveOrder(row.index)} />
      ),
      maxWidth: 100,
    },
  ];

  constructor() {
    super();

    this.scanRef = React.createRef();
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFetchTableData = this.handleFetchTableData.bind(this);
    this.handleStartBtn = this.handleStartBtn.bind(this);
    this.handleRemoveConfirmAction = this.handleRemoveConfirmAction.bind(this);
  }


  componentWillMount() {
    this.props.getTaskStatus();
    this.setStationTaskType();
    this.startStationOperationCall();
  }

  componentDidMount() {
    this.focusInput();
  }

  focusInput() {
    this.scanRef.current.focus();
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
    this.getStationUnfinsihedOrderList(state.page);
  }

  handleInputChange(e) {
    if (e.key === 'Enter' && e.target.value) {
      e.persist();

      if (this.preProcessInputValue(e.target.value)) {
        return;
      }

      this.setState({ inputLoading: true });

      api.replenish.retreiveReceiveFromAsm(e.target.value).then((res) => {
        this.setState({ inputLoading: false });
        if (res.success) {
          const { stationId } = this.props;
          this.setState({ tableLoading: true });

          // get unstarted order
          api.replenish.getReplenishList(stationId, 1, this.pageSize).then((result) => {
            if (result.success) {
              // TODO: Also need to set pages
              this.setState({
                tableLoading: false,
                ordersList: this.transformOrderRecord(result.data.list),
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

  getStationUnfinsihedOrderList(pageNum) {
    const { stationId } = this.props;
    this.setState({ tableLoading: true });

    // get unstarted order
    api.replenish.getReplenishList(stationId, pageNum, this.pageSize).then((res) => {
      if (res.success) {
        // TODO: Also need to set pages
        this.setState({
          tableLoading: false,
          ordersList: this.transformOrderRecord(res.data.list),
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
        toast.error('Cannot start station. Please contact your system admin');
      }
      this.log.info('[REPLENISH TASK] Station Started with P');
    }).catch(() => {
      toast.error('Server Error. Please contact your system admin');
      this.log.info('[REPLENISH TASK] ERROR');
    });
  }

  handleTaskChange = (e, { value }) => {
    this.setState({ activeTaskType: value }, () => {
      if (value === '0') {
        this.setState(prevState => ({ ordersList: prevState.newOrdersList }));
      } else if (value === '1') {
        this.getStationUnfinsihedOrderList(1);
      } else if (value === '5') {
        // ignore now
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

  render() {
    const {
      tableLoading, ordersList, inputLoading, pages, activeTaskType,
      openRemoveConfirm,
    } = this.state;
    const { t } = this.props;

    return (
      <div className="ui replenish-task-page-container">
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
                  // <OrderListTable
                  //   listData={newOrdersList}
                  //   loading={tableLoading}
                  //   columns={this.NewOrderTableColumn}
                  // />
                  <OrderListTable
                    listData={ordersList}
                    loading={tableLoading}
                    columns={this.NewOrderTableColumn}
                  />
                ) : (
                  <OrderListTable
                    listData={ordersList}
                    loading={tableLoading}
                    columns={PickOrderTableColumns}
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
  };
}

export default compose(
  connect(mapStateToProps, {
    setStationTaskType,
    getTaskStatus,
  }),
  withNamespaces(),
)(ReplenishTaskPage);
