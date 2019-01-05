import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';
import { Grid, Button, Input } from 'semantic-ui-react';
import { toast } from 'react-toastify';

import api from 'api';
import OrderListTable from 'components/common/OrderListTable/OrderListTable';
import PickOrderTableColumns from 'models/PickOrderTableModel';
import OperationTaskMenu from 'components/OperationTaskMenu/OperationTaskMenu';

import { setStationTaskType, checkCurrentUnFinishTask } from 'redux/actions/stationAction';
import { getTaskStatus } from 'redux/actions/statusAction';

import './PickTaskPage.css';
import * as log4js from 'log4js2';

class PickTaskPage extends Component {
  log = log4js.getLogger('PickTaskPage');

  locale = process.env.REACT_APP_LOCALE;

  pageSize = 10;

  taskTypeOption = [
    { key: 1, text: 'New', index: 1, value: '0' },
    { key: 2, text: 'In Progress', index: 2, value: '1' },
    { key: 3, text: 'Complete', index: 3, value: '5' },
  ];

  state = {
    activeTaskType: '0',
    newOrdersList: [],
    ordersList: [],
    inputLoading: false,
    tableLoading: false,
    pages: 1,
  }

  constructor() {
    super();

    this.scanRef = React.createRef();
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFetchTableData = this.handleFetchTableData.bind(this);
    this.backBtnHandler = this.backBtnHandler.bind(this);
    this.handleStartBtn = this.handleStartBtn.bind(this);
  }

  componentWillMount() {
    this.props.getTaskStatus();
    // this.setStationTaskType();
    // this.startStationOperationCall();
  }

  componentDidMount() {
    this.scanRef.current.focus();
  }

  backBtnHandler = () => {
    console.log('back');
    this.props.history.goBack();
  }

  transformOrderRecord(orderList) {
    const { taskStatusList } = this.props;
    return orderList.map((obj) => {
      obj.statusName = taskStatusList[obj.stat].name;
      return obj;
    });
  }

  handleFetchTableData(state) {
    this.getStationUnfinsihedOrderList(state.page);
  }

  handleInputChange(e) {
    if (e.key === 'Enter' && e.target.value) {
      this.setState({ inputLoading: true });
      e.persist();

      api.pick.retrieveOrderFromAsm(e.target.value).then((res) => {
        if (res.success) {
          this.setState({ inputLoading: false });
          const record = res.data;
          const { newOrdersList } = this.state;
          const isDuplicate = newOrdersList.some(obj => obj.barCode === record.barCode);
          if (isDuplicate) {
            toast.info(`Order ${record.barCode} already exist!`);
          } else {
            newOrdersList.push(record);
            this.setState({ newOrdersList: [...newOrdersList] }, () => {
              this.setState({ ordersList: [...newOrdersList] });
            });
          }

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
    api.pick.getStationOrderList(stationId, pageNum, this.pageSize).then((res) => {
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
    this.setState({ loading: true });
    api.station.startStationOperation(this.props.stationId, this.props.username, 'P').then((res) => {
      // return 1 if success, 0 if failed
      if (!res.data) {
        toast.error('Cannot start station. Please contact your system admin');
      }
      this.log.info('[PICK TASK] Station Started with P');
      // this.setState({ loading: false }, this.retrievePickOrderReocrds);
    }).catch((e) => {
      toast.error('Server Error. Please contact your system admin');
      this.log.info('[PICK TASK] ERROR');
      this.setState({ loading: false });
      console.error(e);
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
  }

  render() {
    const { tableLoading, ordersList, inputLoading, pages, activeTaskType } = this.state;
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
                <OrderListTable
                  listData={ordersList}
                  loading={tableLoading}
                  columns={PickOrderTableColumns}
                  onFetchData={this.handleFetchTableData}
                  pages={pages}
                />
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
                <Button size="huge" primary onClick={() => this.handleStartBtn()}>
                  {t('label.start')}
                </Button>
                <Button size="huge" secondary onClick={() => this.handlePauseBtn()}>
                  {t('label.pause')}
                </Button>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

PickTaskPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  username: PropTypes.string.isRequired,
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
