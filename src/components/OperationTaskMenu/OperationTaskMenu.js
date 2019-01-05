import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'semantic-ui-react';

const OperationTaskMenu = (props) => {
  const processMenuItems = props.taskTypeOption.map((option, i) => (
    <Menu.Item
      key={i}
      index={i}
      active={props.activeTaskType === option.value}
      content={option.text}
      value={option.value}
      onClick={props.onTaskChange}
    >
    </Menu.Item>
  ));

  return (
    <Menu className="operaetion-task-Menu">
      { processMenuItems }
    </Menu>
  );
};

OperationTaskMenu.propTypes = {
  activeTaskType: PropTypes.string.isRequired,
  taskTypeOption: PropTypes.array.isRequired,
  onTaskChange: PropTypes.func.isRequired,
};

export default OperationTaskMenu;
