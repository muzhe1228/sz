import React from 'react';
import { autobind } from 'core-decorators';
import { Link } from 'react-router-dom';
import { Tabs, TabsItem } from 'components/Tabs';
import I18n, { I18nFunc } from 'components/i18n';

import SockMgr from "js/socket";
import { C_SOCKET_CMDS } from "../../js/socket";
import { lStore, cookie } from 'js/index';
import FormTabItem from './FormTabItem/index'
// import Api from 'js/api';
import { getUserInfo, currency_account, currency_buySell, currency_marketBuySell } from "../../js/http-req";
import { message } from 'antd';
import ModalBox from 'components/Modal';
import { browser } from '../../index';
import PayPwd from './PayPwd';
import md5 from 'md5';
import Decimal from "js/decimal"

@autobind
export default class TradingForm extends React.Component {
    constructor(props) {
        super(props);

        this.mounded = true;

        // this.isUpdatePrice = true;
        this.isLoged = !!lStore.get('token');
        this.state = {
            tabIndex: 0,
            isLoged: this.isLoged,
            isTradePwd: false,
            walletMap: {},
            buyPrice: '',
            sellPrice: '',
        }
    }

    componentWillMount() {
        // SockMgr.on(C_SOCKET_CMDS.order_depth, this.onOrderDepth);
        // SockMgr.on(C_SOCKET_CMDS.client_order_reconn, this.onRecconOk);
        // SockMgr.on(C_SOCKET_CMDS.ticks, this.onTicks);
        //
        // this.onTicks(SockMgr.getTicksData());

        SockMgr.on(C_SOCKET_CMDS.client_depth, this.onDepth);

        this.onDepth(SockMgr.getDepthData());

        if (this.isLoged) this.loginAfter();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.item && (!this.props.item || this.props.item.tradeCode != nextProps.item.tradeCode)) {
            this.setState({ buyPrice: '', sellPrice: '' });
        }
    }
    onDepth(data) {
        if (data) {
            var state = {};
            if (!this.state.buyPrice && data.a && data.a[0] && this.state.buyPrice != data.a[0][0]) {
                state.buyPrice = data.a[0][0];
            }
            if (!this.state.sellPrice && data.b && data.b[0] && this.state.sellPrice != data.b[0][0]) {
                state.sellPrice = data.b[0][0];
            }
            if (state.hasOwnProperty("buyPrice") || state.hasOwnProperty("sellPrice")) this.setState(state);
        }
    }
    loginAfter() {
        // SockMgr.initOrderSocket();
        var user = lStore.get('userInfo');
        if (user) {
            this.userId = user.userId;
        }
        // if (user){
        //     SockMgr.subscribeOrder(user.userId, user.token);
        // }
        this.loadWallet();

        getUserInfo().then((obj) => {
            var data = obj.data;
            if (this.mounded) {
                if (data && data.status == 200) {
                    var userInfo = data.data;
                    if (userInfo) {
                        this.setState({ isTradePwd: userInfo.isTradePwd });
                    }
                }
            }
        }).catch(err => {

        });

    }
    loadWallet() {
        currency_account({ pageNo: 0, pageSize: 0, isHide: 0 }).then((obj) => {
            var data = obj.data;
            if (this.mounded) {
                if (data && data.status == 200) {
                    var walletMap = {};
                    data.data.list.forEach((v, i) => {
                        walletMap[v.coinCode] = v;
                    });
                    this.setState({ walletMap });
                }
            }
        }).catch(err => {

        });
    }
    // onOrderDepth(){
    //
    // }
    // onRecconOk(){
    //     var user = lStore.get('user');
    //     if (user){
    //         SockMgr.subscribeOrder(user.userId, user.token);
    //     }
    // }
    componentWillUnmount() {
        this.mounded = false;

        // SockMgr.off(C_SOCKET_CMDS.ticks, this.onTicks);
        SockMgr.off(C_SOCKET_CMDS.client_depth, this.onDepth);
        // SockMgr.off(C_SOCKET_CMDS.client_order_reconn, this.onRecconOk);

        // SockMgr.desctoryOrderSocket();
    }
    tab(tabIndex) {
        this.setState({ tabIndex });
    }
    onChangePayPwd(val) {
        this.payPwd = val;
    }
    tradeOrder(data, callback, isMd5) {
        if (!this.payPwd && !isMd5) {
            message.error(I18nFunc("TradingFormPayPwdTip"));
            return false;
        }

        // data.sourceCoin = data.sourceCoin.toLowerCase();
        // data.targetCoin = data.targetCoin.toLowerCase();
        data.tradePwd = isMd5 ? isMd5 : md5(this.payPwd);
        data.userId = this.userId;
        // if (data.tradeType==0) data.tradePrice = 0; //市价

        if (data.tradeType == 1) {
            currency_buySell(data).then(obj => {
                var result = obj.data;
                if (result.status == 200) {
                    cookie.setCookie(md5('payPwd'), data.tradePwd, 5)
                    message.success(I18nFunc("TradingFormSubmitOk"));
                    this.loadWallet();
                    if (callback) callback(true);
                }
            }).catch(err => {
                if (err && err.data) {
                    var result = err.data;
                    message.error(result.message);
                    if (callback) callback(false);
                }
            });
        } else {
            delete data.tradePrice;
            currency_marketBuySell(data).then(obj => {
                var result = obj.data;
                if (result.status == 200) {
                    cookie.setCookie(md5('payPwd'), data.tradePwd, 5)
                    message.success(I18nFunc("TradingFormSubmitOk"));
                    this.loadWallet();
                    if (callback) callback(true);
                }
            }).catch(err => {
                if (err && err.data) {
                    var result = err.data;
                    message.error(result.message);
                    if (callback) callback(false);
                }
            });
        }
    }
    onSubmitOrder(data, callback) {
        console.log(cookie.getCookie(md5('payPwd')))
        if (data) {
            var item = this.props.item;
            if (item.conventionLock) {
                message.error(I18nFunc("TradingFormTradeClose", item.tradeCode), 1);
                return false;
            }

            if (data.tradeType == 1 && data.tradePrice <= 0) {
                message.error(I18nFunc("TradingFormPriceEmpty"), 1);
                return false;
            }
            if (data.tradeAmount <= 0) {
                message.error(I18nFunc("TradingFormVolumeEmpty"), 1);
                return false;
            }
            if (data.tradeType == 1 && (data.tradePrice < item.minPrice || data.tradePrice > item.maxPrice)) {
                message.error(I18nFunc("TradingFormPriceError", item.minPrice, item.maxPrice), 1);
                return false;
            }
            if ((data.tradeType == 1 || data.position == 1) && (data.tradeAmount > item.maxQty || data.tradeAmount < item.minQty)) {
                message.error(I18nFunc("TradingFormVolError", item.minQty, item.maxQty), 1);
                return false;
            } else if (data.tradeType == 0 && data.position == 0 && (data.tradeAmount > item.entrustMaxAmount || data.tradeAmount < item.entrustMinAmount)) {
                message.error(I18nFunc("TradingFormAmountError", item.entrustMinAmount, item.entrustMaxAmount), 1);
                return false;
            }

            if (data.tradeType == 1) {
                var price = SockMgr.getLastPrice(item.tradeCode);
                if (price) {
                    var min = Number(Decimal.accSubtr(price, item.increase));
                    var max = Number(Decimal.accAdd(item.increase, price));
                    if (data.tradePrice >= max || data.tradePrice <= min) {
                        message.error(I18nFunc("TradingFormIncreaseError", item.increase), 2);
                        return false;
                    }
                }

                var mod1 = Number(Decimal.mod(Decimal.accSubtr(data.tradePrice, item.minPrice), item.tickSize));
                if (mod1 != 0) {
                    message.error(I18nFunc("TradingFormPriceModError"), 1);
                    return false;
                }
            }
            if (data.tradeType == 1 || data.position == 1) {
                var mod1 = Number(Decimal.mod(Decimal.accSubtr(data.tradeAmount, item.minQty), item.stepSize));
                if (mod1 != 0) {
                    message.error(I18nFunc("TradingFormVolModError"), 1);
                    return false;
                }
            }
            if (data.tradeType == 1) {
                var amount = Number(Decimal.accMul(data.tradeAmount, data.tradePrice));
                if (amount > item.entrustMaxAmount || amount < item.entrustMinAmount) {
                    message.error(I18nFunc("TradingFormAmountError", item.entrustMinAmount, item.entrustMaxAmount), 1);
                    return false;
                }
            }

            this.payPwd = "";

            if (!this.state.isTradePwd) {
                var content = <div style={{ padding: "0px 125px", marginTop: "40px", marginBottom: "60px" }}>
                    <div style={{ marginBottom: "20px" }}>
                        <div className="line-input">
                            <div><span>{I18nFunc("TradingFormPayPwdTip2")}</span></div>
                        </div>
                    </div>
                </div>

                ModalBox.show({
                    className: lStore.get('theme') == 'fff'? 'white' : '',
                    title: I18nFunc("TradingFormPayPwd"), content: content, okText: I18nFunc("confirm"), onOk: (okCb) => {
                        browser.push("/user_center/account_security")
                        if (okCb) okCb(true);
                    }
                });
            } else {
                if (cookie.getCookie(md5('payPwd'))) {
                    this.tradeOrder(data, callback, cookie.getCookie(md5('payPwd')));
                } else {
                    var content = <PayPwd onChange={this.onChangePayPwd} />
                    ModalBox.show({
                      className: lStore.get('theme') == 'fff'? 'white' : '',
                        title: I18nFunc("TradingFormPayPwd"), content: content, okText: I18nFunc("confirm"), onOk: (okCb) => {
                            this.tradeOrder(data, callback);
                            if (okCb) okCb(true);
                        }
                    });
                }
            }
        }
    }
    render() {
        const { tabIndex, isLoged, isTradePwd, walletMap, buyPrice, sellPrice } = this.state;
        const { item, allCoins } = this.props;
        var wallet = {};
        if (item) {
            wallet[item.fromCode] = walletMap[item.fromCode];
            wallet[item.toCode] = walletMap[item.toCode];
        }

        return (
            <div className="trading-handle">
                <Tabs labels={[{ label: I18nFunc("TradingFormLimit") }, { label: I18nFunc("TradingFormMarket") }]} tabClick={this.tab} tabIndex={tabIndex}>
                    <TabsItem>
                        <FormTabItem tab={tabIndex} allCoins={allCoins} key="fti1" tradeType={1} item={item} isTradePwd={isTradePwd} wallet={wallet} isLoged={isLoged} buyPrice={buyPrice} sellPrice={sellPrice} submitOrder={this.onSubmitOrder} />
                    </TabsItem>
                    <TabsItem>
                        <FormTabItem tab={tabIndex} allCoins={allCoins} key="fti2" tradeType={0} item={item} isTradePwd={isTradePwd} wallet={wallet} isLoged={isLoged} buyPrice={buyPrice} sellPrice={sellPrice} submitOrder={this.onSubmitOrder} />
                    </TabsItem>
                </Tabs>
                {!isLoged && <div className="login-disable item-pos">
                    <div><Link to="/login"><I18n message="LogIn" /></Link> <I18n message="TradingFormOr" /> <Link to="/register"><I18n message="SignUp" /></Link> <I18n message="TradingTradeStart" /></div>
                </div>}
            </div>
        )
    }
}
