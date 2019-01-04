import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';
import { Grid, Loader, Button } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import api from 'api';
import OrderListTable from 'components/common/OrderListTable/OrderListTable';
import PickOrderTableColumns from 'models/PickOrderTableModel';
import { setStationTaskType, checkCurrentUnFinishTask } from 'redux/actions/stationAction';

import './PickTaskPage.css';
import OperationTaskMenu from 'components/OperationTaskMenu/OperationTaskMenu';
import * as log4js from 'log4js2';

class PickTaskPage extends Component {
  log = log4js.getLogger('PickTaskPage');

  locale = process.env.REACT_APP_LOCALE;

  // Dummy data, will retrieve from server
  billTypeOptions = [
    { key: 1, text: 'Regular Picking', index: 1, value: '11' },
    { key: 2, text: 'Shortage Picking', index: 2, value: '99' },
    { key: 3, text: 'Seperate Picking', index: 3, value: '12' },
    { key: 4, text: 'Adjustment Picking', index: 4, value: '4' },
  ];

  // Dummy data, will retrieve from server
  processOptions = [
    [
      { key: 0, text: 'Unprocessed', index: 0, value: 0 },
      { key: 1, text: 'Queuing', index: 1, value: 101 },
      { key: 2, text: 'Processing', index: 2, value: 100 },
      { key: 3, text: 'Finished', index: 3, value: 1 },
      { key: 4, text: 'Canceled', index: 4, value: -1 },
    ],
    // The following is the speciel case for Adjustment Process
    [
      { key: 0, text: 'Unprocessed', index: 0, value: 0 },
      { key: 1, text: 'Finished', index: 1, value: 101 },
      { key: 2, text: 'Canceled', index: 2, value: 100 },
    ],
  ];

  state = {
    activeBillType: '11',
    activeProcessType: 0,
    ordersList: [],
    loading: false,
  }

  constructor() {
    super();

    this.handleStartBtn = this.handleStartBtn.bind(this);
    this.handlePauseBtn = this.handlePauseBtn.bind(this);
  }

  componentWillMount() {
    this.setStationTaskType();
    this.startStationOperationCall();
    this.getBillTypeName();
    this.getProcessStatusName();
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
      this.setState({ loading: false }, this.retrievePickOrderReocrds);
    }).catch((e) => {
      toast.error('Server Error. Please contact your system admin');
      this.log.info('[PICK TASK] ERROR');
      this.setState({ loading: false });
      console.error(e);
    });
  }

  getBillTypeName() {
    api.menu.getBillTypeName('P').then((res) => {
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
    api.menu.getProcessStatusName('P').then((res) => {
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

  retrievePickOrderReocrds = () => {
    this.setState({ loading: true });
    this.log.info(`[RETRIEVE PICK ORDER RECORDS] task: ${this.state.activeBillType}, process:, ${this.state.activeProcessType}`);
    api.pick.retrievePickOrderReocrdsByTypeAndState(1, this.state.activeBillType, this.state.activeProcessType).then((res) => {
      res.data.map((object) => {
        object.pick_DATE = moment(object.pick_DATE).format(process.env.REACT_APP_TABLE_DATE_FORMAT);
        object.processStatus = this.locale === 'CHN' ? object.processStatusCHN : object.processStatus;
        return object;
      });
      this.setState({ ordersList: res.data, loading: false });
    });
  }

  handleTaskChange = (e, { value }) => {
    this.setState({ activeBillType: value, activeProcessType: 0 }, this.retrievePickOrderReocrds);
  }

  handleProcessChange = (e, { value }) => {
    this.setState({ activeProcessType: value }, this.retrievePickOrderReocrds);
  };

  handleStartBtn = () => {
    this.log.info('[HANDLE START BTN] Btn clicked');
    api.station.startStationOperation(this.props.stationId, this.props.username, 'P').then((res) => {
      // return 1 if success, 0 if failed
      if (!res.data) {
        toast.error('Cannot start station. Please contact your system admin');
      }
      this.log.info('[HANDLE START BTN] startStationOperation success. Calling GenPickTask');

      api.pick.callServerGeneratePickTask(this.props.stationId).then(() => {
        this.log.info('[HANDLE START BTN] GenPickTask success');
        this.setState({ loading: true }, () => {
          setTimeout(() => {
            this.props.checkCurrentUnFinishTask(this.props.stationId).then((response) => {
              if (response.taskCount === 0) {
                this.log.info('[HANDLE START BTN] No Task. STAY');
                toast.info('No tasks currently exist.');
              } else {
                this.log.info('[HANDLE START BTN] Yes task. Going to operation page');
                this.props.history.push('/operation');
              }
            });
          }, 2000);
        });
      }).catch(() => {
        this.log.info('[HANDLE START BTN] GenPickTask FAILED');
        toast.error('Error while server generate pick task. Please contact system admin.');
      });
    }).catch((e) => {
      toast.error('Server Error. Please contact your system admin');
      this.log.info('[HANDLE START BTN] startStationOperation FAILED');
      this.setState({ loading: false });
      console.error(e);
    });
  }

  handlePauseBtn = () => {
    this.log.info('[PAUSE BTN] Clicked. Calling stopPickOperation');
    api.pick.stopPickOperation(this.props.stationId, this.props.username, 'P').then(() => {
      this.log.info('[PAUSE PICK OPERATION] Pick Operation Paused');
    }).catch((err) => {
      this.log.info('[PAUSE PICK OPERATION] Pause Failed:', err);
    });
  }

  render() {
    const { activeBillType, loading, ordersList } = this.state;
    const { t } = this.props;

    return (
      <div className="ui pick-task-page-container">
        <Loader content="Loading" active={loading} />
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
                <OrderListTable listData={ordersList} loading={loading} columns={PickOrderTableColumns} />
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <div className="order-list-btn-group">
                <Button size="huge" primary onClick={() => this.handleStartBtn()}>
                  {t('label.start')}
                </Button>
                <Button size="huge" secondary onClick={() => this.handlePauseBtn()}>
                  {t('label.pause')}
                </Button>
                <Button size="huge" secondary>
                  {t('label.print')}
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
  }).isRequired,
  username: PropTypes.string.isRequired,
  stationId: PropTypes.string.isRequired,
  setStationTaskType: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    username: state.user.username,
    stationId: state.station.id,
  };
}

export default compose(
  connect(mapStateToProps, { setStationTaskType, checkCurrentUnFinishTask }),
  withNamespaces(),
)(PickTaskPage);
