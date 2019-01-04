import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Modal, Message } from 'semantic-ui-react';

const InputDialogModal = ({ open, onClose, onInputChange, onSubmit, inputValue, errorMessage }) => (
  <Modal
    open={open}
    size="mini"
    onClose={onClose}
    id="enter-inventory-modal"
    style={{ marginTop: '15%', marginLeft: 'auto', marginRight: 'auto' }}
  >
    <Modal.Header>
Quantity to deliver
    </Modal.Header>
    <Modal.Content>
      <Form onSubmit={onSubmit}>
        <Form.Field>
          <Input
            fluid
            focus
            type="number"
            value={inputValue}
            onChange={onInputChange}
            error={errorMessage !== ''}
          />
        </Form.Field>
      </Form>
      { errorMessage !== '' && (
        <Message error>
          {errorMessage}
        </Message>
      )}
    </Modal.Content>
  </Modal>
);

InputDialogModal.defaultProps = {
  errorMessage: '',
};

InputDialogModal.propTypes = {
  open: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  inputValue: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default InputDialogModal;
