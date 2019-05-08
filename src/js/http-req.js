import axios from 'axios';
import simpleUrl from 'simple-url';
import { browser } from 'src';
import { lStore } from 'js';
import { message } from 'antd';
import ENV from 'js/appConfig'

axios.defaults.retry = 0; // 关闭重连机制
axios.defaults.retryDelay = 100;
// axios.defaults.headers['x-user-env-info'] = 'sz.com';

axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  // console.log('axios request', config);
  return config;
}, function (error) {
  // Do something with request error
  console.log('axios request error', error);
  return Promise.reject(error);
});

axios.interceptors.response.use(function (response) {
  // Do something with response data
  // console.log('axios response', response);
  if (response.data.status === 401 || response.data.status == 403) {
    browser.push('/login');
  }

  return response;
}, function (err) {
  console.log(err);
  var config = err.config,
    status = err.response.data.status;
  // If the status code is 401, jump to login
  if (status === 401) {
    message.warning('登录失效，请重新登录')
    lStore.remove('userInfo');
    lStore.remove('token');

    // alert('登陆失效，请重新登陆');
    // Object.keys(logoutClearPairs).forEach(key => {
    // appStore.set(key, logoutClearPairs[key]);
    // });
    browser.push('/login');
  }
  // If config does not exist or the retry option is not set, reject
  // if (!config || !config.retry) return Promise.reject(err);

  // Set the variable for keeping track of the retry count
  config.__retryCount = config.__retryCount || 0;

  // Check if we've maxed out the total number of retries
  if (config.__retryCount >= config.retry) {
    // Reject with the error
    return Promise.reject(err.response);
  }

  // Increase the retry count
  config.__retryCount += 1;

  // Create new promise to handle exponential backoff
  var backoff = new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, config.retryDelay || 1);
  });

  // Return the promise in which recalls axios to retry the request
  return backoff.then(function () {
    return axios(config);
  });
  // Do something with response error
  // console.log('axios response error', error);
  // return Promise.reject(error);
});


function createUrl(path, query, hash) { // 用户接口
  return simpleUrl.create({
    protocol: ENV.getENV().name == 'test' ? 'http' : 'https',
    host: ENV.getENV().httpApi, // 动态配置地址
    // host: '47.98.65.112:8183',
    pathname: path,
    query: query,
    hash: hash
  });
}

// 用户模块
// 获取图形验证码
export function getImageCode(req) {
  return axios({
    url: createUrl('/auth/create_image_code', req),
    method: 'get'
  })
}

export let allAxios = axios;


//axios并发请求
export function getMoreSz() {
  let getArr = []
  for (let i = 0; i < arguments.length; i++) {
    getArr.push(getSingleSz(arguments[i].url, arguments[i].req))
  }
  return axios.all(getArr)
}
//GET 获取SZ接口数据
export function getSingleSz(url, req, isToken) {
  return axios({
    headers: {
      'Authorization': isToken ? '' : 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl(url),
    params: req,
    method: 'get'
  })
}
//POST 获取SZ接口数据
export function postSingleSz(url, req, isToken) {
  return axios({
    headers: {
      'Authorization': isToken ? '' : 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl(url),
    method: 'post',
    data: JSON.stringify(req),

  })
}

//基石投资人
export function getjishi(eq) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      "Content-Type": "application/json"
    },
    url: createUrl('/v1/assets/special/is_cornerstone'),
    method: 'get'
  })
}
//基石投资人
export function getshifang(eq) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      "Content-Type": "application/json"
    },
    url: createUrl('/v1/assets/special/get'),
    method: 'get'
  })
}

//获取极验数据
export function getGeetest(req) {
  return axios({
    url: createUrl('/auth/geetest', req),
    method: 'get'
  })
}

//修改用户名
export function updateNickName(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      "Content-Type": "application/json"
    },
    url: createUrl('/v1/user/update_nick_name'),
    method: 'put',
    data: JSON.stringify(req)
  })
}

// 验证谷歌码
export function verifyGoogleCode(req) {
  return axios({
    headers: {
      "Content-Type": "application/json"
    },
    url: createUrl('/auth/google_login'),
    method: 'put',
    data: JSON.stringify(req)
  })
}

