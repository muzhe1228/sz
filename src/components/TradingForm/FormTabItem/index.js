import React from "react";
import {Link} from 'react-router-dom';
import {autobind} from 'core-decorators';
import HButton from '../../HButton';
import I18n,{I18nFunc} from '../../i18n';
import PropTypes from "prop-types";
import {langCurrency} from "../../../js/common";
import ExchangeTxt from "../ExchangeTxt";
import NumberInput from "../NumberInput";
import Decimal from "js/decimal"
import {customEvent} from "js/index";

@autobind
export default class FormTabItem extends React.Component{
    static contextTypes = {
        lang: PropTypes.string
    };

    constructor(props, context) {
        super(props, context);

        var buyPrice = this.props.buyPrice;
        var sellPrice = this.props.sellPrice;

        this.percentOptions = [0, 25, 50, 75, 100];

        this.mounded = true;

        this.state = {
            buyPrice: buyPrice|| '',
            buyAmount: '',
            buyMarketAmount: '',
            buyPercent: 0,
            sellPrice:sellPrice|| '',
            sellAmount:'',
            sellPercent: 0
        }
    }

    componentWillMount() {
        customEvent.on("SelectPrice", this.onSelectPrice)
    }

    onSelectPrice(price){
        if (price){
            this.onChangeBuyPrice(price);
            this.onChangeSellPrice(price);
        }
    }

    componentWillReceiveProps(nextProps) {
        var isChangeCode = (!this.props.item && nextProps.item) || (this.props.item && nextProps.item && this.props.item.tradeCode!=nextProps.item.tradeCode);
        if (isChangeCode){
            this.setState({buyPrice: '', sellPrice:'', buyAmount:'', sellAmount:'', buyMarketAmount:'', buyPercent:0, sellPercent:0});
        }

        if (nextProps.buyPrice){
            if (this.props.tradeType==1){
                if (!this.state.buyPrice) this.onChangeBuyPrice(String(Decimal.ceil(nextProps.buyPrice, nextProps.item.priceFixed)));
            }
        }
        if (nextProps.sellPrice){
            if (this.props.tradeType==1){
                if (!this.state.sellPrice) this.onChangeSellPrice(String(Decimal.round(nextProps.sellPrice, nextProps.item.priceFixed)));
            }
        }
    }

