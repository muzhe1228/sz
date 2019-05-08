import React from 'react';
import PropTypes from "prop-types";
import { autobind } from 'core-decorators';
import SockMgr, { C_SOCKET_CMDS } from "../../js/socket";
import Decimal from "../../js/decimal";
import I18n, { I18nFunc } from 'components/i18n';
import { langCurrency, isLength } from "js/common";
import { customEvent } from "js/index";

@autobind
export default class TradingDepth extends React.Component {
    static contextTypes = {
        lang: PropTypes.string
    };

    constructor(props, context) {
        super(props, context);

        // this.optionsNum = 3;
        this.item = this.props.item;
        var priceFixed = this.item ? this.item.priceFixed : 0;
        this.maxVol = 0;
        // this.bMaxVol = 0;
        this.state = {
            priceFixed,
            merge: priceFixed,
            mode: 0,  //不同显示的类型
            dropDown: false,
            tick: null,
        }
    }
    componentWillMount() {
        window.addEventListener("click", this.hideAll);

        SockMgr.on(C_SOCKET_CMDS.client_depth, this.onDepth);
        SockMgr.on(C_SOCKET_CMDS.ticks, this.onTicks);
        SockMgr.on(C_SOCKET_CMDS.tick, this.onTick);

        this.onTicks(SockMgr.getTicksData());

        if (this.item) SockMgr.subscribeDepth(this.item.tradeCode);
    }

    onTicks(data) {
        if (this.item) this.setState({ tick: data[this.item.tradeCode] });
    }
    onTick(data) {
        if (this.item && data.symbol == this.item.tradeCode) {
            this.onTicks(SockMgr.getTicksData());
        }
    }

    componentWillReceiveProps(nextProps) {
        if ((!this.item && nextProps.item) || (nextProps.item && this.item.tradeCode != nextProps.item.tradeCode)) {
            this.item = nextProps.item;

            this.onTicks(SockMgr.getTicksData());

            SockMgr.subscribeDepth(this.item.tradeCode);
            var priceFixed = this.item.priceFixed;

            var data = { priceFixed };
            data.merge = priceFixed;
            this.setState(data);
        }
    }

    componentWillUnmount() {
        window.removeEventListener("click", this.hideAll);

        SockMgr.off(C_SOCKET_CMDS.client_depth, this.onDepth);
        SockMgr.off(C_SOCKET_CMDS.ticks, this.onTicks);
        SockMgr.off(C_SOCKET_CMDS.tick, this.onTick);

        if (this.item) SockMgr.unsubscribeDepth(this.item.tradeCode);
    }

