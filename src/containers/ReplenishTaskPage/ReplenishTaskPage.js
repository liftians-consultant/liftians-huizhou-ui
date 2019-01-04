import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Loader, Button, Input } from 'semantic-ui-react';
import ReactTable from 'react-table';
import checkboxHOC from 'react-table/lib/hoc/selectTable';
import moment from 'moment';
import { toast } from 'react-toastify';

import api from 'api';
import { setStationTaskType } from 'redux/actions/stationAction';
import ReplenishOrderTableColumns from 'models/ReplenishOrderTableColumns';
import OperationTaskMenu from 'components/OperationTaskMenu/OperationTaskMenu';
import OrderDetailTable from 'components/common/OrderDetailTable/OrderDetailTable';

import './ReplenishTaskPage.css';

const CheckboxTable = checkboxHOC(ReactTable);

class ReplenishTaskPage extends Component {
  locale = process.env.REACT_APP_LOCALE;

  // Dummy data, will retrieve from server
  billTypeOptions = [
    { key: 1, text: 'Regular Replenish', index: 1, value: '01' },
    { key: 2, text: 'Return Replenish', index: 2, value: '11' },
    // { key: 3, text: 'Adjustment Replenish', index: 3, value: '4' },
  ];

  // Dummy data, will retrieve from server
  processOptions = [
    [
      { key: 0, text: 'Unprocessed', index: 0, value: 0 },
      { key: 1, text: 'Processing', index: 1, value: 100 },
      { key: 2, text: 'Finished', index: 2, value: 1 },
      { key: 3, text: 'Canceled', index: 3, value: -1 },
    ],
    // The following is the speciel case for Adjustment Process
    [
      { key: 0, text: 'Unprocessed', index: 0, value: 0 },
      { key: 1, text: 'Finished', index: 1, value: 101 },
      { key: 2, text: 'Canceled', index: 2, value: 100 },
    ],
  ];

  state = {
    activeBillType: '01',
    activeProcessType: 0,
    ordersList: [],
    loading: false,
    selection: [], // select react table
    selectAll: false, // select react table
    searchedList: [],
  }

  componentWillMount() {
    this.setStationTaskType();
    this.startStationOperationCall();
    this.getBillTypeName();
    this.getProcessStatusName();
  }

  setStationTaskType() {
    this.props.setStationTaskType('R');
  }

  getBillTypeName() {
    api.menu.getBillTypeName('R').then((res) => {
      if (res.data && res.data.length) {
        this.billTypeOptions = res.data.map((billType, index) => ({
          key: index + 1,
          text: billType.billTypeName,
          index: index + 1,
          value: billType.billType,
        }));
      }
    });
  }

  getProcessStatusName() {
    api.menu.getProcessStatusName('R').then((res) => {
      if (res.data && res.data.length) {
        this.processOptions[0] = res.data.map((processType, index) => ({
          key: index,
          text: this.locale === 'CHN' ? processType.processStatusCHN : processType.processStatus,
          index,
          value: processType.processStatusID,
        }));
      }
    });
  }

  retrieveReplenishRecords = () => {
    this.setState({ loading: true });
    console.log(`[RETRIEVE REPLENISH TASK] BillType: ${this.state.activeBillType}, ProcessType: ${this.state.activeProcessType}`);
    api.replenish.retrieveReplenishRecords(this.props.stationId, this.state.activeBillType, this.state.activeProcessType).then((res) => {
      console.log('[RETRIEVE REPLENISH TASK] Record Retrieved', res.data);
      res.data.map((object) => {
        object.replenishDate = moment(object.pick_DATE).format(process.env.REACT_APP_TABLE_DATE_FORMAT);
        object.processStatus = this.locale === 'CHN' ? object.processStatusCHN : object.processStatus;
        return object;
      });
      this.setState({ ordersList: res.data, loading: false }, this.filterOrderListBySourceId);
    });
  }

  handleTaskChange = (e, { value }) => {
    this.setState({ activeBillType: value, activeProcessType: 0 }, this.retrieveReplenishRecords);
  }

  handleProcessChange = (e, { value }) => {
    this.setState({ activeProcessType: value }, this.retrieveReplenishRecords);
  };

  handleRequestPodBtn() {
    const sourceIdList = this.state.selection.join(',');
    api.replenish.replenishByBillNo(this.props.stationId, this.props.username, sourceIdList, 1).then(() => {
      console.log('Going into replenish operation page~~~~');
      this.props.history.push('/replenish-operation');
    });
  }

  handleContinueBtn() {
    const { searchedList } = this.state;
    const sourceIdList = searchedList.map(item => item.replenishBillNo).join(',');
    api.replenish.replenishByBillNo(this.props.stationId, this.props.username, sourceIdList, 1).then(() => {
      console.log('Continue going into replenish operation page.');
      this.props.history.push('/replenish-operation');
    });
  }

  handleSearchChange = (e, { value }) => {
    this.filterOrderListBySourceId(value);
  };

  filterOrderListBySourceId(keyword = '') {
    const { ordersList } = this.state;
    const filteredList = ordersList.filter(order => String(order.sourceID).indexOf(keyword) !== -1);

    this.setState({ searchedList: filteredList });
  }


