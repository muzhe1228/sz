import React from 'react';
import {autobind} from 'core-decorators';
import I18n from 'components/i18n';
import Decimal from "../../js/decimal";
import SockMgr,{C_SOCKET_CMDS} from "../../js/socket";
import Trade from "../../js/trade";
import {langCurrency} from "../../js/common";
import PropTypes from "prop-types";
import {customEvent} from "../../js/index";
import {lStore} from 'js/index';

@autobind
export default class TradingItem extends React.Component{
    static contextTypes = {
        lang: PropTypes.string
    };

    constructor(props, context) {
        super(props, context);

        this.code = this.props.item ? this.props.item.tradeCode : "";
        this.mounted = true;

        this.state = {
            tick:{},
            favorites: []
            // isAdded: favs.indexOf(this.code)!=-1
        };
    }

    componentWillMount() {
        SockMgr.on(C_SOCKET_CMDS.ticks, this.onTicks);
        SockMgr.on(C_SOCKET_CMDS.tick, this.onTick);

        customEvent.on('TradeFav', this.onChangeFavorites);

        this.onTicks(SockMgr.getTicksData());
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.item && (!this.props.item || this.props.item.tradeCode!=nextProps.item.tradeCode)){
            this.code = nextProps.item.tradeCode;
            this.onTicks(SockMgr.getTicksData());
            // this.setState({isAdded: Trade.getFavorites().indexOf(this.code)!=-1})
        }
    }

    onChangeFavorites(data){
        if (data.favorites.length!=this.state.favorites.length){
            this.setState({favorites: [].concat(data.favorites)});
        }
    }
    onTicks(data){
        if (this.code && data[this.code]){
            this.setState({tick:data[this.code]});
        }else{
            this.setState({tick:{}});
        }
    }
    onTick(data){
        if (this.code && data.symbol==this.code){
            this.onTicks(SockMgr.getTicksData());
        }
    }
    componentWillUnmount() {
        this.mounted = false;

        SockMgr.off(C_SOCKET_CMDS.ticks, this.onTicks);
        SockMgr.off(C_SOCKET_CMDS.tick, this.onTick);

        customEvent.remove('TradeFav', this.onChangeFavorites);
    }

    onFavorites(action, code){
        var favorites = this.state.favorites;
        if (action=='add'){
            if (favorites.indexOf(code)==-1){
                Trade.addFavorites(code, (data)=>{
                    if (data.status==200){
                    }
                });
                favorites.unshift(code);
                this.setState({favorites});

                customEvent.emit('TradeFav', {favorites});
            }
        }else{
            var index = favorites.indexOf(code);
            if (index!=-1){
                Trade.removeFavorties(code, (data)=>{
                    if (data.status==200){
                    }
                })
                favorites.splice(index, 1);
                this.setState({favorites});

                customEvent.emit('TradeFav', {favorites});
            }
        }
    }
    changeTradeSkin(type){
        this.props.onChange(type);
    }
    render(){
        const {item, theme} = this.props;
        const {tick, favorites} = this.state;

        var fromCode,toCode, isAdded, volFixed = item ? item.volFixed : 0;
        var code = item ? item.tradeCode : "";
        if (code){
            var iList = code.split("/");
            fromCode = iList[0];
            toCode = iList[1];

            isAdded = favorites.indexOf(code)!=-1;
        }
        const upOrDown = !tick || !Number(tick.chg) ? "" : Number(tick.chg)>0?"up":"down";
        const {lang} = this.context;
        const currency = langCurrency(lang);


        return <div className="current-currency">
            <div className="currency-price">
                <i className="iconfont icon-Star-red" style={!isAdded ?(lStore.get('theme') == 'fff'?{color:"#AFB9C8"} : {color:"#374B69"}) : {color:"#993E32"}} onClick={()=>this.onFavorites(isAdded?'remove':'add', code)}></i>
                <span className="currency">{code||"--"}</span>
                <span className={"price" + (upOrDown?" "+upOrDown:"")}>{tick && tick.price ? tick.price : '--' }</span>
                <span className="dollar">{'/ '+((tick && tick.price?Decimal.addCommas(tick.exchangePrice[currency])+ ' '+currency:'--'))}</span>
            </div>
            <div className="currency-other">
                <dl>
                    <dt><I18n message={"TradingChg"}/></dt>
                    <dd className={upOrDown}>{(tick && tick.price ? (Number(tick.chg)>0?'+':'')+tick.chg+'%' : '--')}</dd>
                </dl>
                <dl>
                    <dt><I18n message={"TradingHigh"}/></dt>
                    <dd>{tick && tick.day_high ? tick.day_high + ' '+toCode: '--'}</dd>
                </dl>
                <dl>
                    <dt><I18n message={"TradingLow"}/></dt>
                    <dd>{tick && tick.day_low ? tick.day_low + ' '+toCode : '--'}</dd>
                </dl>
                <dl>
                    <dt><I18n message={"Trading24hVol"}/></dt>
                    <dd>{(tick && tick.hasOwnProperty("day_volume") && tick.price) ? Decimal.addCommas(Decimal.round(tick.day_volume, volFixed)) + ' '+fromCode : '--'}</dd>
                </dl>
            </div>
            {/* <div className="trun-on">
                <span className={theme=="light"?"active":""} onClick={()=>this.changeTradeSkin("light")}><i className="light"></i></span>
                <span className={theme=="dark"?"active":""} onClick={()=>this.changeTradeSkin("dark")}><i className="dark"></i></span>
            </div> */}
        </div>
    }
}
