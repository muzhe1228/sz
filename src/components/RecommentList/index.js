import React from 'react';
import PropTypes from 'prop-types';
import {autobind} from 'core-decorators';

import SockMgr, {C_SOCKET_CMDS} from "../../js/socket";
import Decimal from '../../js/decimal';
import {currencySymbol, langCurrency} from '../../js/common';

import './style.less';
import {browser} from "../../index";

@autobind
class RecommentList extends React.Component{
    static contextTypes = {
        lang: PropTypes.string,
        tradeInfo: PropTypes.object
    };
    constructor(props, context) {
        super(props, context);

        this.symbols = [];

        this.state = {
            ticks:{},
        };
    }
    componentWillMount() {
        SockMgr.on(C_SOCKET_CMDS.ticks, this.onTicks);
        SockMgr.on(C_SOCKET_CMDS.tick, this.onTick);

        this.onTicks(SockMgr.getTicksData());
    }
    onTicks(data){
        this.setState({ticks:data});
    }
    onTick(data){
        if (this.symbols.length!=this.context.tradeInfo.getRecomment.length){
            const getRecomment = this.context.tradeInfo.getRecomment;
            this.symbols = getRecomment.map((v)=>v.symbol);
        }

        if (this.symbols.indexOf(data.symbol)!=-1){
            this.onTicks(SockMgr.getTicksData());
        }
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

    render(){
        const {tradeInfo, lang} = this.context;
        const getRecomment = tradeInfo.getRecomment;
        const allCoins = tradeInfo.allCoins;
        const {ticks} = this.state;

        const total = 5;

        const currency = langCurrency(lang);
        const cs = currencySymbol(currency);
        const noData = !getRecomment || !getRecomment[0];

        var count = 0;
        var remainNum = total - count;
        return !noData && <div className="container">
                {getRecomment.map((item,index)=>{
                        if (count<total){
                            var symbol = item.symbol;
                            var fromCode = item.fromCode;
                            var toCode = item.toCode;

                            if (allCoins && (!allCoins[fromCode] || !allCoins[toCode])) return;
                            var tick = ticks[symbol];
                            count++;
                            remainNum = total - count;

                            var upOrDown = (!tick || !Number(tick.chg)) ? "" : (Number(tick.chg)>0?"up":"down");
                            var upOrDownBak = (!tick || !Number(tick.chg)) ? "" : (Number(tick.chg)>0?"upBak":"downBak");
                            return (
                                <ul className={"market-detail " + upOrDownBak} key={index} onClick={()=>this.goTrade(symbol)}>
                                    <li className="currency-compare">
                                        <span className="currency-name">{item.symbol}</span>
                                        <span className={upOrDown}>{(tick && tick.price ? (tick.chg>0?'+':'')+tick.chg+'%' : '--')}</span>
                                    </li>
                                    <li className="price">
                                        <span className="market-price">{tick && tick.price ? Decimal.addCommas(tick.price) : '--'}</span>
                                        <span className="corresponding-price">{cs+(!!tick && !!tick.exchangePrice && !!tick.exchangePrice[currency] ? Decimal.addCommas(tick.exchangePrice[currency]) : '--')}</span>
                                    </li>
                                    <li>
                                        <span className="volume">{"Volume: "+(tick && tick.day_volume?Decimal.addCommas(Decimal.round(tick.day_volume, item.volFixed)):'--')} {item.fromCode}</span>
                                    </li>
                                </ul>
                            )
                        }
                    })
                }
            { Array.apply(null, {length:remainNum}).map((v, i)=>{
                return (
                    <ul className="market-detail" key={remainNum-i}>
                        <li className="currency-compare">
                            <span className="currency-name">--</span>
                            <span>--</span>
                        </li>
                        <li className="price">
                            <span className="market-price">--</span>
                            <span className="corresponding-price">--</span>
                        </li>
                        <li>
                            <span className="volume">Volume: -- --</span>
                        </li>
                    </ul>
                )
            })}
            </div>

    }
}

export default RecommentList;
