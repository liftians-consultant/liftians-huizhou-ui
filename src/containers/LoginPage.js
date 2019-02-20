import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Image, Segment } from 'semantic-ui-react';

import LoginForm from 'components/forms/LoginForm';
import ServerSettingModal from 'components/common/ServerSettingModal/ServerSettingModal';
import { login } from 'redux/actions/authAction';
import { activateStation } from 'redux/actions/stationAction';

import logo from 'assets/images/asm_logo.png';

const style = {
  position: 'absolute',
  right: '30px',
  bottom: '30px',
  color: '#ddd',
};

class LoginPage extends Component {
  constructor() {
    super();
    this.handleSettingBtnClick = this.handleSettingBtnClick.bind(this);
    this.handleAfterSubmit = this.handleAfterSubmit.bind(this);
  }

  submit = data => this.props.login(data);

  handleAfterSubmit = () => {
    this.props.activateStation(this.props.stationId, this.props.userId);
  }

  handleSettingBtnClick = () => {

  }

  render() {
    return (
      <div className="login-page">
        <style>
          {`
        
        body div.login-page {
          height: 100%;
        }
        .login-page {
          // padding-top: 10%;
        }
        .setting-btn {
          position: absolute;
          left: 30px;
          bottom: 30px;
        }
        `}
        </style>
        <Grid
          textAlign="center"
          style={{ height: '100%' }}
          verticalAlign="middle"
        >
          <Grid.Column style={{ maxWidth: 450 }}>
            <Image src={logo} size="medium" centered />
            <Segment>
              <LoginForm
                submit={this.submit}
                afterSubmit={this.handleAfterSubmit}
              />
            </Segment>
          </Grid.Column>
        </Grid>
        <ServerSettingModal />
        <div className="version-block" style={style}>
          <span>
v
            { process.env.REACT_APP_VERSION }
          </span>
        </div>
      </div>
    );
  }
}

LoginPage.propTypes = {
  login: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    userId: state.user.userId,
    stationId: state.station.id,
  };
}

export default connect(mapStateToProps, {
  login,
  activateStation,
})(LoginPage);
