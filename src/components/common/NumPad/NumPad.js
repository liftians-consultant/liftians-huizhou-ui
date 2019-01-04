import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import './NumPad.css';

class NumPad extends Component {
  state = {
    showMore: false,
    total: '',
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.highlightAmount !== this.state.highlightAmount && nextProps.highlightAmount < 10) {
      this.setState({ showMore: false });
    }
  }

  clickHandler(number) {
    this.props.callback(number);
  }

  otherClickHandler() {
    this.setState({ showMore: true });
  }

  selectNumberHandler(number) {
    if (number === -1) {
      this.setState({ total: '' });
    } else {
      let { total } = this.state;
      total += number;
      this.setState({ total });
    }
  }

  enterHandler() {
    // console.log(this.state.total);
    this.props.callback(parseInt(this.state.total, 10));
  }

  render() {
    const { highlightAmount } = this.props;
    const { showMore, total } = this.state;
    const disabled = this.props.disabled !== undefined ? this.props.disabled : false;

    return (
      <div>
        { !showMore && (
          <div className="numpad-container">
            <div className="num-group">
              <Button disabled={disabled || highlightAmount < 1} primary={highlightAmount >= 1} onClick={() => this.clickHandler(1)}>
1
              </Button>
              <Button disabled={disabled || highlightAmount < 2} primary={highlightAmount >= 2} onClick={() => this.clickHandler(2)}>
2
              </Button>
              <Button disabled={disabled || highlightAmount < 3} primary={highlightAmount >= 3} onClick={() => this.clickHandler(3)}>
3
              </Button>
            </div>
            <div className="num-group">
              <Button disabled={disabled || highlightAmount < 4} primary={highlightAmount >= 4} onClick={() => this.clickHandler(4)}>
4
              </Button>
              <Button disabled={disabled || highlightAmount < 5} primary={highlightAmount >= 5} onClick={() => this.clickHandler(5)}>
5
              </Button>
              <Button disabled={disabled || highlightAmount < 6} primary={highlightAmount >= 6} onClick={() => this.clickHandler(6)}>
6
              </Button>
            </div>
            <div className="num-group">
              <Button disabled={disabled || highlightAmount < 7} primary={highlightAmount >= 7} onClick={() => this.clickHandler(7)}>
7
              </Button>
              <Button disabled={disabled || highlightAmount < 8} primary={highlightAmount >= 8} onClick={() => this.clickHandler(8)}>
8
              </Button>
              <Button disabled={disabled || highlightAmount < 9} primary={highlightAmount >= 9} onClick={() => this.clickHandler(9)}>
9
              </Button>
            </div>
            <div className="num-group">
              <Button disabled={disabled || highlightAmount < 9} primary={highlightAmount > 9} onClick={() => this.otherClickHandler()} className="other-btn">
Other
              </Button>
            </div>
          </div>
        )}

        { showMore && (
          <div className="numpad-container show-more">
            <div className="num-group total-label">
              <label>
                {total}
              </label>
            </div>
            <div className="num-group">
              <Button onClick={() => this.selectNumberHandler(1)}>
1
              </Button>
              <Button onClick={() => this.selectNumberHandler(2)}>
2
              </Button>
              <Button onClick={() => this.selectNumberHandler(3)}>
3
              </Button>
            </div>
            <div className="num-group">
              <Button onClick={() => this.selectNumberHandler(4)}>
4
              </Button>
              <Button onClick={() => this.selectNumberHandler(5)}>
5
              </Button>
              <Button onClick={() => this.selectNumberHandler(6)}>
6
              </Button>
            </div>
            <div className="num-group">
              <Button onClick={() => this.selectNumberHandler(7)}>
7
              </Button>
              <Button onClick={() => this.selectNumberHandler(8)}>
8
              </Button>
              <Button onClick={() => this.selectNumberHandler(9)}>
9
              </Button>
            </div>
            <div className="num-group">
              <Button onClick={() => this.selectNumberHandler(0)}>
0
              </Button>
              <Button className="enterBtn" onClick={() => this.enterHandler()}>
Enter
              </Button>
              <Button className="enterBtn" onClick={() => this.selectNumberHandler(-1)}>
Clear
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

NumPad.propTypes = {
  highlightAmount: PropTypes.number.isRequired,
  callback: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default NumPad;