    onChangeBuyPrice(buyPrice){
        if (buyPrice!=this.state.buyPrice){
            var data = {buyPrice};

            var buyAmount = '';
            if (this.state.buyPercent){
                var money = this.getWalletAmount(this.props.item.toCode);
                if (money) buyAmount = this.getBuyAmount(this.state.buyPercent, money, buyPrice);
            }
            if (buyAmount) data.buyAmount = buyAmount;

            this.setState(data);
        }
    }
    onChangeBuyAmount(buyAmount){
        if (buyAmount!=this.state.buyAmount){
            this.setState({buyAmount});
        }
    }
    onChangeBuyMarketAmount(buyMarketAmount){
        if (buyMarketAmount!=this.state.buyMarketAmount){
            this.setState({buyMarketAmount});
        }
    }
    onChangeSellPrice(sellPrice){
        if (sellPrice!=this.state.sellPrice){
            var data = {sellPrice};

            var sellAmount = '';
            if (this.state.sellPercent){
                var money = this.getWalletAmount(this.props.item.fromCode)
                if (money)sellAmount = this.getSellAmount(this.state.sellPercent, money);
            }
            if (sellAmount) data.sellAmount = sellAmount;
            this.setState(data);
        }
    }
    onChangeSellAmount(sellAmount){
        if (sellAmount!=this.state.sellAmount){
            this.setState({sellAmount});
        }
    }
    onChangeBuyPerecnt(buyPercent){
        if (buyPercent!=this.state.buyPercent){
            var money = this.getWalletAmount(this.props.item.toCode)
            if (this.props.tradeType==1){
                var buyAmount = '';
                if (money && this.state.buyPrice)buyAmount = this.getBuyAmount(buyPercent, money, this.state.buyPrice);
                this.setState({buyPercent, buyAmount})
            }else{
                var buyMarketAmount = '';
                if (money)buyMarketAmount = this.getBuyMarketAmount(buyPercent, money);
                this.setState({buyPercent, buyMarketAmount})
            }
        }
    }
    onChangeSellPerecnt(sellPercent){
        if (this.state.sellPercent!=sellPercent){
            var sellAmount = '';
            var money = this.getWalletAmount(this.props.item.fromCode);
            if (money)sellAmount = this.getSellAmount(sellPercent, money);
            this.setState({sellPercent, sellAmount})
        }
    }
    getWalletAmount(currency){
        var info = this.props.wallet[currency]
        return info ? info.currentAmount : 0;
    }
    getBuyAmount(percent, totalMoney, price){
        return String(Decimal.round(Decimal.accDiv(Decimal.accMul(percent, totalMoney), Decimal.accMul(price, 100)), this.props.item.volFixed));
    }
    getBuyMarketAmount(percent, totalMoney){
        var toFixed = this.props.allCoins[this.props.item.toCode].coinPrecision;
        return String(Decimal.round(Decimal.accDiv(Decimal.accMul(percent, totalMoney), 100), toFixed));
    }
    getSellAmount(percent, totalMoney){
        return String(Decimal.round(Decimal.accDiv(Decimal.accMul(percent, totalMoney), 100), this.props.item.volFixed));
    }
    submitOrder(position){
        var data = {position, sourceCoin:this.props.item.toCode, targetCoin:this.props.item.fromCode, tradeAmount:Number(position==0?(this.props.tradeType==1?this.state.buyAmount:this.state.buyMarketAmount):this.state.sellAmount),
            tradePrice:Number(position==0?this.state.buyPrice:this.state.sellPrice), tradeType:this.props.tradeType};
        if (this.props.submitOrder) this.props.submitOrder(data, (result)=>{
            if (result && this.mounded){
                if (data.position==0){
                    if (data.tradeType==1){
                        this.setState({buyAmount:'', tradePrice:'', buyPercent:0});
                    }else{
                        this.setState({buyMarketAmount:'', buyPercent:0});
                    }
                }else{
                    this.setState({sellPrice:'', sellAmount:'',sellPercent:0});
                }
            }
        });
    }
    componentWillUnmount() {
        this.mounded = false;

        customEvent.remove("SelectPrice", this.onSelectPrice)
    }
    ///v1/position/list/web
    render(){
        const {tab, tradeType, item, isTradePwd, wallet, isLoged, allCoins} = this.props;
        const {buyPrice, buyAmount, buyMarketAmount, buyPercent, sellPrice, sellAmount, sellPercent} = this.state;
        const {lang} = this.context;

        const currency = langCurrency(lang);

        var fromCode = '', toCode = '', money_buy = 0, money_sell = 0;
        var minPrice = 0, maxPrice=0, minQty = 0, maxQty=0, stepSize=1, tickSize=1,  amountStep=1;
        var priceFixed = 0, volFixed = 0, fromFixed = 0, toFixed = 0;
        var entrustMinAmount = 0, entrustMaxAmount = 0;
        if (item){
            fromCode = item.fromCode;
            toCode = item.toCode;
            minPrice = item.minPrice;
            stepSize = item.stepSize;
            tickSize = item.tickSize;
            minQty = item.minQty;
            maxPrice = item.maxPrice;
            maxQty = item.maxQty||99999999;
            // maxQty = 1000000;
            priceFixed = item.priceFixed;
            volFixed = item.volFixed;
            entrustMinAmount = item.entrustMinAmount;
            entrustMaxAmount = item.entrustMaxAmount;
            toFixed = allCoins && allCoins[toCode] ? allCoins[toCode].coinPrecision : 0;
            amountStep = Decimal.accDiv(1, Math.pow(10, toFixed));
            fromFixed = allCoins && allCoins[fromCode] ? allCoins[fromCode].coinPrecision : 0;
            if (wallet){
                if (wallet[toCode]) money_buy = Decimal.format(wallet[toCode].currentAmount, toFixed);
                if (wallet[fromCode]) money_sell = Decimal.format(wallet[fromCode].currentAmount, fromFixed);
            }
        }
        return <div className="trading-type">
            <div className="trading-buy">
                <div className="buy-wrap">
                    <div className="usable-amount">
                        <span>{I18nFunc("TradingFormCanUse", isLoged ? money_buy : '--', toCode)}</span>
                        <Link to="/user_center/asset_manage/my_wallet" target="_blank">{I18nFunc("TradingFormRecharge")}</Link>
                    </div>
                    {tab == 0?
                        <div>
                          <div className="trading-input">
                            <span>{I18nFunc("TradingFormBuyPrice")} <em>{toCode}</em></span>
                            <NumberInput value={buyPrice} onChange={this.onChangeBuyPrice} step={tickSize} min={minPrice} max={maxPrice}/>
                          </div>
                          <ExchangeTxt currency={currency} price={buyPrice} code={toCode}/>
                        </div>
                    : <div className="spot-trading-txt">{I18nFunc("TradingFormBuyTip")}<span></span></div>}
                    {tab == 0 ? <div className="trading-input">
                        <span>{I18nFunc("TradingFormBuyVolume")} <em>{fromCode}</em></span>
                        <NumberInput value={buyAmount} onChange={this.onChangeBuyAmount} step={stepSize} min={minQty}
                                     max={maxQty}/>
                    </div> :
                        <div className="trading-input">
                            <span>{I18nFunc("TradingFormAmount")} <em>{toCode}</em></span>
                            <NumberInput value={buyMarketAmount} onChange={this.onChangeBuyMarketAmount} step={tickSize} min={String(Decimal.toFixed(Number(entrustMinAmount)))}
                                         max={String(Decimal.toFixed(Number(entrustMaxAmount)))}/>
                        </div>
                    }
                    <div className="trading-percent">
                        <div className="bar"></div>
                        <div className="spot-box">
                            {this.percentOptions.map((v, i)=>{
                                return <span className={buyPercent==v?"on":""} onClick={()=>{this.onChangeBuyPerecnt(v)}} key={"po1_"+i}><i>{v+'%'}</i></span>
                            })}
                        </div>
                    </div>
                    <div className="predict">
                        {tab==0 && <span>{I18nFunc("TradingFormCalcAmount")}</span>}
                        {tab==0 && <span>{buyPrice && buyAmount ? Decimal.toFixed(Number(Decimal.accMul(buyPrice, buyAmount, toFixed))) : '--'} {toCode}</span>}
                    </div>
                    <HButton type="buy" size="big" text={I18nFunc("TradingFormBuy", fromCode)} onClick={()=>this.submitOrder(0)}/>
                </div>
            </div>
            <div className="trading-sell">
                <div className="sell-wrap">
                    <div className="usable-amount">
                        <span>{I18nFunc("TradingFormCanUse",isLoged ? money_sell : '--', fromCode)}</span>
                        <Link to="/user_center/asset_manage/my_wallet" target="_blank">{I18nFunc("TradingFormRecharge")}</Link>
                    </div>
                    {tab == 0?
                    <div>
                        <div className="trading-input">
                            <span>{I18nFunc("TradingFormSellPrice")} <em>{toCode}</em></span>
                            <NumberInput value={sellPrice} onChange={this.onChangeSellPrice} step={tickSize} min={minPrice} max={maxPrice} />
                        </div>
                        <ExchangeTxt currency={currency} price={sellPrice} code={toCode}/>
                    </div>
                    : <div className="spot-trading-txt">{I18nFunc("TradingFormSellTip")}<span></span></div>}
                    <div className="trading-input">
                        <span>{I18nFunc("TradingFormSellVolume")} <em>{fromCode}</em></span>
                        <NumberInput value={sellAmount} onChange={this.onChangeSellAmount} step={stepSize} min={minQty} max={maxQty} />
                    </div>
                    <div className="trading-percent">
                        <div className="bar"></div>
                        <div className="spot-box">
                            {this.percentOptions.map((v, i)=>{
                                return <span className={sellPercent==v?"on":""} onClick={()=>{this.onChangeSellPerecnt(v)}} key={"po2_"+i}><i>{v+'%'}</i></span>
                            })}
                        </div>
                    </div>
                    <div className="predict">
                        {tab==0 && <span>{I18nFunc("TradingFormCalcAmount")}</span>}
                        {tab==0 && <span>{sellPrice && sellAmount ? Decimal.toFixed(Number(Decimal.accMul(sellPrice, sellAmount, toFixed))) : '--'} {toCode}</span>}
                    </div>
                    <HButton type="sell" size="big" text={I18nFunc("TradingFormSell", fromCode)} onClick={()=>this.submitOrder(1)}/>
                </div>
            </div>
        </div>
    }
}
