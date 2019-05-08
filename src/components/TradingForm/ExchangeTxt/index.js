import React from 'react';
import { autobind } from 'core-decorators';
import SockMgr, { C_SOCKET_CMDS } from 'js/socket';
import Decimal from "js/decimal";

@autobind
export default class ExchangeTxt extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            exchangePrice: 0
        }
    }
    componentWillMount() {
        SockMgr.on(C_SOCKET_CMDS.exTick, this.onExtTick);

        this.onExtTick(SockMgr.getExchangeData())
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.code != nextProps.code && nextProps.code) {
            this._onExtTick(SockMgr.getExchangeData(), nextProps);
        }
        if (this.props.currency != nextProps.currency) {
            this._onExtTick(SockMgr.getExchangeData(), nextProps);
        }
    }

    _onExtTick(data, props) {
        if (data && data[props.currency]) {
            var exchangePrice = data[props.currency][props.code];
            if (exchangePrice) this.setState({ exchangePrice });
        }
    }

    onExtTick(data) {
        this._onExtTick(data, this.props)
    }

    componentWillUnmount() {
        SockMgr.off(C_SOCKET_CMDS.exTick, this.onExtTick);
    }

    render() {
        const { currency, price } = this.props;
        const { exchangePrice } = this.state;

        var val;
        if (price && exchangePrice) {
            val = Number(Decimal.accMul(price, exchangePrice));
            // val = val > 1 ? Decimal.addCommas(Decimal.toFixed(val, 2)) : Decimal.toFixed(val, 6)
            val = Decimal.addCommas(Decimal.toFixed(val, (val >= 1 ? 2 : 4)));
        }

        // console.log(price, exchangePrice);

        return (
            <div className="total">&#8776;<span>&nbsp;{val || '--'}</span>&nbsp;{currency}</div>
        )
    }
}
