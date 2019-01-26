import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';
import { Form } from 'semantic-ui-react';

const changeFormStyle = {
  color: '#fff',
};

const ChangeLanguageForm = ({ t, value, onLanguageChange, onSubmit }) => (
  <Form onSubmit={onSubmit} inverted>
    <Form.Field style={changeFormStyle}>
      {t('label.selectedLanguage')}
    </Form.Field>
    <Form.Radio
      label="English"
      value="en"
      checked={value === 'en'}
      onChange={onLanguageChange}
    />
    <Form.Radio
      label="简体中文"
      value="zh"
      checked={value === 'zh'}
      onChange={onLanguageChange}
    />
    <Form.Button primary>{t('button.submit')}</Form.Button>
  </Form>
);

ChangeLanguageForm.propTypes = {
  value: PropTypes.string.isRequired,
  onLanguageChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default compose(
  withNamespaces(),
)(ChangeLanguageForm);
