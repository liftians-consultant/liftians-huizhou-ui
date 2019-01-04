import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import OrderDetailTable from 'components/common/OrderDetailTable/OrderDetailTable';
import 'react-table/react-table.css';


const OrderListTable = ({ columns, listData, loading }) => (
  <ReactTable
    columns={columns}
    data={listData}
    defaultPageSize={12}
    SubComponent={row => <OrderDetailTable taskType="P" recordId={row.original.order_No} />}
    loading={loading}
    manual
    resizable={false}
    filterable={false}
    showPageJump={false}
    showPagination={false}
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
};

export default OrderListTable;
