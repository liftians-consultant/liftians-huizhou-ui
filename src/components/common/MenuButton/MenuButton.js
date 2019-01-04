import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from 'semantic-ui-react';
import './MenuButton.css';

class MenuButton extends Component {
  clickHandler() {
    this.props.clickHandler(`/${this.props.name}`);
  }

  render() {
    const { title, isDisabled, iconName } = this.props;

    const menuClass = classNames({
      menuBtn: true,
      'btn-disabled': isDisabled,
    });

    return (
      // eslint-disable-next-line
      <div className={menuClass} onClick={() => this.clickHandler()}>
        { iconName && (
          <div className="menuBtn-icon">
            <Icon name={iconName} size="huge" inverted />
          </div>
        )}
        <span className={iconName ? 'menuBtn-span' : 'menuBtn-span withoutIcon'}>
          { title }
        </span>
      </div>
    );
  }
}

MenuButton.defaultProps = {
  iconName: '',
  isDisabled: false,
  clickHandler: () => {},
};

MenuButton.propTypes = {
  title: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  iconName: PropTypes.string,
  isDisabled: PropTypes.bool,
  clickHandler: PropTypes.func,
};

export default MenuButton;
