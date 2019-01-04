import React from 'react';
import PropTypes from 'prop-types';
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
        .catch((err) => {
          console.log(err);
          let message = 'Login Error';
          if (err.message.indexOf('timeout') !== -1) {
            message = 'Connection Timeout: Please make sure you have the correct server configuration.';
          }
          this.setState({ errors: { global: message }, loading: false });
        });
    }
  };

  validate = (data) => {
    const errors = {};
    if (!data.password) errors.password = "Can't be blank";
    return errors;
  };

  render() {
    const { data, errors, loading } = this.state;

    return (
      <Form onSubmit={this.onSubmit} loading={loading} size="large">
        {errors.global && (
          <Message negative>
            <Message.Header>Something went wrong</Message.Header>
            <p>{errors.global}</p>
          </Message>
        )}
        <Form.Field fluid="true" error={!!errors.email}>
          {/* <label htmlFor="username">Username</label> */}
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Your username"
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
            placeholder="Your password"
            value={data.password}
            onChange={this.onChange}
          />
          {errors.password && <InlineError text={errors.password} />}
        </Form.Field>
        <Button primary>Login</Button>
      </Form>
    );
  }
}

LoginForm.propTypes = {
  submit: PropTypes.func.isRequired,
};

export default LoginForm;
