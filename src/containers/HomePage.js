import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';
import { Grid, Dimmer, Loader } from 'semantic-ui-react';

import * as log4js from 'log4js2';
// import { AjaxAppenderProvider } from '@norauto/log4js2-ajax-appender';
import { AjaxAppenderProvider } from 'utils/AjaxAppender';
import appConfig from 'services/AppConfig';

import MenuButton from 'components/common/MenuButton/MenuButton';
import * as actions from 'redux/actions/authAction';
import { getUserInfoById } from 'redux/actions/userAction';
import { activateStation, checkCurrentUnFinishTask } from 'redux/actions/stationAction';

let logSetFlag = false;
class HomePage extends Component {
  state = {
    isLoading: true,
  }

  constructor(props) {
    super(props);
    this.goToPage = this.goToPage.bind(this);
  }

  componentWillMount() {
    // this.props.getUserInfoById(this.props.userId).then(() => {
    // this.props.activateStation(this.props.stationId, this.props.userId);
    this.checkCurrentUnFinishTaskCall();
    // });

    // ETagService.turnEndLightOffById(0);

    if (!logSetFlag) {
      log4js.addAppender(AjaxAppenderProvider({
        method: 'POST',
        url: `${appConfig.getApiUrl()}/logs/batch`,
        headers: {
          'Content-Type': 'text/plain',
          // Authorization: localStorage.liftiansJWT,
        },
      }));

      log4js.configure({
        layout: '[%d{ABSOLUTE}][%logger] - %message',
        appenders: ['ajaxAppender'],
        loggers: [{
          logLevel: log4js.LogLevel.INFO,
        }],
        allowAppenderInjection: true,
      });

      logSetFlag = true;
      console.log('[log4js] configuration set');
    }
  }

  goToPage = (name) => {
    console.log(name);
    this.props.history.push(name);
  }

  checkCurrentUnFinishTaskCall() {
    this.props.checkCurrentUnFinishTask(this.props.stationId).then((res) => {
      console.log('currentUnfinishedTask', res);
      this.setState({ isLoading: false });
    });
  }

  render() {
    const { stationInfo, t } = this.props;
    const stationTaskType = stationInfo ? stationInfo.taskType : null;

    return (
      <div className="workstation-menu ui container menu-page">
        <Dimmer active={this.state.isLoading}>
          <Loader content="Loading" />
        </Dimmer>

        <Grid columns={3} centered>
          <Grid.Row>
            <Grid.Column>
              <MenuButton title={t('title.replenish')} name="replenish-task" iconName="sign in" clickHandler={this.goToPage} isDisabled={!!(stationTaskType !== 'U' && stationTaskType !== 'R')} />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title={t('title.pick')} name="pick-task" iconName="sign out" clickHandler={this.goToPage} isDisabled={!!(stationTaskType !== 'U' && stationTaskType !== 'P')} />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title={t('title.inventoryCheck')} name="" iconName="exchange" clickHandler={this.goToPage} isDisabled={!!(stationTaskType !== 'U' && stationTaskType !== 'C')} />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <MenuButton title={t('title.systemSetting')} name="system-setting" iconName="settings" clickHandler={this.goToPage} />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title={t('title.inventorySearch')} name="inventory-search" iconName="search" clickHandler={this.goToPage} />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title={t('title.generateData')} name="generate-data" iconName="list alternate outline" clickHandler={this.goToPage} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

HomePage.defaultProps = {
  stationInfo: {},
};

HomePage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  stationInfo: PropTypes.object,
  stationId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    isAuthenticated: !!state.user.token,
    userId: state.user.userId,
    stationInfo: state.station.info,
    stationId: state.station.id,
  };
}

const mapDispatchToProps = {
  logout: actions.logout,
  getUserInfoById,
  activateStation,
  checkCurrentUnFinishTask,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withNamespaces(),
)(HomePage);
