import CSocket from './CSocket';
import ENV from './appConfig';
import Decimal from './decimal';
import Trade from './trade';

// export default new CSocket('ws://47.75.144.95:12389'); // 佩文地址
// export default new CSocket("ws://47.75.136.50:12389");
// export default new CSocket(ENV.getENV().socketTick); // 测试地址-动态配置

// import MWSocket from './MWSocket';
// import { SOCKET_MODE_HEADER, getUuid } from 'react-hymn';
// export default new MWSocket('', {
//   pingData: getUuid() + JSON.stringify({cmd: 'ping'}),
//   mode: SOCKET_MODE_HEADER,
//   storageKey: 'socketABC'
// })

export const C_SOCKET_CMDS = {
    ping: 'ping', // 委托
    chart: 'chart', // 图表
    depth: 'depth', // 深度
    tick: 'tick',
    ticks: 'ticks',
    order_depth: 'order_depth', // 委托
    exTicBTC: 'exTicBTC',
    exTick: 'exTick',

    login: 'login',
    adsMsg: 'mutualMsg',
    oldAdsMsg: 'mutualHistoryMsg',
    orderMsg: 'orderMsg',
    oldOrderMsg: 'oldOrderMsg',

    c2c_chat: 'c2c_chat',

    client_depth: 'client_depth',
    client_trade: 'client_trade',
    client_order_reconn: 'client_order_reconn', //委托单重连成功
}

