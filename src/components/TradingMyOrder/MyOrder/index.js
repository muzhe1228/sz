import React from 'react';
import {autobind} from 'core-decorators';
import {Link} from 'react-router-dom';
import dayjs from 'dayjs';
//import {HInput} from 'components/Form';
//import {Tabs,TabsItem} from 'components/Tabs';
//import HButton from 'components/HButton';
import SockMgr,{C_SOCKET_CMDS} from "../../../js/socket";
import {lStore} from 'js/index';
import I18n,{I18nFunc} from 'components/i18n';
// import Api from 'js/api';
import {currency_cancelOrder} from '../../../js/http-req';
import Decimal from "js/decimal"
// import PayPwd from 'components/TradingForm/PayPwd';
import ModalBox from 'components/Modal';
import { message} from 'antd';
import {browser} from 'src';

@autobind
export default class MyOrder extends React.Component{
    constructor(props) {
        super(props);

        this.mounded = true;

        this.isLoged = !!lStore.get('token');

        this.state = {
            list: []
        }
    }

    componentWillMount() {
        SockMgr.on(C_SOCKET_CMDS.order_depth, this.onOrderDepth);
        SockMgr.on(C_SOCKET_CMDS.client_order_reconn, this.onRecconOk);

        if (this.isLoged) this.loginAfter();
    }
    loginAfter() {
        var user = lStore.get('userInfo');
        if (user) {
            this.userId = user.userId;

            SockMgr.initOrderSocket();
            SockMgr.subscribeOrder(user.userId, user.token);
        }
    }
    onOrderDepth(data){
        if (data && data.content){
            var oldList = this.state.list;
            var list = data.content;
            for (var i=list.length-1; i>=0; i--){
                var info = list[i];
                var findIndex = -1;
                for (var j=oldList.length-1; j>=0; j--){
                    var oldInfo = oldList[j];
                    if (info.orderNo == oldInfo.orderNo){
                        findIndex = j;
                        Object.assign(oldInfo, info);
                        break;
                    }
                }
                if (findIndex == -1){
                    oldList.splice(0,0,info);
                }
            }
            var newList = oldList.filter((v)=>[2,4,6].indexOf(v.status)==-1);
            this.setState({list: newList});

            if (this.state.list.length>0){
                if (this.props.onChange) this.props.onChange();
            }
        }
    }
    onRecconOk(){
        var user = lStore.get('userInfo');
        if (user){
            SockMgr.subscribeOrder(user.userId, user.token);
        }
    }
    componentWillUnmount() {
        this.mounded = false;

        SockMgr.off(C_SOCKET_CMDS.order_depth, this.onOrderDepth);
        SockMgr.off(C_SOCKET_CMDS.client_order_reconn, this.onRecconOk);

        // SockMgr.desctoryOrderSocket();
    }

    cancel(data){
        var content = <div style={{padding: "0px 125px", marginTop: "40px", marginBottom: "60px"}}>
            <div style={{marginBottom: "20px"}}>
                <div className="line-input">
                    <div><span>{I18nFunc("TradingOrderCancelConfirm")}</span></div>
                </div>
            </div>
        </div>

        ModalBox.show({title:I18nFunc("second_confirm"), content:content, okText:I18nFunc("sz_confirm"), cancelText:I18nFunc("sz_cancel"), onOk:(okCb)=>{
                this.cancelOrder(data);
                if (okCb) okCb(true);
            }});
    }
    cancelOrder(data){
        // if (!this.payPwd){
        //     message.error(I18nFunc("TradingFormPayPwdTip"));
        //     return false;
        // }

        // data.sourceCoin = data.sourceCoin.toLowerCase();
        // data.targetCoin = data.targetCoin.toLowerCase();
        // data.tradePwd = this.payPwd;
        // data.userId = this.userId;
        // if (data.tradeType==0) data.tradePrice = 0; //市价

        var newData = {orderNo:data.orderNo, userId:data.userId};
        currency_cancelOrder(newData).then(obj=>{
            var result = obj.data;
            if (result.status==200){
                // message.success(I18nFunc("TradingFormSubmitOk"));
            }else{
                message.error(result.message);
            }
        }).catch(err=>{

        });
    }

    _goTradingEntrust() {
      if(lStore.get('token')) {
        lStore.set('userTab', 2);
        window.open('/user_center/trade_order/trading_entrust', '_blank');
      }else{
        browser.push('/login');
      }
    }

    render(){
        const {list} = this.state;
        const {item} = this.props;
        var fromCode, toCode, tradeCode, newList = [];
        var priceFixed = 0, volFixed = 0;
        if (item){
            tradeCode = item.tradeCode;
            fromCode = item.fromCode;
            toCode = item.toCode;
            priceFixed = item.priceFixed;
            volFixed = item.volFixed;
            newList = list.filter((v)=>v.coinCode.toUpperCase()==tradeCode);
        }

        // const statusTxts = {"0": "委托中", "1": "部分成交", "2": "已成交", "3": "部分成交待撤", "4": "部分成交已撤", "5": "待撤", "6": "已撤"}
        return (
            <div className="entrust-content">
              <h2 className="title title-sub">
                <span>
                  <span>{I18nFunc("TradingOrderCurr")}</span>
                  <a onClick={this._goTradingEntrust}>{I18nFunc("TradingOrderViewAll")}</a>
                </span>
                {/*<span className="undo-all">{I18nFunc("TradingOrderUndoAll")}</span>*/}
              </h2>
              <hgroup className="entrust-title">
                <h3>{I18nFunc("TradingOrderTime")}</h3>
                <h3>{I18nFunc("TradingOrderSide")}</h3>
                <h3>{I18nFunc("TradingOrderPrice")}({toCode})</h3>
                <h3>{I18nFunc("TradingOrderVolume")}({fromCode})</h3>
                <h3>{I18nFunc("TradingOrderNotTrade")}({fromCode})</h3>
                <h3>{I18nFunc("TradingOrderTraded")}({fromCode})</h3>
                <h3>{I18nFunc("TradingOrderDealPrice")}({toCode})</h3>
                <h3>{I18nFunc("TradingOrderOperate")}</h3>
              </hgroup>
              <ul className="entrust-list">
                  {newList && newList.map((v, i)=>{
                      if (i<4) return <li key={i}>
                          <span>{dayjs(v.createTime).format("HH:mm:ss")}</span>
                          <span>{I18nFunc(v.position==0?"TradingTradedBuy":"TradingTradedSell")}</span>
                          <span>{v.tradeType==0 ? I18nFunc("MarketOrder") : Decimal.toFixed(Number(Decimal.round(v.tradePrice, priceFixed)))}</span>
                          <span>{v.tradeType==0 && v.position==0 ? 0 : Decimal.toFixed(Number(Decimal.round(v.tradeAmount, volFixed)))}</span>
                          <span>{v.tradeType==0 && v.position==0 ? 0 : Decimal.toFixed(Number(Decimal.accSubtr(v.tradeAmount, v.sellAmount||0, volFixed)))}</span>
                          <span>{Decimal.toFixed(Number(Decimal.round(v.sellAmount||0, volFixed)))}</span>
                          <span>{Decimal.toFixed(Number(Decimal.round(v.dealPrice||0, priceFixed)))}</span>
                          <span className="revert" onClick={()=>this.cancel(v)}>{I18nFunc("TradingOrderCancel")}</span>
                      </li>
                  })}
                  {!newList[0] && <li className="no-data">{I18nFunc("TradingNoData")}</li>}
              </ul>
            </div>
        )
    }
}
