import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Input } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import api from 'api';

import './ExpireRuleConfigPage.css';

class ExpireRuleConfigPage extends Component {
  state = {
    rulesList: [],
  };


  constructor() {
    super();

    this.submitChange = this.submitChange.bind(this);
    this.handleChangeInput = this.handleChangeInput.bind(this);
    this.backBtnHandler = this.backBtnHandler.bind(this);
  }


  componentWillMount() {
    api.system.getExpirationRule().then((res) => {
      if (res.data) {
        console.log('[GET EXPIRATION RULE]', res.data);
        if (res.data.length > 2) {
          toast.warn('Retrieved more than 2 record of rule. Please check your database.');
        }
        this.setState({ rulesList: res.data });
      }
    }).catch(() => {
      console.log('[ERROR] Cannot retrieve expire rule');
      toast.error('Cannot retrieve expire date');
    });
  }

  backBtnHandler = () => {
    console.log('back');
    this.props.history.goBack();
  }

  handleChangeInput(e, { index, value }) {
    const { rulesList } = this.state;
    rulesList[index].numDays = value;
    this.setState({ rulesList });
  }


  submitChange(index) {
    const rulesList = this.state.rulesList;
    console.log(index);
    console.log(`[SET EXPIRATION RULE] ${rulesList[index].taskType} : ${rulesList[index].numDays}}`);
    api.system.setExpirationRule(this.props.username, rulesList[index].taskType, rulesList[index].numDays).then((res) => {
      if (res.data) {
        toast.success('Successfully set expire rule');
      } else {
        toast.error('Error while setting expire rule');
      }
    }).catch(() => {
      console.log('[ERROR] Cannot set expire rule');
      toast.error('Server call failed. Please check server logs');
    });
  }

  render() {
    const { rulesList } = this.state;
    const rulesListElmt = rulesList.map((rule, index) => {
      const taskTypeName = rule.taskType === 'P' ? 'Pick' : 'Replenish';
      return (
        <div className="input-container" key={taskTypeName}>
          <div className="input-header">
            {taskTypeName}
            {' '}
Expire Rule:
          </div>
          <Input className="" value={rule.numDays} index={index} onChange={this.handleChangeInput} />
          <span className="buffer-text">Days</span>
          <Button primary onClick={() => this.submitChange(index)}>Confirm</Button>
        </div>
      );
    });

    return (
      <div className="expire-rule-config-page-container">
        <Button onClick={() => this.backBtnHandler()}>Back</Button>
        <div className="page-header-container">
          <span className="page-header">Expire Rules</span>
        </div>
        <div className="page-content-container">
          { rulesListElmt }
        </div>
      </div>
    );
  }
}

ExpireRuleConfigPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  username: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    username: state.user.username,
  };
}

export default connect(mapStateToProps, null)(ExpireRuleConfigPage);
