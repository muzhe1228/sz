export default {
  // userApiAddress: "http://user.api.bitgo.one",
  // tradeApiAddress: "http://trade.api.bitgo.one",
  // backServerAddress: "https://help.abc.com/webserver.json",

  testENV: { // 测试地址
    name: 'test2',
    httpApi: 'testweb.sz.com',
    socketTick: 'wss://testchq.sz.com',
    socketCurrency: 'wss://testsocket.sz.com/ws',//当前委托
    socketChat: 'wss://testchq.sz.com',
    uploadAPI: 'testupload.sz.com',
  },
  // 生产环境
  // web接口:https://web.mt1733.com
  // 行情:   wss://wsmarket.mt1733.com
  // 委托  wss://wsdepute.mt1733.com
  // 上传   https://upload.mt1733.com

  // IOS && android
  // 行情 tcp.mt1733.com:12388
  // 委托 netty : tcp.mt1733.com:8084

  devPro: { // 开发wss
    name: 'dev',
    httpApi: 'devweb.sz.com',
    socketTick: 'ws://devchq.sz.com',
    socketCurrency: 'ws://devsocket.sz.com/ws',//当前委托
    socketChat: 'ws://devchq.sz.com',
    uploadAPI: 'devupload.sz.com',
  },

  // httpApi: 'web.sz.com',
  // socketTick: 'wss://wmarket.sz.com',
  // socketCurrency:'wss://wsdepute.sz.com/ws',//当前委托
  // socketChat: 'wss://wmarket.sz.com',
  // uploadAPI: 'upload.sz.com',
  proENV: {//生产地址
    name: 'prod',
    httpApi: 'web.mt1733.com',
    socketTick: 'wss://wsmarket.mt1733.com',
    socketCurrency: 'wss://wsdepute.mt1733.com/ws',//当前委托
    socketChat: 'wss://wmarket.sz.com',
    uploadAPI: 'upload.mt1733.com',

  },
  getENV: function () {
    return this.proENV;
  }
}
