export default {
  testPhone: function (phone) {
    return /^1(3|4|5|7|8|9)\d{9}$/.test(phone);
  },
  testPassword: function (password) {
    password = password || '';
    return password.length > 7 && password.length < 21 && /^[0-9a-z]+$/gi.test(password) && /\d/.test(password) && /[a-z]/i.test(password);
  },
  testTradePassword: function (password) {
    password = password || '';
    return password.length == 6 && /\d{6}/.test(password);
  },
  testIdCard: function (idCard) {
    return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard);
  },
  testBankCard: function (bankCard) {
    return /^\d{15,19}$/.test(bankCard);
  },
  testInpour: function (money) {
    return /^[1-9][0-9]{0,3}$/.test(money);
  },
  testWithDraw: function (money) {
    return /^[1-9][0-9]{0,8}(\.[0-9]{1,2})?$/.test(money);
  },
  testRealName: function (name) {
    return /^[^0-9]{1,100}$/.test(name)
  },
  testEmail: function (email) {
    return /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(email)
  }
};
