import { combineReducers } from 'redux';

import user from './user';
import station from './station';
import operation from './operation';
import status from './status';
import pickTask from './pickTask';

export default combineReducers({
  user,
  station,
  operation,
  status,
  pickTask,
});