// 找回密码
export function findPassword(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      "Content-Type": "application/json"
    },
    url: createUrl('/auth/find_pwd'),
    method: 'put',
    data: JSON.stringify(req)
  })
}

// 关闭谷歌验证
export function closeGoogleVerify(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      "Content-Type": "application/json"
    },
    url: createUrl('/v1/user/close_google_auth'),
    method: 'put',
    data: JSON.stringify(req)
  })
}

// 打开谷歌验证
export function openGoogleVerify(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      "Content-Type": "application/json"
    },
    url: createUrl('/v1/user/open_google_auth'),
    method: 'put',
    data: JSON.stringify(req)
  })
}

// 用户实名认证
export function realNameAuth(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      "Content-Type": "application/json"
    },
    url: createUrl('/v1/user/identity_auth'),
    method: 'post',
    data: JSON.stringify(req)
  })
}

// 用户实名认证-高级认证
export function seniorRealNameAuth(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      "Content-Type": "application/json"
    },
    url: createUrl('/v1/user/senior_identity_auth'),
    method: 'post',
    data: JSON.stringify(req)
  })
}

// 绑定谷歌设备
export function bindGoogleDevice(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      "Content-Type": "application/json"
    },
    url: createUrl('/v1/user/bind_google_device'),
    method: 'post',
    data: JSON.stringify(req)
  })
}

// 获取用户认证信息
export function getAuthInfo(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
    },
    url: createUrl('/v1/user/identity_auth_info'),
    method: 'get'
  })
}

// 上传图片
export function upload(formData) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'multipart/form-data'
    },
    url: `${ENV.getENV().name == 'test' ? 'http' : 'https'}://${ENV.getENV().uploadAPI}/v1/upload`, // 地址栏之后换成配置
    method: 'post',
    data: formData
  })
}

// 头像入库
export function portraitIntoDataBase(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      "Content-Type": "application/json"
    },
    url: createUrl('/v1/user/portrait'), // 地址栏之后换成配置
    method: 'post',
    data: JSON.stringify(req)
  })
}

// 发送短信验证码
export function sendSmsMobile(req) {
  return axios({
    headers: {
      "Content-Type": "application/json"
    },
    url: createUrl('/auth/send_sms_mobile'),
    method: 'post',
    data: JSON.stringify(req)  //JSON.stringify(req)
  })
}

// 绑定邮箱
export function bindEmail(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      "Content-Type": "application/json"
    },
    url: createUrl('/v1/user/bind_email'),
    method: 'post',
    data: JSON.stringify(req)
  })
}

// 获取用户信息
export function getUserInfo(req) {
  return axios({
    headers: { 'Authorization': 'Bearer ' + lStore.get('token') },
    url: createUrl('/v1/user/user_info', req),
    method: 'get'
  })
}

// 用户注册
export function register(req) {
  return axios({
    headers: {
      "Content-Type": "application/json"
    },
    url: createUrl('/auth/register', req),
    method: 'post',
    data: JSON.stringify(req)
  })
}

// 校验手机验证码
export function checkSmsMobile(req) {
  return axios({
    headers: {
      "Content-Type": "application/json"
    },
    url: createUrl('/auth/check_sms_mobile', req),
    method: 'post',
    data: JSON.stringify(req)
  })
}

// 校验邮箱验证码
export function checkSmsEmail(req) {
  return axios({
    headers: {
      "Content-Type": "application/json"
    },
    url: createUrl('/auth/check_sms_email', req),
    method: 'post',
    data: JSON.stringify(req)
  })
}

// 登录
export function login(req) {
  return axios({
    headers: {
      "Content-Type": "application/json"
    },
    url: createUrl('/auth/authorize'),
    method: 'put',
    data: JSON.stringify(req)
  })
}

//推出登录
export function logOut(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      "Content-Type": "application/json"
    },
    url: createUrl('/v1/user/login_out'),
    method: 'post',
    data: JSON.stringify(req)
  })
}

