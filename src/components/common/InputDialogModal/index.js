import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Modal, Message } from 'semantic-ui-react';

class InputDialogModal extends Component {
  state = {
    value: '',
  }

  constructor() {
    super();

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentWillMount() {
    this.setState({
      value: this.props.initValue,
    });
  }

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

  handleInputChange = (e, { value }) => {
    this.setState({ value });
  }

  handleSubmit = () => {
    this.props.onSubmit(this.state.value);
    this.setState({ value: '' });
  }

  render() {
    const { value } = this.state;
    const {
      open,
      onClose,
      headerText,
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
          <Form onSubmit={this.handleSubmit}>
            <Form.Field>
              <Input
                fluid
                focus
                type={inputType}
                ref={this.handleRef}
                value={value}
                onChange={this.handleInputChange}
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
  initValue: '',
  inputType: 'number',
  onClose: () => {},
};

InputDialogModal.propTypes = {
  open: PropTypes.bool.isRequired,
  headerText: PropTypes.string,
  errorMessage: PropTypes.string,
  initValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  onClose: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  inputType: PropTypes.string,
};

export default InputDialogModal;