    onDepth() {
        this.forceUpdate();
    }
    getMergeDepthData() {
        this.maxVol = 0;

        var aList = [], bList = [];
        var aNum = 10, bNum = 10;
        if (this.state.mode == 1) {
            aNum = 0;
            bNum = 20;
        } else if (this.state.mode == 2) {
            aNum = 20;
            bNum = 0;
        }

        var item = this.item;
        var dData = SockMgr.getDepthData();
        // console.log("getMergeDepthData="+JSON.stringify(dData));
        if (dData && (dData.a || dData.b) && item) {
            var volFixed = item.volFixed;
            if (aNum > 0) {
                aList = this.mergeDepthData(dData.a, this.state.merge, aNum, volFixed, 'a');
                aList.sort((a, b) => Number(a[0]) < Number(b[0]) ? 1 : -1);
            }
            if (bNum > 0) {
                bList = this.mergeDepthData(dData.b, this.state.merge, bNum, volFixed, 'b');
            }
        }

        var aRemain = aNum - aList.length;
        if (aRemain >= 0) {
            var arr = Array.apply(null, { length: aRemain });
            aList = arr.concat(aList);
        }
        var bRemain = bNum - bList.length;
        if (bRemain >= 0) {
            var arr = Array.apply(null, { length: bRemain });
            bList = bList.concat(arr);
        }

        return { aList, bList };
    }
    mergeDepthData(data, scale, count, volFixed, type) {
        var prevPrice = 0, prevVol = 0, volTotal = 0;
        var list = [];
        if (data) {
            for (var i = 0, l = data.length; i < l; i++) {
                var info = data[i];
                if (info) {
                    var price = type == 'a' ? Decimal.ceil(info[0], scale) : Decimal.round(info[0], scale);
                    var vol = info[1];
                    if (prevPrice == price) {
                        prevVol = Decimal.accAdd(prevVol, vol);
                        volTotal = Decimal.accAdd(volTotal, vol);
                    } else {
                        if (prevPrice && prevVol) {
                            var len = list.push([prevPrice, Decimal.round(prevVol, volFixed), Decimal.round(volTotal, volFixed)]);
                            this.maxVol = Math.max(this.maxVol, Number(Decimal.round(prevVol, volFixed)));
                            if (len >= count) break;
                        }
                        prevPrice = price;
                        prevVol = vol;
                        if (volTotal == 0) volTotal = vol;
                        else volTotal = Decimal.accAdd(volTotal, vol);
                    }
                    if (i == l - 1) {
                        list.push([prevPrice, Decimal.round(prevVol, volFixed), Decimal.round(volTotal, volFixed)])
                        this.maxVol = Math.max(this.maxVol, Number(Decimal.round(prevVol, volFixed)));
                    }
                }
            }
        }
        return list;
    }
    onChangeMode(mode) {
        if (this.state.mode != mode) this.setState({ mode });
    }
    onChangeDepthMerge(e, val) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (this.state.merge != val) this.setState({ merge: val });
        this.toggleMergeOptions();
    }
    toggleMergeOptions(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.setState({ dropDown: !this.state.dropDown });
    }
    hideAll() {
        this.setState({ dropDown: false });
    }
    selectPrice(price) {
        if (!price) return;

        customEvent.emit("SelectPrice", price);
    }

    render() {
        const { priceFixed, merge, dropDown, tick, mode } = this.state;
        const { item } = this.props;
        const { aList, bList } = this.getMergeDepthData();

        const optionsNum = priceFixed;
        var options = Array.apply(null, { length: optionsNum })

        const modeOptions = Array.apply(null, { length: 3 })

        const { lang } = this.context;

        const currency = langCurrency(lang);
        var exchPrice;
        console.log(aList)
        if (tick) exchPrice = tick.exchangePrice[currency];
        const upOrDown = !tick || !Number(tick.chg) ? "" : Number(tick.chg) > 0 ? "up" : "down";
        return (
            <div className="sell-buy">
                <div className="limit">
                    <div>
                        <strong><I18n message="TradingDepth" /></strong>
                        <span onClick={this.toggleMergeOptions}><I18n message="TradingDepthMerge" params={[merge]} /><i className="arrow"></i></span>
                        {
                            dropDown
                            &&
                            <ul className="limit-list">
                                {!!priceFixed && options.map((v, i) => {
                                    var val = priceFixed - (optionsNum - i) + 1;
                                    return (
                                        <li key={"do" + i} onClick={(e) => this.onChangeDepthMerge(e, val)}>{I18nFunc("TradingDepthMerge", val)}</li>
                                    )
                                })
                                }
                            </ul>
                        }
                    </div>
                    <div className="depth-type">
                        {!!modeOptions && modeOptions.map((v, i) => {
                            return <span className={mode == i ? "on" : ""} key={"mode" + i} onClick={this.onChangeMode.bind(this, i)}><i className={"spot" + (i + 1)}></i></span>
                        })}
                    </div>
                </div>
                <hgroup className="current-title">
                    <h2><I18n message="TradingDepthPrice" params={[item ? item.toCode : ""]} /></h2>
                    <h2><I18n message="TradingDepthVol" params={[item ? item.fromCode : ""]} /></h2>
                    <h2><I18n message="TradingDepthVolTotal" params={[item ? item.fromCode : ""]} /></h2>
                </hgroup>
                <ul className="sell-currency" style={mode == 0 ? { height: "300px" } : {}}>
                    {!!aList && aList.map((v, i) => {
                        var percent = v ? Decimal.toPercent(Decimal.accDiv(v[1], this.maxVol)) : '0%';
                        return <li key={"a" + i} onClick={() => this.selectPrice(v ? v[0] : '')}>
                            <span className="down">{v ? v[0] : '--'}</span>
                            <span>{v ? isLength(item.stepSize, v[1]) : '--'}</span>
                            <span>{v ? isLength(item.stepSize, v[2]) : '--'}</span>
                            <div style={{ width: percent }}></div>
                        </li>
                    })}
                </ul>
                <div className="newest" onClick={() => this.selectPrice(tick && tick.price ? tick.price : '')}>
                    <span className={(upOrDown ? " " + upOrDown : "")} >{tick && tick.price ? tick.price : '--'} </span>
                    <span>&nbsp;&nbsp;≈&nbsp;&nbsp;</span>
                    <span>{(exchPrice ? Decimal.addCommas(exchPrice) + ' ' + currency : '--')}</span>
                </div>
                <ul className="buy-currency">
                    {!!bList && bList.map((v, i) => {
                        var percent = v ? Decimal.toPercent(Decimal.accDiv(v[1], this.maxVol)) : '0%';
                        return <li key={"b" + i} onClick={() => this.selectPrice(v ? v[0] : '')}>
                            <span className="up">{v ? v[0] : '--'}</span>
                            <span>{v ? isLength(item.stepSize, v[1]) : '--'}</span>
                            <span>{v ? isLength(item.stepSize, v[2]) : '--'}</span>
                            <div style={{ width: percent }}></div>
                        </li>
                    })}
                </ul>
            </div>
        )
    }
}