// 发送邮箱验证码
export function sendSmsEmail(req) {
  return axios({
    headers: {
      "Content-Type": "application/json"
    },
    url: createUrl('/auth/send_sms_email'),
    method: 'post',
    data: JSON.stringify(req)
  })
}

// 修改登录密码
export function updateLoginPwd(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      "Content-Type": "application/json"
    },
    url: createUrl('/v1/user/update_login_pwd'),
    method: 'put',
    data: JSON.stringify(req)
  })
}

// 换绑手机号
export function bindMobile(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/bind_mobile'),
    method: 'post',
    data: JSON.stringify(req)
  })
}

// 绑定资金密码
export function bindTradePwd(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/bind_trade_pwd'),
    method: 'put',
    data: JSON.stringify(req)
  })
}

// 绑定资金密码
export function getGoogleDevice(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/google_device'),
    method: 'post',
    data: JSON.stringify(req)
  })
}

//首页
// banner
export function getBanner(req) {
  return axios({
    url: createUrl('/v1/banner/', req),
    method: 'get'
  })
}
//公告
export function getNotice() {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
    },
    url: createUrl('/v1/announcement/list'),
    method: 'get'
  })
}

//币币交易
//历史委托
export function currency_getHistory(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
    },
    url: createUrl('/v1/tradeOrderHis/list', req),
    method: 'get'
  })
}
//当前委托
// export function currency_current(req){
//   return axios({
//     headers:{
//       'Authorization': 'Bearer ' + lStore.get('token'),
//     },
//     url:createUrl('',req),
//     method:'get'
//   })
// }
//买入卖出
export function currency_buySell(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/tradeOrder/confirm'),
    method: 'post',
    data: JSON.stringify(req)
  })
}
//创建市价委托单
export function currency_marketBuySell(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/tradeOrder/confirm/current'),
    method: 'post',
    data: JSON.stringify(req)
  })
}
//撤单
export function currency_cancelOrder(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/tradeOrder/cancelOrder'),
    method: 'post',
    data: JSON.stringify(req)
  })
}
//获取币对规则
export function currency_coinInfo(req) {
  return axios({
    url: createUrl('/tradeInfo/getCoinRule', req),
    method: 'get'
  })
}
//查询所有币对
export function getAllCoin() {
  return axios({
    url: createUrl('/tradeInfo/allTradeInfo'),
    method: 'get'
  })
}
//获取币币账户信息
export function currency_account(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/position/list/web', req),
    method: 'get'
  })
}
//手机获取币币账户信息
export function currency_accountPhone(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/position/list', req),
    method: 'get'
  })
}
//获取杠杆账户信息
export function currency_lever(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/position/hl/list/web', req),
    method: 'get'
  })
}
//手机获取币币账户信息
export function currency_leverPhone(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/position/hl/list', req),
    method: 'get'
  })
}
//获取法币账户信息
export function currency_legal(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/position/otc/list/web', req),
    method: 'get'
  })
}
//手机获取法币账户信息
export function currency_legalPhone(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/position/otc/list', req),
    method: 'get'
  })
}


/**
//                                        -------------------法币交易-----------------------
* **/
// 发布广告
export function addAdvertising(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/advertising/'),
    method: 'POST',
    data: JSON.stringify(req)

  })
}
// 申诉
export function orderAppeal(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/order_appeal/'),
    method: 'POST',
    data: JSON.stringify(req)
  })
}
// 修改广告
// export function EditAdvertising(req) {
//   return axios({
//     headers: {
//       'Authorization': 'Bearer ' + lStore.get('token'),
//     },
//     url: url + `/advertising/${req}`,
//     method: 'put',
//   })
// }
// 通过id获取广告
export function adsById(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
    },
    url: createUrl('/advertising/' + req),
    method: 'get',
  })
}
// 获取广告详情
// export function advDetail(req) {
//   return axios({
//     headers: {
//       'Authorization': 'Bearer ' + lStore.get('token'),
//     },
//     url: url + `/advertising/detail/${req}`,
//     method: 'get'
//   });
// }
// 下架广告
// export function downAdv(req) {
//   return axios({
//     headers: {
//       'Authorization': 'Bearer ' + lStore.get('token'),
//     },
//     url: url + `/advertising/down/${req}`,
//     method: 'put'
//   });
// }
// 上架广告
// export function upAdv(req) {
//   return axios({
//     headers: {
//       'Authorization': 'Bearer ' + lStore.get('token'),
//     },
//     url: url + (`/advertising/up/${req}`),
//     method: 'put'
//   });
// }
// 根据币种和广告类型获取上架的广告
export function advType(req) {
  return axios({
    headers: {
      'Content-Type': 'application/json'
    },
    url: createUrl('/advertising/money_type/type', req),
    method: 'get'
  });
}

