import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown } from 'semantic-ui-react';

const OperationTaskMenu = (props) => {
  const processOptionsList = props.activeBillType === 4 ? props.processOptions[1] : props.processOptions[0]; // If billType is Adjustment then use special process list
  const processMenuItems = processOptionsList.map((option, i) => (
    <Menu.Item
      key={i}
      index={i}
      active={props.activeProcessType === option.value}
      content={option.text}
      value={option.value}
      onClick={props.onProcessChange}
    >
    </Menu.Item>
  ));

  return (
    <Menu className="operaetion-task-Menu">
      <Menu.Item name="taskType">
        <Dropdown
          placeholder="Select Task"
          value={props.activeBillType}
          fluid
          selection
          options={props.billTypeOptions}
          onChange={props.onTaskChange}
        />
      </Menu.Item>
      { processMenuItems }
    </Menu>
  );
};

OperationTaskMenu.propTypes = {
  activeBillType: PropTypes.string.isRequired,
  processOptions: PropTypes.array.isRequired,
  billTypeOptions: PropTypes.array.isRequired,
  onTaskChange: PropTypes.func.isRequired,
  onProcessChange: PropTypes.func.isRequired,
};

export default OperationTaskMenu;
