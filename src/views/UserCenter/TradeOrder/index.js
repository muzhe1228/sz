import React from 'react';
import {autobind} from 'core-decorators';
import {Route} from 'react-router-dom';
import HistoryEntrust from './HistoryEntrust';
// import TradeDetails from './TradeDetails';
import TradingEntrust from './TradingEntrust';
import './style.less';
@autobind
export default class TradeOrder extends React.Component{
    render(){
        return(
            <div className="trade-order">
                <Route  path="/user_center/trade_order/history_entrust" component={HistoryEntrust} />
                {/* <Route path="/user_center/trade_order/trade_details" component={TradeDetails} /> */}
                <Route path="/user_center/trade_order/trading_entrust" component={TradingEntrust} />
            </div>
        )
    }
}
