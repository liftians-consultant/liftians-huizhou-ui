import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, Button, Select, Icon } from 'semantic-ui-react';
import moment from 'moment';


import erpApi from 'erpApi';
import api from 'api';
import SubPageContainer from 'components/common/SubPageContainer/SubPageContainer';
import CreateReplenishForm from 'components/forms/CreateReplenishForm';
import ConfirmDialogModal from 'components/common/ConfirmDialogModal/ConfirmDialogModal';
import GenReplenishProductListTable from 'components/tables/GenReplenishProductListTable';

class GenerateReplenishmentPage extends Component {
  initData = {
    items: [],
    accountNo: 0,
    requestNo: GenerateReplenishmentPage.generateReceiveNo(),
    priority: 1,
  };

  state = {
    data: this.initData,
    accountListOptions: [],
    loading: false,
    openDeleteConfirm: false,
    openSubmitConfirm: false,
  };

  // Keep the columns here because the call back need to be linked to "this"
  GenReplenishProductTableColumn = [
    {
      Header: 'Item Id',
      accessor: 'itemId',
    }, {
      Header: 'SKU',
      accessor: 'sku',
    }, {
      Header: 'Name',
      accessor: 'name',
      minWidth: 150,
    }, {
      Header: 'Unit Num',
      accessor: 'unitNum',
    }, {
      Header: 'Quantity',
      accessor: 'quantity',
    }, {
      Header: 'Remove',
      Cell: row => (
        <Icon name="delete" size="big" onClick={() => this.handleDeleteProduct(row.index)} />
      ),
    },
  ];

  priorityOptions = GenerateReplenishmentPage.createPriorityOptions();

  constructor(props) {
    super(props);

    this.handleAccountChange = this.handleAccountChange.bind(this);
    this.handleAddProduct = this.handleAddProduct.bind(this);
    this.handleDeleteProduct = this.handleDeleteProduct.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleDeleteConfirmAction = this.handleDeleteConfirmAction.bind(this);
    this.handleSubmitConfirmAction = this.handleSubmitConfirmAction.bind(this);
  }


  componentWillMount() {
    erpApi.account.getAccountList().then((res) => {
      if (res.data) {
        console.log('[GEN REPLENISH] Get account list');
        const options = GenerateReplenishmentPage.createAccountList(res.data.accounts);
        this.setState({ accountListOptions: options });
      }
    });
  }

  static generateReceiveNo() {
    const x = parseInt(Math.random() * 10, 10);
    let requestNo = (moment() + x).toString();
    requestNo = `A${requestNo.substring(6, requestNo.length)}`;

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

  static createProductList(data) {
    const output = data.map(product => ({
      key: product.sku,
      text: `${product.sku} (${product.barcode}) - ${product.name}`,
      value: product.sku,
      product,
    }));

    return output;
  }

  handleFormChange(e, { name, value }) {
    this.setState(prevState => ({ data: { ...prevState.data, [name]: value } }));
  }

  handleAccountChange(e, { name, value }) {
    this.setState(prevState => ({ data: { ...prevState.data, [name]: value } }));
  }

  handleDeleteProduct = (index) => {
    this.deleteIndex = index;
    this.setState({ openDeleteConfirm: true });
  }

  backBtnHandler = () => {
    console.log('back');
    this.props.history.goBack();
  }

  handleAddProduct(data) {
    console.log('Product added to items:', data);
    this.setState(prevState => ({ data: { ...prevState.data, items: [...prevState.data.items, data] } }));
  }

  handleFormSubmit = () => {
    this.setState({ openSubmitConfirm: true });
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
      const requestData = this.state.data;
      requestData.creator = this.props.username;
      requestData.receiveDate = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
      this.confirm(requestData);
      this.setState({ data: this.initData, openSubmitConfirm: false });
    }
    this.setState({ openSubmitConfirm: false });
  }

  confirm = data => erpApi.replenish.createReplenish(data).then((response) => {
    if (response.data && response.data.success) {
      if (response.data.recordRejected > 0) {
        toast.warn('Your request has been rejected. Please make sure all the information are correct.');
        return false;
      }

      toast.success('Replenish Created in ERP');
      // process to SPD
      api.erpProcess.replenishment().then((res) => {
        if (res === 1) {
          toast.success('Replenish successfully proccesed to SPD');
        }
      });
      return true;
    }
    return false;
  });

  render() {
    const { data, loading, accountListOptions, openDeleteConfirm, openSubmitConfirm } = this.state;
    const { username } = this.props;

    return (
      <div className="generate-replenishment-page">
        <SubPageContainer
          title="Create Replenish Request"
          onBackBtnClicked={this.backBtnHandler}
        >
          <Form inverted widths="equal" size="small" loading={loading}>
            <Form.Group>
              <Form.Field control={Input} width="4" label="Request No (Auto Generate)" name="requestNo" value={data.requestNo} readOnly />
              <Form.Field control={Input} width="4" label="User" name="username" value={username} readOnly />
            </Form.Group>
            <Form.Group>
              <Form.Field control={Select} width="6" required label="Account" name="accountNo" value={data.accountNo} options={accountListOptions} onChange={this.handleAccountChange} />
              <Form.Field control={Select} width="1" required label="Priority" name="priority" value={data.priority} options={this.priorityOptions} onChange={this.handleFormChange} />
            </Form.Group>
          </Form>
          <CreateReplenishForm
            onSubmit={this.handleAddProduct}
            accountNo={data.accountNo}
          />

          <br />
          <GenReplenishProductListTable
            listData={data.items}
            columns={this.GenReplenishProductTableColumn}
          />
          <br />
          <div>
            <Button primary size="large" onClick={this.handleFormSubmit} disabled={data.items.length === 0}>
              Create
            </Button>
          </div>
        </SubPageContainer>

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

GenerateReplenishmentPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    username: state.user.info.user_Name,
    // username: state.user.username,
  };
}

export default connect(mapStateToProps, null)(GenerateReplenishmentPage);
