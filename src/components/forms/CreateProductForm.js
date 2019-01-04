import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Checkbox, Select } from 'semantic-ui-react';

import ConfirmDialogModal from 'components/common/ConfirmDialogModal/ConfirmDialogModal';
import erpApi from 'erpApi';

class CreateProductForm extends Component {
  initData = {
    uniqueId: '',
    accountNo: '',
    sku: '',
    name: '',
    barcode: '',
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    unitCount: '',
    active: true,
  };

  state = {
    data: this.initData,
    accountListOptions: [],
    openConfirm: false,
    openOverwriteConfirm: false,
    loading: false,
  }

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleConfirmAction = this.handleConfirmAction.bind(this);
    this.handleOverwriteConfirmAction = this.handleOverwriteConfirmAction.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleResetForm = this.handleResetForm.bind(this);
  }

  componentWillMount() {
    erpApi.account.getAccountList().then((res) => {
      if (res.data) {
        const options = CreateProductForm.createAccountList(res.data.accounts);
        this.setState({ accountListOptions: options });
      }
    });
  }

  static createAccountList(data) {
    const output = data.map(account => ({
      key: account.accountNo,
      text: `${account.accountName} (${account.accountNo}) - ${account.active ? 'Active' : 'Inactive'}`,
      value: account.accountNo,
    }));

    return output;
  }

  handleSubmit() {
    this.setState({ loading: true });
    this.props.onSubmit(this.state.data.sku).then((res) => {
      if (res) {
        this.setState({ openConfirm: true });
      } else {
        this.setState({ openOverwriteConfirm: true });
      }
    });
  }

  handleConfirmAction = (result) => {
    this.setState({ openConfirm: false });
    if (result) {
      const data = this.state.data;
      data.unitVolume = (1 / data.unitCount).toFixed(2);

      this.props.onConfirm(data).then((res) => {
        if (res) {
          this.setState({ data: this.initData, loading: false });
        }
      });
    } else {
      this.setState({ loading: false });
    }
  }

  handleOverwriteConfirmAction = (result) => {
    this.setState({ openOverwriteConfirm: false });
    if (result) {
      this.setState({ openConfirm: true });
    } else {
      this.setState({ loading: false });
    }
  }

  handleFormChange(e, { name, value }) {
    this.setState(prevState => ({ data: { ...prevState.data, [name]: value } }));
  }

  handleResetForm() {
    this.setState({ data: this.initData });
  }

  render() {
    const { data, accountListOptions, loading, openConfirm, openOverwriteConfirm } = this.state;
    const { hideBtn } = this.props;

    return (
      <Form inverted widths="equal" size="small" onSubmit={this.handleSubmit} loading={loading}>
        <Form.Field control={Select} width="6" required label="Account" name="accountNo" value={data.accountNo} options={accountListOptions} onChange={this.handleFormChange} />
        <Form.Group>
          <Form.Field control={Input} width="4" required label="SKU" name="sku" value={data.sku} onChange={this.handleFormChange} />
          <Form.Field control={Input} width="4" required label="Barcode" name="barcode" value={data.barcode} onChange={this.handleFormChange} />
          <Form.Field control={Input} width="8" required label="Name" name="name" value={data.name} onChange={this.handleFormChange} />
        </Form.Group>
        <Form.Group>
          <Form.Field control={Input} width="4" label="Length" name="length" value={data.length} onChange={this.handleFormChange} />
          <Form.Field control={Input} width="4" label="Width" name="width" value={data.width} onChange={this.handleFormChange} />
          <Form.Field control={Input} width="4" label="Height" name="height" value={data.height} onChange={this.handleFormChange} />
          <Form.Field control={Input} width="4" label="Weight" name="weight" value={data.weight} onChange={this.handleFormChange} />
        </Form.Group>
        <Form.Field control={Input} width="4" required label="Unit Per Bin" name="unitCount" value={data.unitCount} onChange={this.handleFormChange} />

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

        <ConfirmDialogModal
          size="mini"
          open={openConfirm}
          close={this.handleConfirmAction}
        />

        <ConfirmDialogModal
          size="mini"
          open={openOverwriteConfirm}
          close={this.handleOverwriteConfirmAction}
          header="SKU already exist"
          content="This SKU already exist. Are you sure you want to overwrite it?"
        />
      </Form>
    );
  }
}

CreateProductForm.defaultProps = {
  hideBtn: false,
};

CreateProductForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  hideBtn: PropTypes.bool,
};

export default CreateProductForm;