  startStationOperationCall() {
    this.setState({ loading: true });
    api.station.startStationOperation(this.props.stationId, this.props.username, 'R').then((res) => {
      // return 1 if success, 0 if failed
      if (!res.data) {
        toast.error('Cannot start station. Please contact your system admin');
      }
      console.log('[REPLENISH PICK TASK] Station Started with R');
      this.setState({ loading: false }, this.retrieveReplenishRecords);
    }).catch((e) => {
      toast.error('Server Error. Please contact your system admin');
      this.setState({ loading: false });
      console.error(e);
    });
  }

  // For Select React Table
  toggleSelection = (key) => {
    // start off with the existing state
    let selection = [
      ...this.state.selection, // eslint-disable-line react/no-access-state-in-setstate
    ];
    const keyIndex = selection.indexOf(key);
    // check to see if the key exists
    if (keyIndex >= 0) {
      // it does exist so we will remove it using destructing
      selection = [
        ...selection.slice(0, keyIndex),
        ...selection.slice(keyIndex + 1),
      ];
    } else {
      // it does not exist so add it
      selection.push(key);
    }
    // update the state
    this.setState({ selection });
  }

  // For Select React Table
  toggleAll = () => {
    const selectAll = !this.state.selectAll; // eslint-disable-line react/no-access-state-in-setstate
    const selection = [];
    if (selectAll) {
      // we need to get at the internals of ReactTable
      const wrappedInstance = this.checkboxTable.getWrappedInstance();
      // the 'sortedData' property contains the currently accessible records based on the filter and sort
      const currentRecords = wrappedInstance.getResolvedState().sortedData;
      // we just push all the IDs onto the selection array
      currentRecords.forEach((item) => {
        selection.push(item._original.sourceID); // eslint-disable-line no-underscore-dangle
      });
    }
    this.setState({ selectAll, selection });
  }

  // For Select React Table
  isSelected = key => this.state.selection.includes(key)


  render() {
    const { toggleSelection, toggleAll, isSelected } = this;
    const { activeBillType, activeProcessType, loading, ordersList, selectAll, searchedList, selection } = this.state;

    const checkboxProps = {
      selectAll,
      isSelected,
      toggleSelection,
      toggleAll,
      selectType: 'checkbox',
      keyField: 'replenishBillNo',
    };

    return (
      <div className="ui replenish-task-page-container">
        <Loader content="Loading" active={this.state.loading} />

        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <OperationTaskMenu
                activeBillType={activeBillType}
                processOptions={this.processOptions}
                billTypeOptions={this.billTypeOptions}
                onTaskChange={this.handleTaskChange}
                onProcessChange={this.handleProcessChange}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <div className="orderlist-table-container">
                { String(activeProcessType) === '0' && (
                <CheckboxTable
                  ref={(r) => { this.checkboxTable = r; }}
                  data={searchedList}
                  columns={ReplenishOrderTableColumns}
                  className="-striped -highlight replenish-task-table"
                  SubComponent={row => <OrderDetailTable taskType="R" recordId={row.original.replenishBillNo} />}
                  defaultPageSize={15}
                  manual
                  resizable={false}
                  filterable={false}
                  {...checkboxProps}
                />
                )}

                { String(activeProcessType) !== '0' && (
                  <ReactTable
                    columns={ReplenishOrderTableColumns}
                    data={searchedList}
                    defaultPageSize={15}
                    SubComponent={row => <OrderDetailTable taskType="R" recordId={row.original.replenishBillNo} />}
                    loading={loading}
                    manual
                    resizable={false}
                    filterable={false}
                    className="-striped -highlight replenish-task-table"
                  />
                )}
                {/* <OrderListTable listData={ ordersList } loading={ loading } columns={ ReplenishOrderTableColumns } /> */}
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              <div className="search-input-group">
                <Input
                  onChange={this.handleSearchChange}
                  size="big"
                  icon="search"
                  iconPosition="left"
                  placeholder="Enter Source ID..."
                />
              </div>
              <div className="order-list-btn-group">
                { String(activeProcessType) !== '100' && (
                  <Button
                    size="huge"
                    primary
                    disabled={selection.length === 0}
                    onClick={() => this.handleRequestPodBtn()}
                  >
                    Request POD
                  </Button>
                )}
                { String(activeProcessType) === '100' && (
                  <Button
                    size="huge"
                    disabled={ordersList.length === 0}
                    onClick={() => this.handleContinueBtn()}
                  >
                    Continue Replenish
                  </Button>
                )}

                {/* <Button size="huge" secondary>Pause</Button> */}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

ReplenishTaskPage.defaultProps = {
  taskCount: 0,
};

ReplenishTaskPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  username: PropTypes.string.isRequired,
  stationId: PropTypes.string.isRequired,
  taskCount: PropTypes.number,
};

function mapStateToProps(state) {
  return {
    username: state.user.username,
    stationId: state.station.id,
    taskCount: state.station.info.taskCount,
  };
}

export default connect(mapStateToProps, { setStationTaskType })(ReplenishTaskPage);
