import React, { Component } from 'react';
import { connect } from 'react-redux';
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
    return (
      <Modal
        trigger={<Button className="setting-btn" icon="cogs" size="massive" />}
        size="tiny"
        open={open}
        onOpen={() => console.log('opennnn')}
        onClose={this.close}
      >
        <Modal.Header>
          <Icon name="cogs" size="large" />
Station Configuration Setting
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field control={Input} label="Station ID" name="stationId" value={stationId} onChange={this.handleChange} />
            <Form.Field control={Input} label="Host" name="host" value={host} onChange={this.handleChange} />
            <Form.Field control={Input} label="Port" name="port" value={port} onChange={this.handleChange} />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button positive icon="check" content="Save" onClick={() => this.saveConfig()} />
        </Modal.Actions>
      </Modal>
    );
  }
}

export default connect(null, { setStationId })(ServerSettingModal);
