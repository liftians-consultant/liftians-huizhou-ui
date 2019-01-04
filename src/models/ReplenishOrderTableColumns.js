const ReplenishOrderTableColumns = [
  {
    Header: 'Billing ID.',
    accessor: 'replenishBillNo',
    minWidth: 120,
  }, {
    Header: 'Source ID',
    accessor: 'sourceID',
  }, {
    Header: 'Receiver',
    accessor: 'receiver',
  }, {
    Header: 'Receive Date',
    accessor: 'replenishDate',
    minWidth: 150,
  }, {
    Header: '# of products',
    accessor: 'totalDistinctProduct',
  }, {
    Header: 'Total receive qty.',
    accessor: 'totalReceiveQty',
  }, {
    Header: 'Status',
    accessor: 'processStatus',
  },
];

export default ReplenishOrderTableColumns;