// 获取私人广告列表 我的广告
export function getpersonalAdList(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/advertising/status', req),
    method: 'get'
  });
}

// 获取用户广告
export function advUser(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/advertising/user', req),
    method: 'get'
  });
}

export function userInfo(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/advertising/user_trade_info', req),
    method: 'get'
  });
}


// 创建订单
export function createOrder(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/trade_order/'),
    method: 'post',
    data: JSON.stringify(req)
  });
}

// 获取首页广告列表

export function getAdvertisementList(req) {
  return axios({
    headers: {
      'Content-Type': 'application/json'
    },
    url: createUrl('/v01/trade/advertising/index/list', req),
    method: 'post'
  });
}


// 可交易广告品种
export function moneyType(req) {
  return axios({
    headers: {
      'Content-Type': 'application/json'
    },
    url: createUrl('/coin/all/detail', req),
    method: 'get'
  });
}

// 法币可交易广告品种
export function OTCmoneyType(req) {
  return axios({
    headers: {
      'Content-Type': 'application/json'
    },
    url: createUrl('/coin/otc/all/detail', req),
    method: 'get'
  });
}

// 获取最新报价
export function getNowQuotes(req) {
  return axios({
    url: createUrl('/v01/trade/advertising/getNowQuotes', req),
    method: 'post'
  });
}
// 更新广告


export function updateAdv(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/advertising/' + req.id),
    method: 'put',
    data: JSON.stringify(req.obj)
  });
}

// 信任某人

export function userTrust(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/trust'),
    method: 'post',
    data: JSON.stringify(req)
  });
}



// 取消信任某人

export function userUnTrust(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/trust'),
    method: 'post',
    data: JSON.stringify(req)
  });
}

// 拉黑
export function userBlack(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/black'),
    method: 'post',
    data: JSON.stringify(req)
  });
}


// 取消拉黑
export function userUnBlack(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/chanel_black'),
    method: 'post',
    data: JSON.stringify(req)
  });
}


// 获取订单列表

export function orderList(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v01/trade/order/orderList', req),
    method: 'post'
  });
}
// 获取用户基本信息
export function basicInfo(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/user_info', req),
    method: 'get'
  });
}

