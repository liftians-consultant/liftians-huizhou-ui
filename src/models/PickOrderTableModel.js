const PickOrderTableColumns = [
  {
    Header: 'Barcode',
    accessor: 'barCode',
  }, {
    Header: 'Product',
    accessor: 'productId',
  }, {
    Header: 'Quantity',
    accessor: 'quantity',
    maxWidth: 100,
  }, {
    Header: 'UserId',
    accessor: 'userId',
  }, {
    Header: 'Status',
    accessor: 'statusName',
    maxWidth: 100,
  },
];

export default PickOrderTableColumns;
