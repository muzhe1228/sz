import { myAjax, dataType, lStore, isEmpty, customEvent } from './index';
import { store } from 'store';
import * as action from 'store/action/loading';
import { error } from 'components/Message';
import { browser } from 'src';
import md5 from 'md5';
import ENV from 'js/appConfig';

// let baseUrl='http://47.98.65.112:8183';
let baseUrl = (ENV.getENV().name == 'test' ? 'http' : 'https') + '://' + ENV.getENV().httpApi;

//对项目返回参数的处理，对ajax的再次封装
const ajaxWrap = function (json) {
    myAjax({
        url: json.url,
        type: json.type,
        data: json.type == 'get' ? json.data : JSON.stringify(json.data),
        closeToForm: json.closeToForm,
        dataType: json.dataType,
        headers: json.headers,
        before: function (xhr) {
            //loading显示处理
            store.dispatch(action.getLoading(true));
        },
        after: function (xhr) {
            //loading隐藏处理
            store.dispatch(action.getLoading(false));
        },
        success: function (data) {
            //只要成功都会走
            //成功code已经失败code处理

            if (dataType(data) === "object") {
                json.success && json.success(data);
                return;
            } else if (dataType(data) === "string") {
                // console.log(data)
                // json.success&&json.success(JSON.parse(data));
                return;
            } else {
                json.success && json.success(data);
                return;
            }
        },
        error: function (err, data) {
            if (err == 401) {
                lStore.remove('token');
                browser.push('/login');
            } else {
                json.error && json.error(data);
            }
            // error(err+'网络异常');
            store.dispatch(action.getLoading(false));
        },
    });
};

const severApi = function (url, json, cb, method) {
    var addSign = '';
    if (!isEmpty(json)) {
        for (var key in json) {
            addSign += json[key];
        }
    }
    let sign = md5(addSign + '0123456789');
    let token = lStore.get('token') || '';
    ajaxWrap({
        url: baseUrl + url,
        type: method,
        data: json || '',
        dataType: 'json',
        headers: [{ Authorization: 'Bearer ' + token }, { 'x-user-env-info': 'sz.com' }],
        success: function (res) {
            cb && cb(res);
        },
        error: function (res) {
            cb && cb(res);
        }
    });
};
const STATIC_URL = {
    login: '/auth/authorize',//登录
    register: '/auth/register',//注册
    userInfor: '/v1/user/user_info',//用户信息
    getAmountInfor: '/v1/position/list/web',//
    banner: '/v1/banner/',//banner
    imageCode: '/auth/create_image_code',//图形验证码
    sendSmsMobile: '/auth/send_sms_mobile',//发送手机验证码
    sendSmsEmail: '/auth/send_sms_email',//发送邮箱短信验证码
    checkSmsMobile: '/auth/check_sms_mobile',//验证手机验证码
    findPassword: '/auth/find_pwd',
    geetest: '/auth/geetest',//极验
    loginOut: '/v1/user/login_out',//退出登录
    walletAddress: '/v1/user/wallet_address',//获取充值地址
    listByArray: '/v1/misc/listByArray',//提现手续费
    drawAddress: '/v1/user/draw_address/',//获取提币地址
    addDrawAddress: '/v1/user/add_draw_address',//
    draw: '/v1/position/draw',//新增转账提现
    positionListWeb: '/v1/position/list/web', //PC端查询币币账户信息
    orderHistory: '/v1/tradeOrderHis/list',   //委托历史
    tradeOrderConfirm: '/v1/tradeOrder/confirm', //创建委托单
    tradeOrderCancel: '/v1/tradeOrder/cancelOrder', //撤销委托单
};

module.exports = {
    CustomApi: function (url, params, cb, method) {
        severApi(url, params, cb, method)
    },
    Login: function (params, cb, method) {
        severApi(STATIC_URL.login, params, cb, method)
    },
    Register: function (params, cb) {
        severApi(STATIC_URL.register, params, cb)
    },
    UserInfor: function (params, cb, method) {
        severApi(STATIC_URL.userInfor, params, cb, method)
    },
    GetAmountInfor: function (params, cb, method) {
        severApi(STATIC_URL.getAmountInfor, params, cb, method)
    },
    Banner: function (params, cb, method) {
        severApi(STATIC_URL.banner, params, cb, method)
    },
    getImageCode: function (params, cb, method) {
        severApi(STATIC_URL.imageCode, params, cb, method)
    },
    sendSmsMobile: function (params, cb) {
        severApi(STATIC_URL.sendSmsMobile, params, cb)
    },
    sendSmsEmail: function (params, cb) {
        severApi(STATIC_URL.sendSmsEmail, params, cb)
    },
    checkSmsMobile: function (params, cb) {
        severApi(STATIC_URL.checkSmsMobile, params, cb)
    },
    findPassword: function (params, cb, method) {
        severApi(STATIC_URL.findPassword, params, cb, method)
    },
    geetest: function (params, cb, method) {
        severApi(STATIC_URL.geetest, params, cb, method)
    },
    LoginOut: function (params, cb, method) {
        severApi(STATIC_URL.loginOut, params, cb, method)
    },
    WalletAddress: function (params, cb) {
        severApi(STATIC_URL.walletAddress, params, cb)
    },
    ListByArray: function (params, cb, method) {
        severApi(STATIC_URL.listByArray, params, cb, method)
    },
    DrawAddress: function (params, cb, method) {
        severApi(STATIC_URL.drawAddress, params, cb, method)
    },
    AddDrawAddress: function (params, cb) {
        severApi(STATIC_URL.addDrawAddress, params, cb)
    },
    Draw: function (params, cb) {
        severApi(STATIC_URL.draw, params, cb)
    },
    positionListWeb: function (params, cb, method) {
        severApi(STATIC_URL.positionListWeb, params, cb, method)
    },
    tradeOrderHistory: function (params, cb, method) {
        severApi(STATIC_URL.orderHistory, params, cb, method)
    },
    tradeOrderConfirm: function (params, cb, method) {
        severApi(STATIC_URL.tradeOrderConfirm, params, cb, method)
    },
    tradeOrderCancel: function (params, cb) {
        severApi(STATIC_URL.tradeOrderCancel, params, cb);
    }
};
