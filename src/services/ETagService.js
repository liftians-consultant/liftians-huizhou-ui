import api from 'api';

// if (process.env.REACT_APP_ENV === 'PRODUCTION') {
const ETagService = {
  turnPickLightOnById: (labelId, num) => {
    api.eTag.turnPickLightOnById(labelId, num).then((res) => {
      if (res.data) {
        console.log(`[E-TAG] Turn on pick light #${labelId} with ${num}`);
      } else {
        console.log(`[E-TAG] Pick light turn on failed #${labelId} with ${num}`);
      }
    });
  },

  turnPickLightOffById: (labelId) => {
    api.eTag.turnPickLightOffById(labelId).then((res) => {
      if (res.data) {
        console.log(`[E-TAG] Turn off pick light #${labelId}`);
      } else {
        console.log(`[E-TAG] Pick light turn off failed #${labelId}`);
      }
    });
  },

  turnEndLightOnById: (labelId) => {
    api.eTag.turnEndLightOnById(labelId).then((res) => {
      if (res.data) {
        console.log(`[E-TAG] Turn on End light #${labelId}`);
      } else {
        console.log(`[E-TAG] End light turn on failed #${labelId}`);
      }
    });
  },

  turnEndLightOffById: (labelId) => {
    api.eTag.turnEndLightOffById(labelId).then((res) => {
      if (res.data) {
        console.log(`[ELECTRONIC LABEL] Turn off End light #${labelId}`);
      } else {
        console.log(`[ELECTRONIC LABEL] End light turn off failed #${labelId}`);
      }
    });
  },

  checkRespond: labelId => api.eTag.checkRespond(labelId).then((res) => {
    if (res.data) {
      return res.data;
    }
    return false;
  }),
};
// } else {
//   ETagService = {
//     turnPickLightOnById: () => {
//       return Promise.resolve(true);
//     },

//     turnPickLightOffById: () => {
//       return Promise.resolve(true);
//     },

//     turnEndLightOnById: () => {
//       return Promise.resolve(true);
//     },

//     turnEndLightOffById: () => {
//       return Promise.resolve(true);
//     },

//     checkRespond: () => {
//       return Promise.resolve(true);
//     },
//   };
// }

export default ETagService;
