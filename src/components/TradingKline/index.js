import React from './node_modules/react';
import {autobind} from './node_modules/core-decorators';
import Chart from '../../js/chart';
import Trade from "../../js/trade";
import {C_SOCKET_CMDS} from "../../js/socket";
import {customEvent} from "../../js";
import SockMgr from "../../js/socket";

@autobind
export default class TradingKline extends React.Component{
    constructor(props, context) {
        super(props, context);

        // this.code = this.props.item.tradeCode;

        this.state = {
        };
    }

    componentDidMount() {
        this.draw(this.props);
    }

    componentWillUnmount() {
        Chart.destroy();
    }

    componentWillReceiveProps(nextProps) {
        if(!this.props.item && nextProps.item || this.props.item && nextProps.item && this.props.item.tradeCode!=nextProps.item.tradeCode){
            this.draw(nextProps);
        }
        if (this.props.lang!=nextProps.lang){
            Chart.setLanguage(nextProps.lang);
        }

        // if (this.props.theme != nextProps.theme) {
        //      Chart.setTheme(nextProps.theme);
        // }
    }
    draw(props){
        if (props.item){
            if (!Chart.isReady()){
                Chart.init(props.item.tradeCode, Trade.getKvStore("klp", 15), Trade.getKvStore("klct", 1), props.theme, props.lang, this.onChartSwitch);
            }else{
                Chart.switch(props.item.tradeCode);
            }
        }
    }

    onChartSwitch(symbol, period, chartType) {
        Trade.setKvStore("klp", period);
        if (chartType) Trade.setKvStore("klct", chartType)
    }

    render(){
        return (
            <div className="trading-view" id="tv_chart_container"></div>
        )
    }
}
