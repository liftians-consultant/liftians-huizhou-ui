/* eslint-disable import/prefer-default-export */
import { toast } from 'react-toastify';


export function parseJSON(result) {
  return result.data.liftians;
}

export function parseResult(result) {
  const res = result.data.liftians;

  if (res.result === '1') {
    return {
      success: true,
      data: result.data.liftians.data,
    };
  } else {
    // TODO: remember to consider other value
    toast.error(`Error Code: ${res.result}, \nMessage: ${res.data}`);
    return { success: false };
  }
}