//获取币种和币种提现地址个数
export function getCoinAndAmount() {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
    },
    url: createUrl('/v1/user/coin_address_count'),
    method: 'get'
  })
}
//根据币种类型获取提现地址
export function getCoinAddress(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token')
    },
    url: createUrl('/v1/user/draw_address/' + req),
    method: 'get'
  })
}
//获取所有可用币种详细信息
export function getCoinAllInfo() {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token')
    },
    url: createUrl('/coin/all/detail'),
    method: 'get'
  })
}
export function getIndexCoin() {
  return axios({
    url: createUrl('/tradeInfo/getRecomment'),
    method: 'get'
  })
}
//增加提币地址
export function addCoinAddress(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/add_draw_address'),
    method: 'post',
    data: JSON.stringify(req)
  })
}
//删除提币地址
export function delCoinAddress(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/delete_draw_address'),
    method: 'delete',
    data: JSON.stringify(req)
  })
}
//删除待下单
export function deleteAds(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
    },
    url: createUrl('/wait_order/' + req),
    method: 'delete',
  })
}
//查询提现手续费
export function getWithdrawHandFee(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/misc/listByArray', req),
    method: 'get',
  })
}
//转账提现
export function withdraw(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/position/draw'),
    method: 'post',
    data: JSON.stringify(req)
  })
}
//站内转账
export function withdraw1(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/inner_transfer/sumbit'),
    method: 'post',
    data: JSON.stringify(req)
  })
}
//获取充币地址
export function rechargeAddress(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/wallet_address'),
    method: 'post',
    data: JSON.stringify(req)
  })
}
// 币币资金流水
export function currency_fundDetail(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/trade/detail/list', req),
    method: 'get',
  })
}
// 法币资金流水
export function legal_fundDetail(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/trade/detail/otc/list', req),
    method: 'get',
  })
}
// 杠杆资金流水
export function lever_fundDetail(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/trade/detail/hl/list', req),
    method: 'get',
  })
}
// 币币账户交易到杠杆账户
export function currencyToLever(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/position/hl/recharge'),
    method: 'post',
    data: JSON.stringify(req)
  })
}
// 币币账户交易到法币账户
export function currencyToLegal(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/position/otc/recharge'),
    method: 'post',
    data: JSON.stringify(req)
  })
}
// 杠杆账户交易到币币账户
export function leverToCurrency(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/position/hl/transfer'),
    method: 'post',
    data: JSON.stringify(req)
  })
}
// 杠杆账户交易到法币账户
export function leverToLegal(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/position/otc/hlrecharge'),
    method: 'post',
    data: JSON.stringify(req)
  })
}
// 法币账户交易到币币账户
export function legalToCurrency(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/position/otc/transfer'),
    method: 'post',
    data: JSON.stringify(req)
  })
}
// 法币账户交易到杠杆账户
export function legalToLever(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/position/otc/hltransfer'),
    method: 'post',
    data: JSON.stringify(req)
  })
}
// 创建广告
export function createAds(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/advertising/wait_order/' + req),
    method: 'post',
  })
}
// 根据id拿获取广告
export function getAdsById(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/wait_order/' + req),
    method: 'get',
  })
}
// 获取我的广告会话(法币广告订单)
export function getMyAdsChat(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/wait_order/pages', req),
    method: 'get'
  })
}
// 获取我的订单(法币订单)
export function getMyLegalOrder(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/trade_order/status', req),
    method: 'get'
  })
}

// 获取订单详情，聊天界面买家信息
export function getOrderDetail(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/trade_order/' + req),
    method: 'get'
  })
}
// 法币订单确认付款
export function confirmPay(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/trade_order/confirm_payment/' + req),
    method: 'put'
  })
}
// 法币订单取消订单
export function cancelPay(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/trade_order/cancel_order/' + req),
    method: 'put'
  })
}
// 评价订单
export function evaluateOrder(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/trade_order/evaluate'),
    method: 'put',
    data: JSON.stringify(req)
  })
}
// 通知释放货币
export function noticeRelease(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/trade_order/notify_release/' + req),
    method: 'get'
  })
}
//释放货币
export function releaseCoin(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/trade_order/release_coin'),
    method: 'put',
    data: JSON.stringify(req)
  })
}

//是否有新消息
export function isNewMessage() {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
    },
    url: createUrl('/wait_order/is_new_message'),
    method: 'get',
  })
}

//修改聊天界面更新用户时间--广告
export function updateTimeByAds(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
    },
    url: createUrl('/wait_order/time/' + req),
    method: 'put',
  })
}
//修改聊天界面更新用户时间--订单
export function updateTimeByOrder(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
    },
    url: createUrl('/order_session/time/' + req),
    method: 'put',
  })
}
//校验提币地址格式
export function checkAddress(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/verify_address'),
    method: 'post',
    data: JSON.stringify(req)
  })
}

//佣金排行榜
export function getMonthlist(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/user_commission_total/monthlist'),
    params: req,
    method: 'get'
  })
}

//获取用户邀请码跟邀请链接
export function getRecommendLink(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/get_recommend_link'),
    params: req,
    method: 'get'
  })
}

//分页查询用户返佣明细列表
export function getInviteList(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/user_commission_detail/list'),
    params: req,
    method: 'get'
  })
}

