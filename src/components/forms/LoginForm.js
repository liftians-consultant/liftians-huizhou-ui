import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';
import { Form, Button, Message } from 'semantic-ui-react';
import InlineError from '../messages/InlineError';

class LoginForm extends React.Component {
  state = {
    data: {
      username: '',
      password: '',
    },
    loading: false,
    errors: {},
  };

  onChange = e => this.setState({
    data: { ...this.state.data, [e.target.name]: e.target.value }, // eslint-disable-line react/no-access-state-in-setstate
  });

  onSubmit = () => {
    const errors = this.validate(this.state.data); // eslint-disable-line react/no-access-state-in-setstate
    this.setState({ errors });
    if (Object.keys(errors).length === 0) {
      this.setState({ loading: true });
      this.props
        .submit(this.state.data)
        .then((res) => {
          if (!res) this.setState({ loading: false });
        }).catch((err) => {
          console.log(err);
          let message = 'Login Error';
          if (err.message.indexOf('timeout') !== -1) {
            message = this.props.t('message.connectionTimeout');
          }
          this.setState({ errors: { global: message }, loading: false });
        });
    }
  };

  validate = (data) => {
    const errors = {};
    if (!data.password) errors.password = this.props.t('message.cannotBeEmpty');
    return errors;
  };

  render() {
    const { data, errors, loading } = this.state;
    const { t } = this.props;

    return (
      <Form onSubmit={this.onSubmit} loading={loading} size="large">
        {errors.global && (
          <Message negative>
            <Message.Header>{t('message.somethingWentWrong')}</Message.Header>
            <p>{errors.global}</p>
          </Message>
        )}
        <Form.Field fluid="true" error={!!errors.email}>
          {/* <label htmlFor="username">Username</label> */}
          <input
            type="text"
            id="username"
            name="username"
            placeholder={t('placeholder.username')}
            value={data.username}
            onChange={this.onChange}
          />
          {errors.username && <InlineError text={errors.email} />}
        </Form.Field>
        <Form.Field fluid="true" error={!!errors.password}>
          {/* <label htmlFor="password">Password</label> */}
          <input
            type="password"
            id="password"
            name="password"
            placeholder={t('placeholder.password')}
            value={data.password}
            onChange={this.onChange}
          />
          {errors.password && <InlineError text={errors.password} />}
        </Form.Field>
        <Button primary>{t('label.login')}</Button>
      </Form>
    );
  }
}

LoginForm.propTypes = {
  submit: PropTypes.func.isRequired,
};

export default compose(
  withNamespaces(),
)(LoginForm);
