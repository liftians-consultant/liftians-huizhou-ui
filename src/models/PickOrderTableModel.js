const PickOrderTableColumns = [
  {
    Header: 'Order No.',
    accessor: 'order_No',
  }, {
    Header: 'Customer',
    accessor: 'rec_DEPT_NAME',
  }, {
    Header: '# of Product',
    accessor: 'totalDistinctProduct',
    maxWidth: 100,
  }, {
    Header: 'Qty',
    accessor: 'totalOrder_Qty',
    maxWidth: 100,
  }, {
    Header: 'Order Date',
    accessor: 'pick_DATE',
    minWidth: 130,
  }, {
    Header: 'Status',
    accessor: 'processStatus',
  },
];

export default PickOrderTableColumns;
