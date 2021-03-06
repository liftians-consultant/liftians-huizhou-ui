import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter } from 'react-router';
import { Button } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { withNamespaces } from 'react-i18next';
import api from 'api';
import * as actions from 'redux/actions/authAction';
import appConfig from 'services/AppConfig';
import { deactivateStation, checkCurrentUnFinishTask } from 'redux/actions/stationAction';
import { showChangeBinModal, unlinkAllBinFromHolder } from 'redux/actions/operationAction';
import './SideNavigation.css';

class SideNavigation extends Component {
  stationId = appConfig.getStationId()

  constructor() {
    super();

    this.handleLogoutBtnClicked = this.handleLogoutBtnClicked.bind(this);
    this.handleChangeBinBtnClicked = this.handleChangeBinBtnClicked.bind(this);
    this.onUnload = this.onUnload.bind(this);
  }

  onUnload(event) { // the method that will be used for both add and remove event
    console.log('[WINDOW CLOSE EVENT] Triggered');

    if (this.props.taskType !== 'U' && this.props.taskCount > 0) {
      toast.error(this.props.t('message.finishAllTask'));
      event.returnValue = false;
      return false;
    }
    this.props.logout();

    return false;
  }

  componentDidMount() {
    if (process.env.REACT_APP_ENV === 'PRODUCTION') {
      window.addEventListener('beforeunload', this.onUnload);
    }
  }

  componentWillUnmount() {
    if (process.env.REACT_APP_ENV === 'PRODUCTION') {
      window.removeEventListener('beforeunload', this.onUnload);
    }
  }

  handleOperationBtnClicked(url) {
    // this.props.checkCurrentUnFinishTask(this.props.stationId).then((res) => {
    //   if (res.taskCount === 0) {
    //     toast.info('No tasks currently exist.');
    //   } else {
    //     this.props.history.push(url);
    //   }
    // });

    this.props.history.push(url);
  }

  handleLogoutBtnClicked() {
    this.props.deactivateStation().then((result) => {
      if (result) {
        api.user.logout().then((res) => {
          if (res.success) {
            this.props.logout().then((response) => {
              if (response) {
                toast.success('Successfully logged out');
              }
            });
          }
        });
      }
    });
  }

  handleChangeBinBtnClicked() {
    this.props.showChangeBinModal();
  }

  renderChangeBinBtn() {
    if (this.props.location.pathname === '/operation') {
      return (
        <Button className="nav-btn" onClick={this.handleChangeBinBtnClicked}>
          Change Bin
        </Button>
      );
    }

    return (<div />);
  }

  render() {
    const { username, taskType, location, t } = this.props;
    const currentPath = location.pathname;
    const operationUrl = taskType === 'R' ? '/replenish-operation' : '/operation';
    const taskListUrl = taskType === 'R' ? '/replenish-task' : '/pick-task';


    return (
      <div className="side-navigation">
        <div className="nav-top">
          <div className="nav-item-container nav-station-container">
            <span>
              {t('station.name', { id: this.stationId })}
            </span>
            <br />
            <span>{username}</span>
          </div>
          <div className="nav-item-container">
            <Link to="/" replace={currentPath === '/'}>
              <Button className="nav-btn">
                {t('label.mainMenu')}
              </Button>
            </Link>
          </div>
          <div className="nav-item-container">
            <Button className="nav-btn" onClick={() => this.handleOperationBtnClicked(operationUrl)}>
              {t('label.operation')}
            </Button>
          </div>
          <div className="nav-item-container">
            <Link to={taskListUrl} replace={currentPath === taskListUrl}>
              <Button className="nav-btn">
                {taskType === 'R' ? t('label.replenishmentList') : t('label.pickingList')}
              </Button>
            </Link>
          </div>
        </div>
        <div className="nav-buffer" />
        <div className="nav-item-container nav-bottom">
          {/* { this.renderChangeBinBtn() } */}
          <Button className="nav-btn" onClick={this.handleLogoutBtnClicked}>
            {t('label.logout')}
          </Button>
        </div>
      </div>
    );
  }
}

SideNavigation.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }).isRequired,
  logout: PropTypes.func.isRequired,
  // stationId: PropTypes.string.isRequired,
  taskType: PropTypes.oneOf(['R', 'P', 'U']).isRequired,
  location: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    username: state.user.username,
    stationId: state.station.id,
    taskType: state.station.info.taskType,
    taskCount: state.station.info.taskCount,
  };
}

const mapDispatchToProps = {
  logout: actions.logout,
  checkCurrentUnFinishTask,
  showChangeBinModal,
  unlinkAllBinFromHolder,
  deactivateStation,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  withNamespaces(),
)(SideNavigation);
