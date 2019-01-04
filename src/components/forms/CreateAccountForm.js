import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Checkbox } from 'semantic-ui-react';

class CreateAccountForm extends Component {
  state = {
    data: {
      accountName: '',
      description: '',
      active: true,
    },
  };

  initData = {
    accountName: '',
    description: '',
    active: true,
  }

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleResetForm = this.handleResetForm.bind(this);
  }

  handleSubmit() {
    this.props.onSubmit(this.state.data).then((res) => {
      if (res) {
        this.setState({ data: this.initData });
      }
    });
  }

  handleFormChange(e, { name, value }) {
    this.setState(prevState => ({ data: { ...prevState.data, [name]: value } }));
  }

  handleResetForm() {
    this.setState({ data: this.initData });
  }

  render() {
    const { data } = this.state;
    const { hideBtn } = this.props;

    return (
      <Form inverted widths="equal" size="small" onSubmit={this.handleSubmit}>
        <Form.Field control={Input} width="4" required label="Account Name" name="accountName" value={data.accountName} onChange={this.handleFormChange} />
        <Form.Field control={Input} width="8" label="Description" name="description" value={data.description} onChange={this.handleFormChange} />

        <Form.Field required control={Checkbox} label="Active" name="active" onChange={this.handleFormChange} checked={data.active} />

        { !hideBtn && (
          <Form.Group>
            <Button type="button" className="reset-btn" onClick={this.handleResetForm}>
              Reset
            </Button>
            <Form.Field control={Button} primary className="submit-btn">
              Create
            </Form.Field>
          </Form.Group>
        )}
      </Form>
    );
  }
}

CreateAccountForm.defaultProps = {
  hideBtn: false,
};

CreateAccountForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  hideBtn: PropTypes.bool,
};

export default CreateAccountForm;
