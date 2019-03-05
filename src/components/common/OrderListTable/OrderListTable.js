import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import 'react-table/react-table.css';


const OrderListTable = ({ columns, listData, loading, onFetchData, pages, pagination }) => (
  <ReactTable
    columns={columns}
    data={listData}
    pages={pages}
    defaultPageSize={10}
    loading={loading}
    onFetchData={onFetchData}
    manual
    // resizable={false}
    filterable={false}
    showPageJump={pagination}
    showPagination={pagination}
    className="-striped -highlight orderlist-table"
  />
);

OrderListTable.defaultProps = {
  loading: false,
  pagination: true,
  pages: 1,
  onFetchData: () => {},
};

OrderListTable.propTypes = {
  listData: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  columns: PropTypes.array.isRequired,
  onFetchData: PropTypes.func,
  pages: PropTypes.number,
  pagination: PropTypes.bool,
};

export default OrderListTable;
