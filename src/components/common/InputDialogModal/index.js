import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Modal, Message } from 'semantic-ui-react';

class InputDialogModal extends Component {
  componentDidUpdate(prevProps) {
    if (prevProps.open !== this.props.open && this.props.open === true) {
      setTimeout(() => {
        this.inputRef.focus();
      }, 0);
    }
  }


  handleRef = (c) => {
    this.inputRef = c;
  }

  render() {
    const {
      open,
      onClose,
      headerText,
      onSubmit,
      inputValue,
      onInputChange,
      errorMessage,
      inputType,
    } = this.props;

    return (
      <Modal
        open={open}
        size="mini"
        onClose={onClose}
        id="input-dialog-modal"
      >
        <Modal.Header>{headerText}</Modal.Header>
        <Modal.Content>
          <Form onSubmit={onSubmit}>
            <Form.Field>
              <Input
                fluid
                focus
                type={inputType}
                ref={this.handleRef}
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
  }
}

InputDialogModal.defaultProps = {
  headerText: 'Quantity to deliver',
  errorMessage: '',
  inputType: 'number',
};

InputDialogModal.propTypes = {
  open: PropTypes.bool.isRequired,
  headerText: PropTypes.string,
  errorMessage: PropTypes.string,
  inputValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  onClose: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  inputType: PropTypes.string,
};

export default InputDialogModal;
