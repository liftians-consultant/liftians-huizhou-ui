import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Button, Modal, Table } from 'semantic-ui-react';

const OrderDetailListModal = ({ orderList }) => {
  const orderElement = _.map(orderList, (order, index) => (
    <Table.Row key={index}>
      <Table.Cell>{ order.order_no }</Table.Cell>
      <Table.Cell>{ order.quantity }</Table.Cell>
      <Table.Cell>{ order.customer }</Table.Cell>
      <Table.Cell>{ order.send_prior }</Table.Cell>
    </Table.Row>
  ));

  return (
    <Modal
      trigger={<Button>Orders List</Button>}
      size="small"
      style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto' }}
    >
      <Modal.Header>Current Handling Orders</Modal.Header>
      <Modal.Content scrolling>
        <Modal.Description>
          <p>These are all the orders the system are currently handling.</p>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Order #</Table.HeaderCell>
                <Table.HeaderCell>Quantity</Table.HeaderCell>
                <Table.HeaderCell>Customer</Table.HeaderCell>
                <Table.HeaderCell>Priorty</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              { orderElement }
            </Table.Body>
          </Table>

        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

OrderDetailListModal.propTypes = {
  orderList: PropTypes.array.isRequired,
};

export default OrderDetailListModal;
