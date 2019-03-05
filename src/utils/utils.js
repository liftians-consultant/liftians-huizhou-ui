import { toast } from 'react-toastify';

export function parseJSON(result) {
  return result.data.liftians;
}

export function parseResult(result, byPassCode = [], successBypassCode = []) {
  const res = result.data.liftians;

  if (res.result === '1' || successBypassCode.includes(res.result)) {
    return {
      success: true,
      code: res.result,
      data: result.data.liftians.data,
    };
  }
  const errorMessage = `Error Code: ${res.result}, \nMessage: ${res.data}`;

  if (!byPassCode.includes(res.result)) {
    toast.error(errorMessage);
  }

  return {
    success: false,
    code: res.result,
    message: errorMessage,
    data: res.data,
  };
}

export function clearAllInterval() {
  const intervalLimit = 9999;
  for (let i = 1; i < intervalLimit; i++) {
    window.clearInterval(i);
  }
}
