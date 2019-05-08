// import Api from '../../js/api';
// import {subscribeTicks} from "./tradeWsData";
import {getAllCoin, getIndexCoin, moneyType} from "../../js/http-req";
import SockMgr from "../../js/socket";
import Trade from "../../js/trade";
import Decimal from "../../js/decimal";

export function allTradeInfo() {
    return dispatch => {
        return getAllCoin().then((res)=>{
            var result = res.data;
            if (result && result.status==200){
              //console.log(result);
                var allList = result.data;

                dispatch({type:"allTradeInfo", data: allList});

                var newList = [];
                var recommentList = [];
                var pairMap = {};
                allList.forEach((v)=>{
                    for (var key in v){
                        var symbols = v[key];
                        symbols.forEach((sv)=>{
                            sv.minPrice = String(Decimal.toFixed(sv.minPrice));
                            sv.minQty = String(Decimal.toFixed(sv.minQty));
                            sv.tickSize = Number(sv.tickSize)==0 ? 1 : sv.tickSize;
                            sv.tickSize = String(Decimal.toFixed(sv.tickSize));
                            sv.stepSize = Number(sv.stepSize)==0 ? 1 : sv.stepSize;
                            sv.stepSize = String(Decimal.toFixed(sv.stepSize));
                            sv.priceFixed = Decimal.getDotDigit(sv.tickSize);
                            sv.volFixed = Decimal.getDotDigit(sv.stepSize);
                            var codeList = sv.tradeCode.split("/");
                            sv.fromCode = codeList[0];
                            sv.toCode = codeList[1];

                            pairMap[sv.tradeCode] = sv;

                            newList.push(SockMgr.pair2Symbol(sv.tradeCode));
                            if (sv.recommend==1) recommentList.push({market:key, symbol: sv.tradeCode, fromCode:sv.fromCode, toCode:sv.toCode, volFixed:sv.volFixed})
                        });
                    }
                });
                Trade.setPairMap(pairMap);

                dispatch({type:"getRecomment", data: recommentList});

                if (newList[0]){
                    SockMgr.subscribeExchange();
                    SockMgr.subscribeTicks(newList);
                }
            }
        }).catch(err =>{

        });
    };
}

export function getRecomment() {
    return dispatch => {
        return getIndexCoin().then(res=>{
            var result = res.data;
            if (result && result.status==200){
                var newList = [];
                var list = result.data;
                list.forEach((v, i)=>{
                    for (var key in v){
                        var symbols = v[key];
                        symbols.forEach((sv, si)=>{
                            newList.push({market:key, symbol:sv});
                        });
                    }
                });
                dispatch({type:"getRecomment", data: newList});
            }

        }).catch(err=>{

        });
    };
}

export function allCoins() {
    return dispatch =>{
        return moneyType().then(res => {
            var result = res.data;
            if(result && result.status == 200) {
                var coinMap = {};
                var list = result.data;
                list.forEach((v, i)=>{
                    coinMap[v.coinCode] = v;
                });
                dispatch({type:"allCoins", data: coinMap});
            }
        }).catch(err => {
            console.log(err)
        })
    }
}
