import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, Button, Select, Icon, Table } from 'semantic-ui-react';
import moment from 'moment';

import api from 'api';
import erpApi from 'erpApi';
import SubPageContainer from 'components/common/SubPageContainer/SubPageContainer';
import ConfirmDialogModal from 'components/common/ConfirmDialogModal/ConfirmDialogModal';
import SearchProductModal from 'components/common/SearchProductModal/SearchProductModal';

class GenerateDeliveryPage extends Component {
  state = {
    data: GenerateDeliveryPage.generateInitData(),
    accountListOptions: [],
    loading: false,
    openDeleteConfirm: false,
    openSubmitConfirm: false,
    openAddItemModal: false,
  };

  priorityOptions = GenerateDeliveryPage.createPriorityOptions();

  deleteIndex = '';

  constructor() {
    super();

    this.handleAccountChange = this.handleAccountChange.bind(this);
    this.handleDeleteItem = this.handleDeleteItem.bind(this);
  }

  componentWillMount() {
    erpApi.account.getAccountList().then((res) => {
      if (res.data) {
        console.log('[GEN REPLENISH] Get account list');
        const options = GenerateDeliveryPage.createAccountList(res.data.accounts);
        this.setState({ accountListOptions: options });
      }
    });
  }

  static generateInitData() {
    return {
      items: [],
      orderNo: GenerateDeliveryPage.generateOrdereNo(),
      accountNo: 0,
      priority: 1,
    };
  }

  static generateOrdereNo() {
    const x = parseInt(Math.random() * 10, 10);
    let requestNo = (moment() + x).toString();
    requestNo = `LIFTO${requestNo.substring(6, requestNo.length)}`;

    return requestNo;
  }

  static createAccountList(data) {
    const output = data.map(account => ({
      key: account.accountNo,
      text: `${account.accountName} (${account.accountNo}) - ${account.active ? 'Active' : 'Inactive'}`,
      value: account.accountNo,
    }));

    return output;
  }

  static createPriorityOptions() {
    const options = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(index => ({
      key: index,
      text: index,
      value: index,
    }));

    return options;
  }

  backBtnHandler = () => {
    console.log('back');
    this.props.history.goBack();
  }

  handleAccountChange(e, { name, value }) {
    this.setState(prevState => ({ data: { ...prevState.data, [name]: value } }));
  }

  handleDeleteItem = (index) => {
    this.deleteIndex = index;
    this.setState({ openDeleteConfirm: true });
  }

  handleDeleteConfirmAction(result) {
    if (result) {
      const newItems = [...this.state.data.items];
      newItems.splice(this.deleteIndex, 1);
      this.setState(prevState => ({ data: { ...prevState.data, items: newItems }, openDeleteConfirm: false }));
    }
    this.setState({ openDeleteConfirm: false });
  }

  handleSubmitConfirmAction(result) {
    if (result) {
      this.confirm(this.state.data);
      this.setState({ data: GenerateDeliveryPage.generateInitData(), openSubmitConfirm: false });
    }
    this.setState({ openSubmitConfirm: false });
  }

  handleNewItem = (item) => {
    const { data } = this.state;
    data.items.push(item);
    this.setState(prevState => ({ data: { ...prevState.data, items: data.items }, openAddItemModal: false }));
  }

  submit = data => erpApi.order.createOrder(data).then((res) => {
    if (res.data && res.data.success) {
      if (res.data.recordRejected > 0) {
        toast.error('I\'m sorry but your order has been rejected. Please make sure you have all the right data');
        return false;
      }

      toast.success('Order created in ERP!');
      // process to SPD
      api.erpProcess.order().then((response) => {
        if (response === 1) {
          toast.success('Order successfully proccesed to SPD');
        }
      });
      return true;
    }
    return false;
  })


  render() {
    const { loading, data, accountListOptions, openAddItemModal, openDeleteConfirm, openSubmitConfirm } = this.state;
    const { username } = this.props;


    const tableRows = data.items.map((item, index) => (
      <Table.Row key={item.barCode}>
        <Table.Cell>
          {item.sku}
        </Table.Cell>
        <Table.Cell>
          {item.name}
        </Table.Cell>
        <Table.Cell>
          {item.unitNum}
        </Table.Cell>
        <Table.Cell>
          {item.quantity}
        </Table.Cell>
        <Table.Cell>
          <Icon name="delete" size="big" onClick={() => this.handleDeleteItem(index)} />
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
          <Table.Cell />
        </Table.Row>
      ));
    }

    return (
      <div className="generate-order-page">
        <SubPageContainer
          title="Create Delivery(Order) Request"
          onBackBtnClicked={this.backBtnHandler}
        >
          <Form inverted widths="equal" size="small" loading={loading}>
            <Form.Group>
              <Form.Field control={Input} width="4" label="Order No (Auto Generate)" name="orderNo" value={data.orderNo} readOnly />
              <Form.Field control={Input} width="4" label="User" name="username" value={username} readOnly />
            </Form.Group>
            <Form.Group>
              <Form.Field control={Select} width="6" required label="Account" name="accountNo" value={data.accountNo} options={accountListOptions} onChange={this.handleAccountChange} />
              <Form.Field control={Select} width="1" required label="Priority" name="priority" value={data.priority} options={this.priorityOptions} onChange={this.handleFormChange} />
            </Form.Group>
          </Form>

          <Button
            disabled={data.accountNo === 0}
            onClick={() => this.setState({ openAddItemModal: true })}
          >
            Add
          </Button>

          <Table celled selectable sortable striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
SKU
                </Table.HeaderCell>
                <Table.HeaderCell>
Name
                </Table.HeaderCell>
                <Table.HeaderCell>
Unit Num
                </Table.HeaderCell>
                <Table.HeaderCell>
Quantity
                </Table.HeaderCell>
                <Table.HeaderCell>
Delete
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body style={{ height: 100 }}>
              { tableRows }
            </Table.Body>
          </Table>

          <Button
            primary
            disabled={data.items.length === 0}
            onClick={this.handleSubmit}
          >
            Submit
          </Button>
        </SubPageContainer>

        <SearchProductModal
          open={openAddItemModal}
          accountNo={data.accountNo}
          onSubmit={this.handleNewItem}
          onClose={() => this.setState({ openAddItemModal: false })}
        />

        <ConfirmDialogModal
          size="mini"
          open={openDeleteConfirm}
          close={this.handleDeleteConfirmAction}
          header="Delete Item"
          content="Are you sure you want to delete this item?"
        />

        <ConfirmDialogModal
          size="mini"
          open={openSubmitConfirm}
          close={this.handleSubmitConfirmAction}
          header="Confirm Submit"
          content="Please make sure the data is correct before you submit!"
        />

      </div>
    );
  }
}

GenerateDeliveryPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    username: state.user.username,
  };
}

export default connect(mapStateToProps, null)(GenerateDeliveryPage);
