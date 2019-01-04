import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button } from 'semantic-ui-react';
import moment from 'moment';
import { toast } from 'react-toastify';
import api from 'api';

class CreateReplenishForm extends Component {
  initData = {
    quantity: 0,
    unitNum: 1,
  };

  state = {
    product: {},
    scancode: '',
    data: this.initData,
    loading: false,
    unitNumError: false,
    quantityError: false,
    scancodeError: false,
  }

  constructor(props) {
    super(props);

    this.scancodeInputRef = React.createRef();
    this.quantityInputRef = React.createRef();

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleScancodeChange = this.handleScancodeChange.bind(this);
    this.handleScancodeKeyPress = this.handleScancodeKeyPress.bind(this);
  }

  static generateLineItemNo() {
    const x = parseInt(Math.random() * 10, 10);
    let lineItemNo = (moment() + x).toString();
    lineItemNo = lineItemNo.substring(5, lineItemNo.length);

    return lineItemNo;
  }

  handleSubmit() {
    let error = false;

    if (this.state.data.quantity === '' || this.state.data.quantity <= 0) {
      this.setState({ quantityError: true });
      error = true;
    } else {
      this.setState({ quantityError: false });
    }

    if (this.state.data.unitNum <= 0) {
      this.setState({ unitNumError: true });
      error = true;
    } else {
      this.setState({ unitNumError: false });
    }

    if (error) {
      return;
    }

    // add product to list
    const { product } = this.state;
    const data = {
      itemId: CreateReplenishForm.generateLineItemNo(),
      sku: product.sku,
      caseNbr: product.barcode,
      name: product.productName,
      unitNum: this.state.data.unitNum,
      quantity: this.state.data.quantity,
    };

    this.props.onSubmit(data);
    this.setState({ data: this.initData, product: {}, scancode: '' });
    this.scancodeInputRef.current.focus();
  }

  handleFormChange(e, { name, value }) {
    this.setState(prevState => ({ data: { ...prevState.data, [name]: value } }));
  }

  handleScancodeChange(e, { value }) {
    if (value === this.state.scancode) {
      return;
    }

    this.setState({ scancode: value });
  }

  handleScancodeKeyPress(e) {
    if (this.state.scancode === '') {
      return;
    }

    if (e.key === 'Enter') {
      this.setState({ loading: true, product: {} });
      const { accountNo, token } = this.props;
      const { scancode } = this.state;
      api.inventory.getProductInfoByScanCode(scancode, token).then((res) => {
        if (res.data) {
          if (res.data.length > 0) { // product exist
            // filter account
            const product = res.data.find(obj => parseInt(obj.accountNo, 10) === accountNo);
            this.setState(prevState => ({ loading: false, product, data: { ...prevState.data, quantity: '' } }));
            this.quantityInputRef.current.focus();
          } else {
            toast.warning('Cannot find product associate to the scancode.');
            this.setState({ loading: false, scancode: '', product: {} });
          }
        } else {
          this.setState({ loading: false });
        }
      }).catch((error) => {
        toast.error(error.message);
        this.setState({ loading: false });
      });
    }
  }

  render() {
    const { data, loading, scancode, unitNumError, quantityError, scancodeError, product } = this.state;
    const { accountNo } = this.props;

    return (
      <Form inverted widths="equal" size="small" onSubmit={this.handleSubmit} loading={loading}>
        <Form.Group>
          <Form.Field
            disabled={accountNo === 0}
            error={scancodeError}
            required
          >
            <label>
Scancode
            </label>
            <Input
              disabled={accountNo === 0}
              name="scancode"
              value={scancode}
              ref={this.scancodeInputRef}
              onChange={this.handleScancodeChange}
              onKeyPress={this.handleScancodeKeyPress}
            />
          </Form.Field>
          <Form.Field
            control={Input}
            required
            label="Unit Num"
            width="4"
            name="unitNum"
            value={data.unitNum}
            disabled={accountNo === 0 || !product.barcode}
            onChange={this.handleFormChange}
            error={unitNumError}
          />
          <Form.Field
            width="4"
            required
            error={quantityError}
            disabled={accountNo === 0}
          >
            <label>
Quantity
            </label>
            <Input
              name="quantity"
              value={data.quantity}
              onChange={this.handleFormChange}
              ref={this.quantityInputRef}
              disabled={accountNo === 0 || !product.barcode}
            />
          </Form.Field>
        </Form.Group>
        <Form.Field
          control={Button}
          className="submit-btn"
          disabled={accountNo === 0 || !product.barcode}
        >
          Add Product
        </Form.Field>
      </Form>
    );
  }
}

CreateReplenishForm.propTypes = {
  accountNo: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CreateReplenishForm;
