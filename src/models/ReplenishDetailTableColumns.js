const ReplenishDetailTableColumns = [
  {
    Header: 'Barcode',
    accessor: 'barCode',
  }, {
    Header: 'Product',
    accessor: 'productName',
  }, {
    Header: 'Lot #',
    accessor: 'lot_no',
  }, {
    Header: 'Unit #',
    accessor: 'unit_num',
  }, {
    Header: 'Qty',
    accessor: 'receiveQty',
  }, {
    Header: 'Status',
    accessor: 'processStatus',
  },
];

export default ReplenishDetailTableColumns;
