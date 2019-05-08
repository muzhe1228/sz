import {USER_MSG} from 'store/action/userMsg';
import {lStore} from 'js';

export const userMsg = (state, action) => {
  switch (action.type) {
    case USER_MSG :
      return {
        ...state,
        userMsg: action.userMsg
      }
    default :
      return {
        userMsg: lStore.get('userInfo') || null
      }
  }
};