export default {
    _isInited: false,
    tradeSocket: null,
    orderSocket: null,
    tradeData: {
        tickMap: {},
        exchange: {}, //换算
        depthMap: {}, //深度数据
        tradeList: [], //最新成交数据
        exTicBTCMap: []
    },
    tickSymbols: [], //订阅tick的产品对
    eventHandlerMap: {},

    depthPair: null,
    chartParmas: null,

    init() {
        if (!this._isInited) {
            this._initTradeSocket();

            this._isInited = true;
        }
    },
    //行情
    _initTradeSocket() {
        var socket = new CSocket(ENV.getENV().socketTick); // 测试地址-动态配置

        socket.on(C_SOCKET_CMDS.ticks, this._onTicks.bind(this));
        socket.on(C_SOCKET_CMDS.tick, this._onTick.bind(this));
        socket.on(C_SOCKET_CMDS.exTick, this._onExchange.bind(this));
        socket.on(C_SOCKET_CMDS.depth, this._onDepth.bind(this));
        socket.on(C_SOCKET_CMDS.chart, this._onChart.bind(this));
        socket.on(C_SOCKET_CMDS.exTicBTC, this._onExTicBTC.bind(this));

        socket.addReconnectOkListerer(this._onReconnectOk.bind(this));

        this.tradeSocket = socket;
        this.exTickBtcSend()
        // this.tradeSocket.sendData(JSON.stringify({"cmd":"exTicBTC"}));
    },
    //重连成功后重新订阅
    _onReconnectOk() {
        if (this.tickSymbols.length) {
            var symbols = this.tickSymbols;
            this.tickSymbols = [];
            this.subscribeTicks(symbols);

            this.subscribeExchange();
        }
        if (this.depthPair) { //如果深度要订阅，证明在交易界面，k线也需重新请求
            var pair = this.depthPair;
            this.depthPair = null;
            this.subscribeDepth(pair);

            this.reqChart(this.chartParmas[0], this.chartParmas[1]);
        }
    },
    //委托单的socket
    initOrderSocket() {
        if (!this.orderSocket) {
            var socket = new CSocket(ENV.getENV().socketCurrency, { isBase_64: false });

            socket.on(C_SOCKET_CMDS.order_depth, this._onOrder.bind(this));

            socket.addReconnectOkListerer(this.onOrderReconnectOk.bind(this));

            this.orderSocket = socket;
        }
    },
    subscribeOrder(userId, token) {
        this.orderSocket.setUserId(userId);
        this.orderSocket.sendData(JSON.stringify({ "cmd": "order_depth", "content": { "orderType": "0", userId, token } }));
    },
    _onOrder(data) {
        // console.log(data,'委托单')
        if (data && data.content) {
            var body = JSON.parse(data.content);
            if (typeof (body.content) == "string") {
                body.content = JSON.parse(body.content);
            }

            this._onCallEvent(C_SOCKET_CMDS.order_depth, body);
        }
    },
    onOrderReconnectOk() {
        this._onCallEvent(C_SOCKET_CMDS.client_order_reconn);
    },
    subscribeTicks(symbols) {
        var symbols = symbols.filter((v) => this.tickSymbols.indexOf(v) == -1);
        if (symbols.length > 0) {
            this.tradeSocket.sendData(JSON.stringify({ "cmd": "ticks", "channel": "add", "symbols": symbols }));
            this.tickSymbols = this.tickSymbols.concat(symbols);
        }
    },
    //币对对法币汇率命令
    subscribeExchange() {
        this.tradeSocket.sendData(JSON.stringify({ "cmd": "exTick", "channel": "add" }));
    },
    //币对对法币汇率命令总
    exTickBtcSend() {
        this.tradeSocket.sendData(JSON.stringify({ "cmd": "exTicBTC" }));
    },
    subscribeDepth(pair) {
        var symbol = this.pair2Symbol(pair);
        if (this.depthPair) {
            if (this.depthPair != symbol) {
                this.unsubscribeDepth(this.depthPair);
            }
            else return;
        }

        this.tradeData.depthMap = {};
        this.tradeData.tradeList = [];
        this.depthPair = pair;
        this.tradeSocket.sendData(JSON.stringify({ "cmd": "depth", "channel": "add", symbol }));
    },
    //非订阅，需要轮询获取
    // period：多少分间隔
    // 1分 5分 15分 30分 1小时 4小时 日线 周线 月线
    // 1,5,15,30,60,4*60,24*60,7*24*60,43200
    reqChart(pair, period, count = 1000) {
        var cmd = { "bar": count, "cmd": "chart", period: Number(period), "symbol": this.pair2Symbol(pair) }
        this.tradeSocket.sendData(JSON.stringify(cmd));
        if (count == 1000) this.chartParmas = arguments;
    },
    unsubscribeDepth(pair) {
        var symbol = this.pair2Symbol(pair);
        if (this.tradeSocket) this.tradeSocket.sendData(JSON.stringify({ "cmd": "depth", "channel": "del", symbol }));
        this.depthPair = null;
        this.tradeData.depthMap = {};
        this.tradeData.tradeList = [];
    },
    pair2Symbol(pair) {
        if (pair) {
            return pair.replace("/", "_");
        }
    },
    symbol2Pair(symbol) {
        return symbol.replace("_", "/");
    },
    on(cmd, handler) {
        if (!this.eventHandlerMap[cmd]) {
            this.eventHandlerMap[cmd] = [handler];
        } else if (this.eventHandlerMap[cmd].indexOf(handler) == -1) {
            this.eventHandlerMap[cmd].push(handler);
        }
    },
    off(cmd, handler) {
        var handlers = this.eventHandlerMap[cmd];
        if (handlers) {
            var i = handlers.indexOf(handler);
            if (i != -1) {
                handlers.splice(i, 1);
                //console.log(cmd+" off:"+i);
            }
        }
    },
    getTicksData() {
        return this.tradeData.tickMap;
    },
    getDepthData() {
        return this.tradeData.depthMap;
    },
    getTradeList() {
        return this.tradeData.tradeList;
    },
    getExchangeData() {
        return this.tradeData.exchange
    },
    getExTicBTCData() {
        return this.tradeData.exTicBTCMap
    },
    _onTicks(res) {
        const { datas, symbols } = res;
        // console.log(res);

        datas.forEach((v, i) => {
            var symbol = symbols[i].replace("_", "/");
            v.symbol = symbol;
            this.parseTick(v);
            this.tradeData.tickMap[symbol] = v;
        });

        this._onCallEvent(C_SOCKET_CMDS.ticks, this.tradeData.tickMap)
    },
    _onTick(res) {
        const { data, symbol } = res;

        var sb = symbol.replace("_", "/");
        data.symbol = sb;
        this.parseTick(data);
        this.tradeData.tickMap[sb] = data;

        this._onCallEvent(C_SOCKET_CMDS.tick, data);

        this.updateTradeList(symbol, data);
    },
    _onExchange(res) {
        if (res.data) {

            res.data.forEach((v) => {
                this.tradeData.exchange[v.money] = v.symbols;
            });

            this._onChangeTicksExchange();
            this._onCallEvent(C_SOCKET_CMDS.exTick, this.tradeData.exchange);
        }
    },
    //汇率改变，修改tick中的换算数据
    _onChangeTicksExchange() {
        for (var symbol in this.tradeData.tickMap) {
            var v = this.tradeData.tickMap[symbol];
            if (v) {
                this._onChangeTickExchangePrice(v);
            }
        }
        this._onCallEvent(C_SOCKET_CMDS.ticks, this.tradeData.tickMap)
    },
    _onDepth(res) {
        var result = res.data;
        if (result) {
            if (res.symbol && this.depthPair && this.pair2Symbol(this.depthPair) != res.symbol) return;

            var isDepth = false;
            if (result.hasOwnProperty("a")) {
                this.tradeData.depthMap.a = result.a;
                isDepth = true;
            }
            if (result.hasOwnProperty("b")) {
                this.tradeData.depthMap.b = result.b;
                isDepth = true;
            }

            if (isDepth) {
                this._onCallEvent(C_SOCKET_CMDS.client_depth, this.tradeData.depthMap);
            }

            var isTraded;
            if (result.ticks) {
                this.tradeData.tradeList = result.ticks;
                // isTraded = true;

                this._onCallEvent(C_SOCKET_CMDS.client_trade, this.tradeData.tradeList);
                // console.log(result.ticks);
            }
            // else{
            //     var tick = result.tick;
            //     if (tick){
            //         // console.log(tick);
            //         var tradeList = this.tradeData.tradeList;
            //         var tLen = tradeList.length;
            //         if (tLen > 0){
            //             var lastTrade = tradeList[tLen - 1];
            //             if (lastTrade){
            //                 if (lastTrade.ts < tick.ts){
            //                     if (tLen >= 20) tradeList.shift();
            //                     tradeList.push(tick);
            //                     isTraded = true;
            //                 }
            //                 // else if(lastTrade.ts == tick.ts){
            //                 //     Object.assign(lastTrade, tick);
            //                 //     isTraded = true;
            //                 // }
            //             }
            //         }
            //     }
            // }
            // if (isTraded){
            //     this._onCallEvent(C_SOCKET_CMDS.client_trade, this.tradeData.tradeList);
            // }
        }
    },
    updateTradeList(symbol, data) {
        if (!this.depthPair || this.pair2Symbol(this.depthPair) != symbol) return;

        var tradeList = this.tradeData.tradeList;
        var tLen = tradeList.length;
        if (tLen > 0) {
            var lastTrade = tradeList[tLen - 1];
            if (lastTrade) {
                var tick = { dir: data.dir, price: data.price, amount: data.amount, ts: data.ts };
                if (lastTrade.ts <= tick.ts) {
                    if (tLen >= 20) tradeList.shift();
                    tradeList.push(tick);
                    this._onCallEvent(C_SOCKET_CMDS.client_trade, this.tradeData.tradeList);
                }
            }
        }
    },
    getLastPrice(symbol) {
        if (this.tradeData.tickMap) {
            var tick = this.tradeData.tickMap[symbol];
            if (tick) return tick.price;
        }
    },
    _onChart(data) {
        if (data.code == 0) {
            data.symbol = this.symbol2Pair(data.symbol);
            data.data.reverse(); //递减变递增

            this._onCallEvent(C_SOCKET_CMDS.chart, data);
        }
    },
    _onExTicBTC(res) {
        // console.log(res,'testBTC')
        const { data } = res;
        this.tradeData.exTicBTCMap = data;

        this._onCallEvent(C_SOCKET_CMDS.exTicBTC, data);
    },
    parseTick(info) {
        try {
            var sb = info.symbol.split('/');
            info.fromCode = sb[0];
            info.toCode = sb[1];

            var pairInfo = Trade.getPairInfo(info.symbol);

            info.price = info.price ? Decimal.toFixed(Number(Decimal.toFixed(info.price, pairInfo.priceFixed))) : 0;
            info.day_open = info.day_open ? Decimal.toFixed(Number(Decimal.toFixed(info.day_open, pairInfo.priceFixed))) : 0;
            info.day_high = info.day_high ? Decimal.toFixed(Number(Decimal.toFixed(info.day_high, pairInfo.priceFixed))) : 0;
            info.day_low = info.day_low ? Decimal.toFixed(Number(Decimal.toFixed(info.day_low, pairInfo.priceFixed))) : 0;
            info.day_volume = Decimal.toFixed(Number(Decimal.toFixed(info.day_volume)));

            //涨跌额
            info.change = Number(info.day_open) && Number(info.price) ? Decimal.accSubtr(info.price, info.day_open, pairInfo.priceFixed) : 0;
            //涨跌幅
            info.chg = Number(info.day_open) > 0 ? Decimal.accMul(Decimal.accDiv(info.change, info.day_open), '100', 2) : 0;

            this._onChangeTickExchangePrice(info);
            //if (info.symbol=='LTC/BTC')console.log(info.price);
        } catch (e) {
            console.error(e);
        }
    },
    //tick中的换算数据
    _onChangeTickExchangePrice(tick) {
        if (!tick.exchangePrice) tick.exchangePrice = {};
        if (this.tradeData.exchange) {
            var exchange = this.tradeData.exchange;
            for (var key in exchange) {
                var exchInfo = exchange[key];
                if (exchInfo) {
                    var price;
                    var toPrice = exchInfo[tick.toCode];
                    if (toPrice) {
                        price = Number(Decimal.accMul(toPrice, tick.price));
                    }
                    // if (price) info.exchangePrice[key] = price > 1 ? Decimal.toFixed(price, 2) : Decimal.toFixed(price, 6);
                    if (price) tick.exchangePrice[key] = Decimal.toFixed(price, (price >= 1 ? 2 : 4));
                }
            }
        }
    },
    _onCallEvent(event, data) {
        var handlers = this.eventHandlerMap[event];
        if (handlers) handlers.forEach((v, i) => {
            //console.log(event+" call "+i);
            v(data);
        });
    }
}
