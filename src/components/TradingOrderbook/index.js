import React from 'react';
import { autobind } from 'core-decorators';
import I18n, { I18nFunc } from 'components/i18n';
import SockMgr, { C_SOCKET_CMDS } from "../../js/socket";
import dayjs from 'dayjs';
import Decimal from "../../js/decimal";
import { langCurrency,  isLength } from "js/common";

@autobind
export default class TradingOrderbook extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            list: [],
        }
    }

    componentWillMount() {
        SockMgr.on(C_SOCKET_CMDS.client_trade, this.onTrade);
    }

    componentWillUnmount() {
        SockMgr.off(C_SOCKET_CMDS.client_trade, this.onTrade);
    }

    onTrade(data) {
        var newList = [].concat(data).reverse();
        this.setState({ list: newList });
    }
    render() {
        const { list } = this.state;
        const { item } = this.props;
        return (
            <div className="current-volume">
                <h2><I18n message="TradingTradeTitle" /></h2>
                <hgroup className="title-list">
                    <h3><I18n message="TradingTradeTime" /></h3>
                    <h3><I18n message="TradingTradeSide" /></h3>
                    <h3><I18n message="TradingDepthPrice" params={[item ? item.toCode : ""]} /></h3>
                    <h3><I18n message="TradingDepthVol" params={[item ? item.fromCode : ""]} /></h3>
                </hgroup>
                <ul className="volume-list">
                    {list.map((v, i) => {
                        if (i < 13) return <li key={i}>
                            <span>{dayjs(v.ts).format("HH:mm:ss")}</span>
                            <span className={v.dir == "ask" ? "buyed" : "selled"}>{v.dir != "ask" ? I18nFunc("TradingTradedSell") : I18nFunc("TradingTradedBuy")}</span>
                            <span>{item ? isLength(item.tickSize, v.price) : ''}</span>
                            <span>{item ? isLength(item.stepSize, v.amount) : ''}</span>
                        </li>
                    })}
                </ul>
            </div>
        )
    }
}
