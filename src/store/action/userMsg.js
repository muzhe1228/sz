export const USER_MSG = 'userMsg';

export const getUserMsg = (userMsg) => {
  return {
    type: USER_MSG,
    userMsg,
  }
}
