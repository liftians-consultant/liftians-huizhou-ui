import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';
import { Grid } from 'semantic-ui-react';
import { toast } from 'react-toastify';

import * as log4js from 'log4js2';
import api from 'api';
import MenuButton from 'components/common/MenuButton/MenuButton';
import ConfirmDialogModal from 'components/common/ConfirmDialogModal/ConfirmDialogModal';

class SystemSettingPage extends Component {
  state = {
    openSystemResetModal: false,
  }

  log = log4js.getLogger('SystemSettingPage');

  constructor(props) {
    super(props);

    this.resetSystemBtnHandler = this.resetSystemBtnHandler.bind(this);
    this.resetSystemModalCloseHandler = this.resetSystemModalCloseHandler.bind(this);
  }

  goToPage = (name) => {
    console.log(name);
    this.props.history.push(name);
  }

  goToNowhere = () => {
    // DO NOTHING~~~
  }

  resetSystemBtnHandler() {
    this.setState({ openSystemResetModal: true });
  }

  resetSystemModalCloseHandler(confirm) {
    this.setState({ openSystemResetModal: false });
    if (confirm) {
      api.pick.resetTestData(this.props.stationId).then((res) => {
        if (res.data) { // server return boolean value
          this.log.info('System Reset success');
          console.log('Reset Success');
          toast.success('You have successfully reset test data!');
        }
      }).catch(() => {
        console.error('Reset Failed');
      });
    }
  }

  backBtnHandler = () => {
    console.log('back');
    this.props.history.goBack();
  }

  render() {
    const { t } = this.props;

    return (
      <div className="ui container system-setting-page-container menu-page">
        {/* <Button onClick={ () => this.backBtnHandler() }>Go Back</Button> */}
        <Grid columns={3}>
          <Grid.Row>
            <Grid.Column>
              <MenuButton title={t('title.resetSystem')} name="reset-system" clickHandler={this.resetSystemBtnHandler} />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title={t('title.businessRule')} name="business-rules" clickHandler={this.goToPage} />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title={t('title.logSearch')} name="log-search" clickHandler={this.goToNowhere} />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <MenuButton title={t('title.adjustPodLayout')} name="pod-layout-adjust" clickHandler={this.goToPage} />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title={t('title.setLanguage')} name="language" clickHandler={this.goToPage} />
            </Grid.Column>
            {/* <Grid.Column>
              <MenuButton title="Volumne Change" name="volume-change" clickHandler={this.goToNowhere} />
            </Grid.Column> */}
          </Grid.Row>
        </Grid>

        { this.state.openSystemResetModal && (
        <ConfirmDialogModal
          size="mini"
          open={this.state.openSystemResetModal}
          close={this.resetSystemModalCloseHandler}
          header="Reset System"
          content="Are you sure you want to reset the system?"
        />
        ) }
      </div>
    );
  }
}


SystemSettingPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  stationId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    stationId: state.station.id,
  };
}

export default compose(
  connect(mapStateToProps, {}),
  withNamespaces(),
)(SystemSettingPage);
