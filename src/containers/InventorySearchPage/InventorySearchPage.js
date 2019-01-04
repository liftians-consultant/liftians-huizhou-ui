import React, { Component } from 'react';
import { connect } from 'react-redux';
// import PropTypes from 'prop-types';
import moment from 'moment';
import ReactTable from 'react-table';
import checkboxHOC from 'react-table/lib/hoc/selectTable';
import { Form, Input, Select, Button } from 'semantic-ui-react';
import api from 'api';
import InventorySearchTableColumns from 'models/InventorySearchTableColumns';
import './InventorySearchPage.css';
// import 'react-datepicker/dist/react-datepicker.css';

const CheckboxTable = checkboxHOC(ReactTable);

// const typeOptions = [
//   { key: 'all', text: 'All', value: '' },
//   { key: 'low', text: 'Low', value: '1' },
//   { key: 'medium', text: 'Medium', value: '2' },
//   { key: 'high', text: 'High', value: '3' },
// ]

// const catalogOptions = [
//   { key: 'all', text: 'All', value: '' },
//   { key: '1', text: 'Type I', value: '1'},
//   { key: '2', text: 'Type II', value: '2' },
//   { key: '3', text: 'Type III', value: '3' },
// ];

// const expireDateOptions = [
//   { key: '0', text: 'All', value: '9999' },
//   { key: '1', text: '<= 3 months', value: '3'},
//   { key: '2', text: '<= 6 months', value: '6' },
//   { key: '3', text: '<= 9 months', value: '9' },
//   { key: '4', text: '<= a year', value: '12' }
// ]

class InventorySearchPage extends Component {
  state = {
    productTypeOptions: [],
    productCategoryOptions: [],
    expirationDateOptions: [],
    type: '',
    category: '',
    productId: '',
    productName: '',
    expireDate: '9999',
    searchedList: [],
    selection: [],
    selectAll: false,
  }

  constructor(props) {
    super(props);

    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.resetForm = this.resetForm.bind(this);
  }

  componentWillMount() {
    this.getProductType();
    this.getProductCategory();
    this.getExpirationMonthRange();
  }

  getProductCategory() {
    api.inventory.getProductCategory().then((res) => {
      if (res.data) {
        const productCategoryOptions = res.data.map((option, index) => ({
          key: index,
          text: option.categoryName,
          value: option.categoryID,
        }));
        this.setState({ productCategoryOptions });
      }
    });
  }

  getProductType() {
    api.inventory.getProductType().then((res) => {
      if (res.data) {
        const productTypeOptions = res.data.map((option, index) => ({
          key: index,
          text: option.productTypeName,
          value: option.productTypeID,
        }));
        this.setState({ productTypeOptions });
      }
    });
  }

  getExpirationMonthRange() {
    api.inventory.getExpirationMonthRange().then((res) => {
      if (res.data) {
        const expirationDateOptions = res.data.map((option, index) => ({
          key: index,
          text: option.displayValue,
          value: option.monthID,
        }));
        this.setState({ expirationDateOptions });
      }
    });
  }

  resetForm() {
    console.log('[INVENTORY SEARCH] Reset Form');
    this.setState({
      type: '',
      category: '',
      productId: '',
      productName: '',
      expireDate: '9999',
      searchedList: [],
      selection: [],
      selectAll: false,
    });
  }

  handleSubmit() {
    const data = {
      type: this.state.type || '',
      category: this.state.category || '',
      productId: this.state.productId || '',
      productName: this.state.productName || '',
      expireDate: this.state.expireDate || 9999,
    };

    console.log('Search Submit Data:', data);
    api.inventory.getInventorySummaryByProduct(data).then((res) => {
      if (res.data) {
        res.data.map((object) => {
          object.pick_DATE = moment(object.expirDate).format(process.env.REACT_APP_TABLE_DATE_FORMAT);
          return object;
        });
        this.setState({ searchedList: res.data });
      }
    });
  }

  handleFormChange = (e, { name, value }) => {
    console.log('form change', value);
    const newState = {};
    newState[name] = value;
    this.setState(newState);
  }

