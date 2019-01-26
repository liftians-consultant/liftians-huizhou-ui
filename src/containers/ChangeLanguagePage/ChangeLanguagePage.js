import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';

import i18n from 'i18n';
import SubPageContainer from 'components/common/SubPageContainer/SubPageContainer';
import ChangeLanguageForm from 'components/forms/ChangeLanguageForm';

class ChangeLanguagePage extends Component {

  state = {
    value: '',
  }

  constructor() {
    super();

    this.backBtnHandler = this.backBtnHandler.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  backBtnHandler = () => {
    console.log('back');
    this.props.history.goBack();
  }

  componentWillMount() {
    console.log(i18n.language);
    this.setState({ value: i18n.language });
  }

  handleLanguageChange = (e, { value }) => {
    this.setState({ value });
  }

  handleFormSubmit = () => {
    const { value } = this.state;

    i18n.changeLanguage(value).then(() => {
      toast.success(this.props.t('setLanguageSuccess'));
    });
  }

  render() {
    const { value } = this.state;
    const { t } = this.props;

    return (
      <div className="generate-account-page">
        <SubPageContainer
          title={t('label.systemLanguage')}
          onBackBtnClicked={this.backBtnHandler}
        >
          <ChangeLanguageForm
            value={value}
            onLanguageChange={this.handleLanguageChange}
            onSubmit={this.handleFormSubmit}
          />
        </SubPageContainer>
      </div>
    );
  }
}

ChangeLanguagePage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default compose(
  withNamespaces(),
)(ChangeLanguagePage);
