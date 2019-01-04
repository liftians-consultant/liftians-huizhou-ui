import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Modal, Icon, Table } from 'semantic-ui-react';

import './SearchProductModal.css';
import InputDialogModal from '../InputDialogModal';

const styles = {
  submitBtn: {
    marginTop: 25,
  },
};

class SearchProductModal extends Component {
  state = {
    loading: false,
    productList: [],
    selectedProduct: {},
    openConfirmDialog: false,
    quantity: 0,
  };

  constructor() {
    super();

    this.handleSearch = this.handleSearch.bind(this);
    this.handleRowSelect = this.handleRowSelect.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleQuantityChange = this.handleQuantityChange.bind(this);
    this.handleDialogSubmit = this.handleDialogSubmit.bind(this);
  }

  handleClose() {
    this.setState({ productList: [], selectedProduct: {} });
    this.props.onClose();
  }

  // handleFormChange = (e, { value }) => {

  // }


  handleSearch() {
    const result = [{
      sku: '12345',
      barCode: '0010 3923',
      productName: 'This is a product',
      quantity: 12,
      unit_num: 1,
    }];

    this.setState({ productList: result, selectedProduct: {} });
  }

  handleRowSelect = (product) => {
    this.setState({ selectedProduct: product, quantity: product.quantity });
  }

  handleConfirm = () => {
    this.setState({ openConfirmDialog: true });
  }

  handleDialogSubmit = () => {
    const { quantity, selectedProduct } = this.state;
    if (quantity > selectedProduct.quantity) {
      this.setState({ dialogErrorMessage: 'Quantity cannot be larger than inventory' });
    } else {
      this.setState({ openConfirmDialog: false });
      const data = {
        sku: selectedProduct.sku,
        name: selectedProduct.productName,
        unitNum: selectedProduct.unit_num,
        quantity,
      };
      this.props.onSubmit(data);
    }
  }

  handleQuantityChange = (e, { value }) => {
    this.setState({ quantity: parseInt(value, 10) });
  }

  render() {
    const { loading, productList, selectedProduct, openConfirmDialog, dialogErrorMessage, quantity } = this.state;
    const { open } = this.props;

    const tableRows = productList.map(item => (
      <Table.Row
        key={item.barCode}
        onClick={() => this.handleRowSelect(item)}
        className={selectedProduct.barCode === item.barCode ? 'selected' : ''}
      >
        <Table.Cell>
          {item.sku}
        </Table.Cell>
        <Table.Cell>
          {item.barCode}
        </Table.Cell>
        <Table.Cell>
          {item.productName}
        </Table.Cell>
        <Table.Cell>
          {item.quantity}
        </Table.Cell>
      </Table.Row>
    ));

    for (let i = tableRows.length; i < 10; ++i) {
      tableRows.push((
        <Table.Row key={i}>
          <Table.Cell />
          <Table.Cell />
          <Table.Cell />
          <Table.Cell />
        </Table.Row>
      ));
    }

    return (
      <Modal
        open={open}
        onClose={this.handleClose}
        id="search-product-modal"
        style={{ marginTop: '10%', marginLeft: 'auto', marginRight: 'auto' }}
      >
        <Modal.Header>
Search for Product
        </Modal.Header>
        <Modal.Content>
          <Form widths="equal" size="small" loading={loading} onSubmit={this.handleSearch}>
            <Form.Group>
              <Form.Field control={Input} width="6" label="SKU" name="sku" onChange={this.handleFormChange} />
              <Form.Field control={Input} width="6" label="Barcode" name="barcode" onChange={this.handleFormChange} />
              <Form.Field control={Button} primary className="submit-btn" style={styles.submitBtn}>
Search
              </Form.Field>
            </Form.Group>
          </Form>
          <Table celled selectable sortable striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
SKU
                </Table.HeaderCell>
                <Table.HeaderCell>
Barcode
                </Table.HeaderCell>
                <Table.HeaderCell>
Name
                </Table.HeaderCell>
                <Table.HeaderCell>
Inventory
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body style={{ minHeight: 100 }}>
              { tableRows }
            </Table.Body>
          </Table>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            disabled={!selectedProduct.barCode}
            onClick={this.handleConfirm}
          >
            Confirm
            {' '}
            <Icon name="chevron right" />
          </Button>
          <InputDialogModal
            open={openConfirmDialog}
            errorMessage={dialogErrorMessage}
            inputValue={quantity}
            onClose={() => this.setState({ openConfirmDialog: false })}
            onInputChange={this.handleQuantityChange}
            onSubmit={this.handleDialogSubmit}
          />

        </Modal.Actions>
      </Modal>
    );
  }
}

SearchProductModal.propTypes = {
  open: PropTypes.bool.isRequired,
  // accountNo: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SearchProductModal;
