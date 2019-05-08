import React from 'react';
import {autobind} from 'core-decorators';
import PropTypes from 'prop-types';
import './style.less';
import '../../iconfont/iconfont.css';

import {moneyType} from 'js/http-req';
import {lStore} from 'js/index';
import SockMgr, {C_SOCKET_CMDS} from "../../js/socket";
import Decimal from "../../js/decimal";
import {currencySymbol, langCurrency} from "../../js/common";
import {browser} from '../../index';
import I18n from 'components/i18n';

@autobind
export default class TradingList extends React.Component{
    static props = {
        // titleArr :PropTypes.array.isRequired,
        dataList : PropTypes.array.isRequired,
    }
    static contextTypes = {
        lang: PropTypes.string
    };

    static defaultProps = {
        dataList : [],
    }
    constructor(props, context) {
        super(props, context);

        this.symbols = props.dataList ? props.dataList.map((v)=>v.tradeCode): [];

        this.state = {
            ticks:{}
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataList!=this.props.dataList || nextProps.market!=this.props.market){
            this.symbols = nextProps.dataList.map((v)=>v.tradeCode);
        }
    }

    componentWillMount() {
        SockMgr.on(C_SOCKET_CMDS.ticks, this.onTicks);
        SockMgr.on(C_SOCKET_CMDS.tick, this.onTick);

        this.onTicks(SockMgr.getTicksData());
    }
    onTicks(data){
      // console.log(data);
        this.setState({ticks:data});
    }
    onTick(data){
        if (this.symbols.indexOf(data.symbol)!=-1){
            this.onTicks(SockMgr.getTicksData());
        }
    }

    componentDidMount() {
    }


    componentWillUnmount() {
        SockMgr.off(C_SOCKET_CMDS.ticks, this.onTicks);
        SockMgr.off(C_SOCKET_CMDS.tick, this.onTick);
    }
    goTrade(symbol){
        browser.push({
            pathname: "/trading",
            search: "pair="+symbol.replace("/","_")
        });
    }
    onFavorites(e, action, code){
        e.stopPropagation();

        if (this.props.onFavorites){
            this.props.onFavorites(action, code);
        }
    }

    getLogurl(coin) {
      let {moneyTypes} = this.state;
      for (var i=0,l=moneyTypes.length; i<l; i++){
          var val = moneyTypes[i];
          if (val && val.coinCode == coin){
              return val.logoUrl
          }
      }
    }

