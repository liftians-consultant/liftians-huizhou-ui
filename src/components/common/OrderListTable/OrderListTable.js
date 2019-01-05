import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import 'react-table/react-table.css';


const OrderListTable = ({ columns, listData, loading, onFetchData, pages }) => (
  <ReactTable
    columns={columns}
    data={listData}
    // pages={pages}
    defaultPageSize={10}
    loading={loading}
    // onFetchData={onFetchData}
    manual
    resizable={false}
    filterable={false}
    className="-striped -highlight orderlist-table"
  />
);

OrderListTable.defaultProps = {
  loading: false,
};

OrderListTable.propTypes = {
  listData: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  columns: PropTypes.array.isRequired,
  onFetchData: PropTypes.func.isRequired,
  pages: PropTypes.number.isRequired,
};

export default OrderListTable;
