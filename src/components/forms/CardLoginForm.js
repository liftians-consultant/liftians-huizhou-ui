import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withNamespaces } from 'react-i18next';
import { Form, Button, Message } from 'semantic-ui-react';
import InlineError from '../messages/InlineError';

class CardLoginForm extends React.Component {
  state = {
    cardNum: '',
    loading: false,
    errors: {},
  };

  constructor(props) {
    super(props);

    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.inputRef.current.focus();
  }

  onChange = e => this.setState({
    cardNum: e.target.value,
  });

  onSubmit = () => {
    const { cardNum } = this.state;
    const errors = this.validate(cardNum);

    this.setState({ errors, cardNum: '' });
    if (Object.keys(errors).length === 0) {
      this.setState({ loading: true });
      this.props
        .submit(cardNum)
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

  validate = (cardNum) => {
    const errors = {};
    if (cardNum === '') errors.cardNum = this.props.t('message.cannotBeEmpty');
    return errors;
  };

  render() {
    const { cardNum, errors, loading } = this.state;
    const { t } = this.props;

    return (
      <Form onSubmit={this.onSubmit} loading={loading} size="large">
        {errors.global && (
          <Message negative>
            <Message.Header>{t('message.somethingWentWrong')}</Message.Header>
            <p>{errors.global}</p>
          </Message>
        )}
        <Form.Field fluid="true" error={!!errors.cardNum}>
          {/* <label htmlFor="username">Username</label> */}
          <input
            type="text"
            id="cardNum"
            name="cardNum"
            placeholder={t('placeholder.cardNumber')}
            value={cardNum}
            onChange={this.onChange}
            ref={this.inputRef}
          />
          {errors.cardNum && <InlineError text={errors.carNum} />}
        </Form.Field>
        <Button primary>{t('label.login')}</Button>
      </Form>
    );
  }
}

CardLoginForm.propTypes = {
  submit: PropTypes.func.isRequired,
};

export default compose(
  withNamespaces(),
)(CardLoginForm);