    render(){
      const {tab, dataList, favorites, page, filter, allCoins} = this.props;
      const {ticks} = this.state;
      const {lang} = this.context;

      const currency = langCurrency(lang);
      const cs = currencySymbol(currency);

      const titleArr = page=='home' ? [<I18n message={'Pair'} />,<I18n message={'TradeListLPrice'}/>,<I18n message={'TradeListLChg'}/>,<I18n message={'TradeListHigh'}/>,<I18n message={'TradeListLow'}/>,<I18n message={'TradeListVol'}/>]
      : [<I18n message={'TradingPair'} />,<I18n message={'TradingPairLPrice'}/>,<I18n message={'TradingPairChg'}/>];



        return page=="home" ? (
            <div className="trading-list">
                <hgroup>
                    {
                      titleArr.map((title,indx)=>{
                          return (
                              <h2 key={"ta"+indx}>{title}<span className="trading-list-triangle">
                                  {/*<span className="up"></span><span className="down"></span>*/}
                              </span></h2>
                          )
                      })
                    }
                </hgroup>
                <ul>
                    {
                        dataList.map((item,index)=>{
                            var code = item.tradeCode;
                            var iList = item.tradeCode.split("/");
                            var fromCode = iList[0];
                            var toCode = iList[1];
                            if (allCoins && (!allCoins[fromCode] || !allCoins[toCode])) return;
                            if (filter && fromCode.indexOf(filter.toUpperCase())==-1) return;

                            var tick = ticks[item.tradeCode];
                            var isAdded = favorites.indexOf(code)!=-1;

                            var upOrDown = (!tick || !Number(tick.chg)) ? "" : (Number(tick.chg)>0?"up":"down");
                            var coinInfo = allCoins[fromCode];
                            return (
                                <li key={index} onClick={()=>this.goTrade(item.tradeCode)}>
                                    <div className="list-item list-item-left">
                                        <span onClick={(e)=>this.onFavorites(e, isAdded?'remove':'add', code)}><i className="iconfont icon-Star-red" style={!isAdded ?(lStore.get('theme') == 'fff'?{color:"#AFB9C8"} : {color:"#374B69"}) : {color:"#993E32"}}></i></span>
                                        {/*<span className={"list-item-icon icon-"+(fromCode)}></span>*/}
                                        <span className="list-item-icon"><img src={coinInfo ? coinInfo.logoUrl : ""} alt=""/></span>
                                        <span>{fromCode}</span><span className="bu_r">{"/"+toCode}</span>
                                    </div>
                                    <div className="list-item">
                                        <span>{tick && tick.price ? tick.price : '--' }</span>
                                        <span className="bu_r">{'/ '+((tick && tick.price?Decimal.addCommas(tick.exchangePrice[currency])+ ' '+currency:'--'))}</span>
                                    </div>
                                    <div className={"list-item" + (upOrDown? " "+upOrDown : "")}>
                                        {/* <span className={upOrDown=='up' ?'text-green': (upOrDown=='down'?'text-red':'')}>{tick && tick.price ? (Number(tick.change)>0?'+':'')+tick.change : '--'}</span> */}
                                        <span style={{minWidth: 68, textAlign: 'center'}} >{(tick && tick.price ? (Number(tick.chg)>0?'+':'')+tick.chg+'%' : '--')}</span>
                                    </div>
                                    <div className="list-item">
                                        <span>{tick && tick.day_high ? tick.day_high : '--'}</span>
                                    </div>
                                    <div className="list-item">
                                        <span>{tick && tick.day_low ? tick.day_low : '--'}</span>
                                    </div>
                                    <div className="list-item">
                                        <span>{tick && tick.day_volume ? Decimal.addCommas(Decimal.round(tick.day_volume, item.volFixed)) : '--'}</span>
                                    </div>
                                </li>
                            )
                        })
                    }
                </ul>

            </div>
        )
            :
            (
                <div className="currency-list">
                    <hgroup>
                        {
                            titleArr.map((title,indx)=>{
                                return (
                                    <h2 key={"ta_"+indx}>{title}</h2>
                                )
                            })
                        }
                    </hgroup>
                    <ul className="list">
                        {
                            dataList.map((item,index)=>{
                                var code = item.tradeCode;
                                var iList = item.tradeCode.split("/");
                                var fromCode = iList[0];
                                var toCode = iList[1];
                                if (allCoins && (!allCoins[fromCode] || !allCoins[toCode])) return;
                                if (filter && fromCode.indexOf(filter.toUpperCase())==-1) return;

                                var tick = ticks[item.tradeCode];
                                var isAdded = favorites.indexOf(code)!=-1;

                                var upOrDown = (!tick || !Number(tick.chg)) ? "" : (Number(tick.chg)>0?"up":"down");
                                return (
                                    <li key={index} onClick={()=>this.goTrade(item.tradeCode)}>
                                        <div className="item">
                                            <i className="iconfont icon-Star-red" style={!isAdded ? (lStore.get('theme') == 'fff'?{color:"#AFB9C8"} : {color:"#374B69"}) : {color:"#993E32"}} onClick={(e)=>this.onFavorites(e, isAdded?'remove':'add', code)}></i>
                                            <span className="label">{tab!=0 ? iList[0] : code}</span>
                                        </div>
                                        <div className="item">
                                            <span className={upOrDown}>{tick && tick.price ? tick.price : '--' }</span>
                                        </div>
                                        <div className="item">
                                            <span className={upOrDown}>{(tick && tick.price ? (Number(tick.chg)>0?'+':'')+tick.chg+'%' : '--')}</span>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            )
    }
}