//用户返佣收益（昨天跟历史）
export function getHistory(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/user_commission_detail/yes_and_his'),
    params: req,
    method: 'get'
  })
}
//生成用户邀请海报的二维码
export function getCodeImg(req) {
  return axios({
    headers: {
      'Content-Type': 'application/json'
    },
    url: 'http://qr.liantu.com/api.php',
    params: req,
    method: 'get'
  })
}

//分页查询推荐用户列表
export function getChildList(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/user_recommend_detail/childlist'),
    params: req,
    method: 'get'
  })
}

//询币币账户信息
export function getPositionList(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/position/list/web'),
    params: req,
    method: 'get'
  })
}
//询币币全部信息平台所有币种
export function getPositionAll(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/coin/all/detail'),
    params: req,
    method: 'get'
  })
}

//分页查询币币资金流水
export function getTradeList(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/trade/detail/list'),
    params: req,
    method: 'get'
  })
}

//数字节点——我的节点
export function getMyNode(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/freeze_total/user_count'),
    params: req,
    method: 'get'
  })
}

//数字节点——节点明细
export function getNodeList(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/freeze_node/node_list', req),
    method: 'get'
  })
}

//数字节点——节点申请推出流水
export function getNodeWater(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/freeze_node/node_flow', req),
    method: 'get'
  })
}

//数字节点——节点单位量
export function getNodeUnit() {
  return axios({
    headers: {
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/config/node_unit'),
    method: 'get'
  })
}

//数字节点——冻结节点
export function applyNode(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/freeze_node/do_freeze'),
    data: JSON.stringify(req),
    method: 'post'
  })
}

//数字节点——退出节点
export function UnFreezeNode(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/freeze_node/do_unfreeze'),
    data: JSON.stringify(req),
    method: 'post'
  })
}
//数字节点——申请退出节点
export function applyUnFreezeNode(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/freeze_node/apply_unfreeze'),
    data: JSON.stringify(req),
    method: 'post'
  })
}

//挖矿——今日待分配分红信息
// export function getTodayDividend() {
//   return axios({
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     url: createUrl('/v1/dividend_total/get_today_dividend_total'),
//     method: 'get'
//   })
// }

// //挖矿——昨日待分配分红信息
// export function getYesterdayDividend() {
//   return axios({
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     url: createUrl('/v1/dividend_total/get_yesterday_dividend_total'),
//     method: 'get'
//   })
// }

// //挖矿——分红信息汇总
// export function getTotalDividend() {
//   return axios({
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     url: createUrl('/v1/sz_total/get_exchage_total'),
//     method: 'get'
//   })
// }

//挖矿——挖矿参与最小锁仓量
export function getMinSuocang() {
  return axios({
    headers: {
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/config/join_min_amount'),
    method: 'get'
  })
}

//挖矿——每小时剩余可挖量
export function getDiggingRemaining() {
  return axios({
    headers: {
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/open/query_digging_remaining'),
    method: 'get'
  })
}

// 自选币对的查询：
// 接口：/v1/user/getUserCustomCoinPair
// 请求方式：POST
export function getUserCustomCoinPair() {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/getUserCustomCoinPair'),
    method: 'post'
  })
}

// 添加自选币对：
// 请求的接口  /v1/user/addUserCustomCoinPair
// 请求方式：POST
// 请求参数： "coinPair": "ETH/BTC"  （Key是 "coinPair"，value是 币对名 ）
export function addUserCustomCoinPair(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/addUserCustomCoinPair'),
    data: JSON.stringify(req),
    method: 'post'
  })
}

// 删除自选币对：
// 请求的接口：/v1/user/removeUserCustomCoinPair
// 请求方式：POST
// 参数："coinPairs": "ETH/BTC,ETH/USDT,ETH/BTC"（多个就以逗号分隔）
export function removeUserCustomCoinPair(req) {
  return axios({
    headers: {
      'Authorization': 'Bearer ' + lStore.get('token'),
      'Content-Type': 'application/json'
    },
    url: createUrl('/v1/user/removeUserCustomCoinPair'),
    data: JSON.stringify(req),
    method: 'post'
  })
}
