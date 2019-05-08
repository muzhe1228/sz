import React from 'react';
import { autobind } from 'core-decorators';
import './style.less';
import PropTypes from "prop-types";
import { getParmeter } from "js/index";
import { Link } from 'react-router-dom';
import { lStore } from 'js';
// import Trade from 'js/trade';
import TradingItem from "../../components/TradingItem";
import TradingPairList from "../../components/TradingPairList";
import TradingKline from "../../components/TradingKline";
import TradingForm from "../../components/TradingForm";
import TradingDepth from "../../components/TradingDepth";
import TradingOrderbook from "../../components/TradingOrderbook";
import TradingMyOrder from "../../components/TradingMyOrder";
import AllShade from 'components/AllShade';
import inviteImg from 'images/invite_chart.png'
@autobind
export default class Trading extends React.Component {
    static contextTypes = {
        lang: PropTypes.string,
        tradeInfo: PropTypes.object
    };
    constructor(props, context) {
        super(props, context);

        // var favs = Trade.getFavorites();
        this.state = {
            product: this.getCurrTradeInfo(props),
            // sunSkin: "dark"
        };
    }
    componentWillReceiveProps(nextProps) {
        if (!this.state.product || this.state.product.tradeCode != this.getUrlParamCode(nextProps)) {
            var product = this.getCurrTradeInfo(nextProps);
            if (product) this.setState({ product });
        }
    }
    getUrlParamCode(props) {
        var code = getParmeter("pair", props.location.search);
        if (code) return code.replace("_", "/");
    }
    getCurrTradeInfo(props) {
        var code = this.getUrlParamCode(props);
        var allTradeInfo = this.context.tradeInfo.allTradeInfo;
        if (!code) {
            for (var i = 0, l = allTradeInfo.length; i < l; i++) {
                var info = allTradeInfo[i];
                if (info) {
                    for (var market in info) {
                        var mList = info[market];
                        if (mList && mList[0]) return mList[0];
                    }
                }
            }
        } else {
            for (var i = 0, l = allTradeInfo.length; i < l; i++) {
                var info = allTradeInfo[i];
                if (info) {
                    for (var market in info) {
                        var mList = info[market];
                        if (mList) {
                            for (var j = 0, jl = mList.length; j < jl; j++) {
                                var item = mList[j];
                                if (item && item.tradeCode == code) return item;
                            }
                        }
                    }
                }
            }
        }
    }
    // changeSkin(type) {
    //     this.setState({ sunSkin: type });
    // }
    reloadFormWallet() {
        if (this.tFormRef) {
            this.tFormRef.loadWallet();
        }
    }
    setStore(){
        lStore.set('userTab', 3)
    }
    render() {
        const { product } = this.state;
        const sunSkin = lStore.get('theme') == 'fff' ? "light" : 'dark';
        const skin = sunSkin == "light" ? "white" : "primary";

        return (
            <div className="trading" style={sunSkin == "light" ? { backgroundColor: "#F1F3F7" } : { backgroundColor: "#08112C" }}>
                <div className={"containerTrading " + (sunSkin == "light" ? "sunSkin" : "moonSkin")}>
                    <TradingItem item={product}  theme={sunSkin} />
                    <div className="trading-content">
                        <div className="trading-chart">
                            <div className="trading-chart-left">
                                <Link to="/user_center/invite" className="chart_invite" onClick={this.setStore}><img src={inviteImg} alt=""/></Link>
                                    
                                <TradingPairList item={product} allTradeInfo={this.context.tradeInfo.allTradeInfo} />
                            </div>
                            <div className="market-trading">
                                <TradingKline item={product} theme={skin} />
                                <TradingForm item={product} allCoins={this.context.tradeInfo.allCoins} ref={(r) => this.tFormRef = r} />
                            </div>
                            <TradingDepth item={product} />
                        </div>
                        <div className="trading-order">
                            <TradingOrderbook item={product} />
                            <TradingMyOrder item={product} onChange={this.reloadFormWallet} />
                        </div>
                    </div>
                </div>

                {/* <AllShade></AllShade> */}
            </div>
        )
    }
}
