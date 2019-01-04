import React, { Component } from 'react';
import PropTypes from 'prop-types';

import api from 'api';
import erpApi from 'erpApi';
import { toast } from 'react-toastify';

import SubPageContainer from 'components/common/SubPageContainer/SubPageContainer';
import CreateAccountForm from 'components/forms/CreateAccountForm';

class GenerateAccountPage extends Component {
  constructor() {
    super();

    this.backBtnHandler = this.backBtnHandler.bind(this);
    this.submit = this.submit.bind(this);
  }

  backBtnHandler = () => {
    console.log('back');
    this.props.history.goBack();
  }

  submit = data => erpApi.account.getAccount(data.accountNo).then((res) => {
    if (res.success) {
      console.log('account found', res.account);
      return false;
    }

    return api.account.create(data).then((response) => {
      if (response.data) {
        toast.success(`Account number ${response.data.accountNo} has been created`);
        return true;
      }
      return false;
    });
  });

  render() {
    return (
      <div className="generate-account-page">
        <SubPageContainer
          title="Create Account"
          onBackBtnClicked={this.backBtnHandler}
        >
          <CreateAccountForm onSubmit={this.submit} />
        </SubPageContainer>
      </div>
    );
  }
}

GenerateAccountPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default GenerateAccountPage;