  handleDateChange(e) {
    this.setState({ expireDate: e.format('MM-DD-YYYY') });
  }


  /* eslint-disable */
  // For Select React Table

  toggleSelection = (key, shift, row) => {
    // start off with the existing state
    let selection = [
      ...this.state.selection,
    ];
    const keyIndex = selection.indexOf(key);
    // check to see if the key exists
    if (keyIndex >= 0) {
      // it does exist so we will remove it using destructing
      selection = [
        ...selection.slice(0, keyIndex),
        ...selection.slice(keyIndex + 1),
      ];
    } else {
      // it does not exist so add it
      selection.push(key);
    }
    // update the state
    this.setState({ selection });
  }

  // For Select React Table
  toggleAll = () => {
    const selectAll = !this.state.selectAll;
    const selection = [];
    if (selectAll) {
      // we need to get at the internals of ReactTable
      const wrappedInstance = this.checkboxTable.getWrappedInstance();
      // the 'sortedData' property contains the currently accessible records based on the filter and sort
      const currentRecords = wrappedInstance.getResolvedState().sortedData;
      // we just push all the IDs onto the selection array
      currentRecords.forEach((item) => {
        selection.push(item._original.sourceID);
      });
    }
    this.setState({ selectAll, selection });
  }

  /* eslint-enable */

  // For Select React Table
  isSelected = key => this.state.selection.includes(key);


  render() {
    const { toggleSelection, toggleAll, isSelected } = this;
    const { type, category, productId, productName, expireDate,
      searchedList, selectAll, productTypeOptions, productCategoryOptions, expirationDateOptions } = this.state;

    const checkboxProps = {
      selectAll,
      isSelected,
      toggleSelection,
      toggleAll,
      selectType: 'checkbox',
      keyField: 'productID',
    };

    return (
      <div className="inventory-search-page">
        <Form inverted widths="equal" size="small" onSubmit={this.handleSubmit}>
          <Form.Group>
            <Form.Field control={Select} label="Type" name="type" value={type} options={productTypeOptions} onChange={this.handleFormChange} />
            <Form.Field control={Select} label="Catalog" name="category" value={category} options={productCategoryOptions} onChange={this.handleFormChange} />
            {/* <Form.Field control={ Input } label="Code" name="code" value={ code } onChange={ this.handleFormChange } /> */}
          </Form.Group>
          <Form.Group>
            <Form.Field control={Input} label="Product ID" name="productId" value={productId} onChange={this.handleFormChange} />
            <Form.Field control={Input} label="Product Name" name="productName" value={productName} onChange={this.handleFormChange} />
            {/* <Form.Field control={Input} label="Lot" value={lot} onChange={this.handleFormChange} /> */}
            {/* <Form.Field control={DatePicker} label="Expire Date" value={String(expireDate)} onChange={this.handleDateChange} /> */}
            <Form.Field control={Select} label="Expire Date" name="expireDate" value={expireDate} options={expirationDateOptions} onChange={this.handleFormChange} />
            <Form.Field control={Button} primary className="submit-btn">Submit</Form.Field>
            <Button type="button" className="reset-btn" onClick={this.resetForm}>Reset</Button>
          </Form.Group>
        </Form>

        <div className="search-result-table-container">
          <CheckboxTable
            ref={(r) => { this.checkboxTable = r; }}
            data={searchedList}
            columns={InventorySearchTableColumns}
            className="-striped -highlight search-result-table"
            defaultPageSize={15}
            manual
            resizable={false}
            filterable={false}
            {...checkboxProps}
          />
        </div>
      </div>
    );
  }
}

/**
 *  Type: dropdown
 *  Catalog: dropdown
 *  Code
 *  Abbreviation
 *  Name
 *  Lot
 *  Expire date
 */

InventorySearchPage.propTypes = {

};

function mapStateToProps(state) {
  return {
    stationId: state.station.id,

  };
}

export default connect(mapStateToProps, {})(InventorySearchPage);
