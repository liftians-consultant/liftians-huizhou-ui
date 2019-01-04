import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

const tableStyle = {
  background: '#fff',
  padding: '5px',
  borderRadius: '5px',
};

const GenReplenishProductListTable = ({ listData, columns }) => (
  <div className="product-table-container" style={tableStyle}>
    <ReactTable
      columns={columns}
      data={listData}
      defaultPageSize={5}
      manual
      resizable={false}
      filterable={false}
      showPageJump={false}
      showPagination={false}
      className="-striped -highlight product-list-table"
    />
  </div>
);

GenReplenishProductListTable.propTypes = {
  listData: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
};

export default GenReplenishProductListTable;
