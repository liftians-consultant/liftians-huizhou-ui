import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';
import { Modal, Icon, Button, Form, Input } from 'semantic-ui-react';
import { setStationId } from 'redux/actions/stationAction';
import appConfig from 'services/AppConfig';

class ServerSettingModal extends Component {
  state = {
    stationId: '1',
    host: '',
    port: '',
    open: false,
  };

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount() {
    // const stationId = localStorage.stationId || 1;
    // const host = localStorage.serverHost || 'http://localhost';
    // const port = localStorage.serverPort || '8060';
    this.setState({
      stationId: appConfig.getStationId(),
      host: appConfig.getApiHost(),
      port: appConfig.getApiPort(),
    });
  }

  open = () => this.setState({ open: true })

  close = () => this.setState({ open: false })

  handleChange(e, { name, value }) {
    const newState = {};
    newState[name] = value;
    this.setState(newState);
  }

  saveConfig() {
    appConfig.setApiUrl(this.state.host, this.state.port);
    appConfig.setStationId(this.state.stationId);
    this.props.setStationId(this.state.stationId); // should be removed
    this.setState({ open: false });
    console.log('NEW SERVER CONFIG SAVED!');
  }

  render() {
    const { stationId, host, port, open } = this.state;
    const { t } = this.props;
    return (
      <Modal
        trigger={<Button className="setting-btn" icon="cogs" size="massive" />}
        size="tiny"
        open={open}
        onOpen={this.open}
        onClose={this.close}
      >
        <Modal.Header>
          <Icon name="cogs" size="large" />
          {t('title.stationConfigSetting')}
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field control={Input} label={t('label.stationId')} name="stationId" value={stationId} onChange={this.handleChange} />
            <Form.Field control={Input} label={t('label.server')} name="host" value={host} onChange={this.handleChange} />
            <Form.Field control={Input} label={t('label.port')} name="port" value={port} onChange={this.handleChange} />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button positive icon="check" content={t('button.submit')} onClick={() => this.saveConfig()} />
        </Modal.Actions>
      </Modal>
    );
  }
}

export default compose(
  connect(null, { setStationId }),
  withNamespaces(),
)(ServerSettingModal);
