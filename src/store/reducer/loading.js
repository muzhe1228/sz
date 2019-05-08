import {IS_LOADING} from 'store/action/loading';

export const isLoading = (state, action) => {
  switch (action.type) {
    case IS_LOADING :
      return {
        ...state,
        isLoading: action.isLoading
      }
    default :
      return {
        isLoading: false
      }
  }
};
