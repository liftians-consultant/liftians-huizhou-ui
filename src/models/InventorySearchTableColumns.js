const InventorySearchTableColumns = [
  {
    Header: 'Product ID',
    accessor: 'productID',
    minWidth: 80,
  }, {
    Header: 'Name',
    accessor: 'productName',
    minWidth: 150,
  }, {
    Header: 'Expire Date',
    accessor: 'expirDate',
    minWidth: 120,
  }, {
    Header: 'Unit #',
    accessor: 'unitNum',
    maxWidth: 70,
  }, {
    Header: 'Quantity',
    accessor: 'quantity',
    maxWidth: 70,
  },
];

export default InventorySearchTableColumns;
