import React from 'react';
import {autobind} from 'core-decorators';
import {Link} from 'react-router-dom';

import MyOrder from './MyOrder';
import {currency_getHistory} from '../../js/http-req';
// import SockMgr,{C_SOCKET_CMDS} from "../../js/socket";
import {lStore} from 'js/index';
// import Api from 'js/api';
import Decimal from "js/decimal"
import {I18nFunc} from "../i18n";
import {browser} from 'src';

@autobind
export default class TradingMyOrder extends React.Component{
    constructor(props) {
        super(props);

        this.mounded = true;
        this.timer = 0;
        this.reloadTime = 0;
        this.isLoged = !!lStore.get('token');

        this.state = {
            curPage: 1,
            hisData:{}
        }
    }

    componentWillMount() {
        // SockMgr.on(C_SOCKET_CMDS.order_depth, this.onOrderDepth);
        //SockMgr.on(C_SOCKET_CMDS.client_order_reconn, this.onRecconOk);

        if (this.isLoged){
            this.loginAfter();
        }
    }
    loginAfter() {
        // SockMgr.initOrderSocket();
        var user = lStore.get('userInfo');
        if (user) {
        //   SockMgr.subscribeOrder(user.userId, user.token);
            this.userId = user.userId;
        }

        this.reloadHistory();
        this.schdeuleReloadHistory();
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.item && (!this.props.item || this.props.item.tradeCode!=nextProps.item.tradeCode)){
            if (this.isLoged) this.getOrderHistory(this.state.curPage, nextProps.item.tradeCode);
        }
    }
    //定时刷新
    schdeuleReloadHistory(){
        if (!this.timer){
            this.timer = setInterval(()=>{
                if (new Date().getTime()-this.reloadTime>=2000) this.reloadHistory();
            }, 2000);
        }
    }
    // onOrderDepth(){
    //     if (this.isLoged) this.getOrderHistory(this.state.curPage, t.item.tradeCode);
    // }
    // onRecconOk(){
    //     // var user = lStore.get('user');
    //     // if (user){
    //     //   SockMgr.subscribeOrder(user.userId, user.token);
    //     // }
    // }
    reloadHistory(){
        if (this.isLoged && this.props.item){
            this.reloadTime = new Date().getTime();
            this.getOrderHistory(this.state.curPage, this.props.item.tradeCode);
        }
    }
    reload(){
        this.reloadHistory();

        if (this.props.onChange) this.props.onChange();
    }
    componentWillUnmount() {
        this.mounded = false;

        if (this.timer){
            clearInterval(this.timer);
            this.timer = 0;
        }

        // SockMgr.off(C_SOCKET_CMDS.order_depth, this.onOrderDepth);
        // SockMgr.off(C_SOCKET_CMDS.client_order_reconn, this.onRecconOk);

        // SockMgr.desctoryOrderSocket();
    }
    getOrderHistory(page, tradeCode){
        if (!tradeCode) return;

        let curPage = page || this.state.curPage;
        currency_getHistory({pageNo:curPage, pageSize:4, userId:this.userId, tradeCode}).then(obj=>{
            var data = obj.data;
            if (data.status==200){
                if (this.mounded) this.setState({hisData:data.data, curPage:page});
            }
        }).catch(err=>{

        });
    }

    _goHistoryEntrust() {
      if(lStore.get('token')) {
        lStore.set('userTab', 2);
        window.open('/user_center/trade_order/history_entrust', '_blank');
      }else{
        browser.push('/login');
      }
    }

    render(){
        const { hisData } = this.state;
        const {item} = this.props;
        var fromCode, toCode;
        var priceFixed = 0, volFixed = 0;
        if (item){
            fromCode = item.fromCode;
            toCode = item.toCode;
            priceFixed = item.priceFixed;
            volFixed = item.volFixed;
        }

        return (
            <div className="entrust">
                <MyOrder item={item} onChange={this.reload}/>

                <div className="entrust-content">
                    <h2 className="title">
                        <span>{I18nFunc("TradingOrderHistory")}</span>
                        <a onClick={this._goHistoryEntrust} >{I18nFunc("TradingOrderViewAll")}</a>
                    </h2>
                    <hgroup className="entrust-title">
                        <h3 style={{width:"15%"}}>{I18nFunc("TradingOrderTime")}</h3>
                        <h3>{I18nFunc("TradingOrderSide")}</h3>
                        <h3>{I18nFunc("TradingOrderStatus")}</h3>
                        <h3>{I18nFunc("TradingOrderPrice")}({toCode})</h3>
                        <h3>{I18nFunc("TradingOrderVolume")}({fromCode})</h3>
                        <h3>{I18nFunc("TradingOrderNotTrade")}({fromCode})</h3>
                        <h3>{I18nFunc("TradingOrderTraded")}({fromCode})</h3>
                        <h3>{I18nFunc("TradingOrderDealPrice")}({toCode})</h3>
                    </hgroup>
                    <ul className="entrust-list">
                      {(hisData && hisData.list && hisData.list[0])?
                          hisData.list.map((v, index)=>{
                            if (index<4) return <li key={index}>
                              <span style={{width:"15%"}}>{v.createTime}</span>
                              <span>{I18nFunc(v.position==0?"TradingTradedBuy":"TradingTradedSell")}</span>
                              <span>{I18nFunc("TradingOrderStatus"+v.status)}</span>
                              <span>{v.tradeType==0 ? I18nFunc("MarketOrder") : Decimal.toFixed(Number(Decimal.round(v.tradePrice, priceFixed)))}</span>
                              <span>{v.tradeType==0 && v.position==0 ? 0 : Decimal.toFixed(Number(Decimal.round(v.tradeAmount, volFixed)))}</span>
                              <span>{v.tradeType==0 && v.position==0 ? 0 : Decimal.toFixed(Number(Decimal.accSubtr(v.tradeAmount, v.sellAmount, volFixed)))}</span>
                              <span>{Decimal.toFixed(Number(Decimal.round(v.sellAmount||0, volFixed)))}</span>
                              <span>{Decimal.toFixed(Number(Decimal.round(v.dealPrice||0, priceFixed)))}</span>
                            </li>

                          })
                        :
                        <li className="no-data">{I18nFunc("TradingNoData")}</li>
                      }
                    </ul>
                </div>
            </div>
        )
    }
}
