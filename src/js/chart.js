import Datafeeds from '../charting_library/datafeed/udf/datafeed';
import dayjs from 'dayjs';
import { isEmpty } from './index';
import SockMgr, { C_SOCKET_CMDS } from './socket';
import Trade from './trade';
import { I18nFunc } from "../components/i18n";

export default {
    dataCache: {},
    isInitDraw: false, //
    isFullScreen: false,
    studyMap: { 'MA Cross': 1 },
    freeStudy: { "Volume": 1, "MA Cross": 1 },
    //['5MIN', '3MIN', '5MIN', '15MIN', '30MIN', '1HOUR', '2HOUR', '3HOUR', '4HOUR', '6HOUR', '12HOUR', '1DAY', '3DAY', '1WEEK', '2WEEK']
    periodToTV: {
        '5': {
            value: "5",
            text: "5min",
        }, '15': {
            value: "15",
            text: "15min",
        }, '30': {
            value: "30",
            text: "30min",
        }, '60': {
            value: "60",
            text: "1hour",
        }, '240': {
            value: "240",
            text: "4hour",
        }, '1440': {
            value: "1D",
            text: "1day",
        }, "7200": {
            value: "5D",
            text: "5day",
        }, "10080": {
            value: "1W",
            text: "1week"
        }, "43200": {
            value: "1M",
            text: "1mon"
        }
    },
    periodMsecMap: {},
    tvToTypeMap: {},
    realLastBarTime: {}, //k线最后一条数据的时间
    tickerBars: {}, //ticker数据生成的bar
    getBarTimer: 0,
    chartReadyTimer: null,
    positionTimer: null,
    arrowList: {},  // 执行状态列表
    supported_resolutions: [],
    posLines: {},
    buttonArr: [],
    subscribeBarsData: null,
    init(symbol, period, chartType = 1, cssTheme = 'primary', lang = 'zh', switchCallback) {
        var period = period = period || '5';

        this.subscribe = this.subscribe.bind(this);
        if (this.widget && this.symbol && this.period) {
            // this.widget.remove();
            if (this.symbol !== symbol || this.period !== period) {
                this.onChangeOptions(symbol, period);
                this.subscribe();
            }
            if (this.cssTheme !== cssTheme) {
                this.options = this.getOverrides(this.options, cssTheme);
                this.widget._options.custom_css_url = this.options.custom_css_url;
                this.widget._options.overrides = this.options.overrides;
                this.widget._options.toolbar_bg = this.options.toolbar_bg;
                this.widget._options.studies_overrides = this.options.studies_overrides;
                this.widget._options.skin_theme = cssTheme + "-theme";

                this.cssTheme = cssTheme;
            }
            this.widget._create();
            this.initChartReady(true);
            return;
        }
        //设置主域，正式环境跨域需用到
        // if (document.domain.indexOf(".") != -1) {
        //     var ddList = document.domain.split(".");
        //     var len = ddList.length;
        //     if (len > 2) document.domain = ddList[len - 2] + '.' + ddList[len - 1];
        //     else document.domain = ddList.join(".");
        // }

        this.chartType = chartType;
        this.symbol = symbol;
        this.period = period;
        this.isInitDraw = false;
        this.lang = lang;
        this.switchCallback = switchCallback;

        var time_frames = [];
        for (var key in this.periodToTV) {
            var ptt = this.periodToTV[key];
            time_frames.push({ text: ptt.text, resolution: ptt.value });
            this.tvToTypeMap[ptt.value] = key;
            this.supported_resolutions.push(ptt.value);

            // this.periodMsecMap[key] = this.periodToMSec(key);
        }
        //this.widget.chart().removeAllStudies();
        this.dataFeed = new Datafeeds.UDFCompatibleDatafeed(this);
        //https://www.tradingview.com/standard-theme/?themeName=Dark
        var options = {
            autosize: true,
            symbol: this.symbol,
            interval: this.periodToTV[this.period].value,
            container_id: "tv_chart_container",
            datafeed: this.dataFeed,
            library_path: process.env.PUBLIC_URL + "/charting_library/",
            drawings_access: { type: 'black', tools: [{ name: "Regression Trend" }] },
            disabled_features: ["header_resolutions", "header_symbol_search", "symbol_info", "link_to_tradingview", "header_compare", "header_screenshot", "use_localstorage_for_settings", "save_chart_properties_to_local_storage", "header_chart_type", "display_market_status", "symbol_search_hot_key", "compare_symbol", "border_around_the_chart", "remove_library_container_border", "symbol_info", "header_interval_dialog_button", "show_interval_dialog_on_key_press", 'timeframes_toolbar', "volume_force_overlay"],
            enabled_features: ["dont_show_boolean_study_arguments", "hide_last_na_study_output"],
            numeric_formatting: { decimal_sign: "." },
            timezone: "Asia/Shanghai",
            locale: lang, //en
            //toolbar_bg: "#262d33",
            custom_css_url: "bundles/skin-theme.css",
            auto_save_delay: true,
            create_volume_indicator_by_default: true,
            //preset: "mobile",
            time_frames: time_frames,
            overrides: {
                "volumePaneSize": "medium",     // 支持的值: large, medium, small, tiny
                "paneProperties.rightMargin": 10, "timeScale.rightOffset": 10,
                "paneProperties.background": "#262626",
                "paneProperties.vertGridProperties.color": "#3C3C3C",
                "paneProperties.horzGridProperties.color": "#3C3C3C",
                "paneProperties.crossHairProperties.color": "#626c73",
                "scalesProperties.backgroundColor": "#262626",
                "scalesProperties.lineColor": "#555",
                "scalesProperties.textColor": "#999",
                "symbolWatermarkProperties.color": "rgba(0, 0, 0, 0)",
                "mainSeriesProperties.style": 1,
                "mainSeriesProperties.candleStyle.upColor": "#206C46",
                "mainSeriesProperties.candleStyle.borderUpColor": "#206C46",
                "mainSeriesProperties.candleStyle.wickUpColor": "#206C46",
                "mainSeriesProperties.candleStyle.downColor": "#993E32",
                "mainSeriesProperties.candleStyle.borderDownColor": "#993E32",
                "mainSeriesProperties.candleStyle.wickDownColor": "#993E32",
                "mainSeriesProperties.candleStyle.drawWick": true,
                "mainSeriesProperties.candleStyle.drawBorder": true,
                "mainSeriesProperties.candleStyle.borderColor": "#C400CB",
                "study_Overlay@tv-basicstudies.barStyle.upColor": "blue",
                "study_Overlay@tv-basicstudies.barStyle.downColor": "blue",
                "study_Overlay@tv-basicstudies.lineStyle.color": "blue",
                "study_Overlay@tv-basicstudies.areaStyle.color1": "blue",
                "study_Overlay@tv-basicstudies.areaStyle.color2": "blue",
                "study_Overlay@tv-basicstudies.areaStyle.linecolor": "blue",
                "MA Cross@tv-basicstudies-1.lineStyle.linewidth": 4,
                "paneProperties.legendProperties.showLegend": false
            },
            studies_overrides: {
                "volume.volume.color.0": "#993E32",
                "volume.volume.color.1": "#206C46",
                "volume.volume.transparency": 100,
                'MA Cross.short:plot.color': '#993E32',
                'MA Cross.long:plot.color': '#993E32',
                'MA Cross.crosses:plot.color': '#f00',
                'MA Cross.crosses:plot.linewidth': 0,
                'MA Cross.short:plot.linewidth': 1,
                'MA Cross.long:plot.linewidth': 1
            },

            debug: "production" !== process.env.NODE_ENV,
            skin_theme: cssTheme + "-theme"
        };
        options = this.getOverrides(options, cssTheme);

        var widget = new window.TradingView.widget(options);
        this.widget = widget;
        this.cssTheme = cssTheme;
        this.options = options;

        this.initChartReady(true);

        if (isEmpty(this.dataCache)) {
            SockMgr.on(C_SOCKET_CMDS.chart, this.onUpdateData.bind(this));
            //SockMgr.on(C_SOCKET_CMDS.tick, this.onUpdateTick.bind(this));

            this.subscribe();
        }
    },
    subscribe() {
        SockMgr.reqChart(this.symbol, this.getSubscribePeriod(this.period));
    },
    createStudy() {
        // 展示指标
        this.widget.chart().createStudy('MA Cross', false, false, [10, 30]);

        if (this.studyMap['MACD']) {
            this.widget.chart().createStudy('MACD', false, false, [14, 30, "close", 9], null, { 'Histogram.color': 'rgb(253,0,102)', 'MACD.color': 'rgb(32,139,251)', 'Signal.color': 'rgb(252,96,30)' });
        }
    },
    //重新create需要reset
    initChartReady(isReset) {
        var self = this;
        if (isReset) {
            this.buttonArr = [{ value: 5, text: I18nFunc("Line"), key: 5, chartType: 3, save: true }];
            for (var key in this.periodToTV) {
                var ptt = this.periodToTV[key];
                this.buttonArr.push({ value: ptt.value, text: ptt.text, key: key, chartType: 1, save: true });
            }
        }
        if (this.chartReadyTimer) clearTimeout(this.chartReadyTimer);
        //if (Intl.getChartLang() === 'en') {
        //    this.buttonArr.map(v => v.text = v.text.replace('分钟', 'M').replace('小时', 'H').replace('日', 'D').replace('周', 'W'))
        //}
        this.chartReadyTimer = setTimeout(() => {
            this.widget.onChartReady(() => {
                if (!this.isBtnsInited()) {
                    this.widget.chart().setChartType(this.chartType);
                    // 创建技术指标
                    this.createStudy();


                    // 订阅时间周期
                    // this.widget.chart().onIntervalChanged().subscribe(null, interval => {
                    //     this.buttonArr.forEach((elm, i) => {
                    //         // const item = frames[0].frameElement.contentDocument.getElementById(elm.key)
                    //         // console.log(' >> interval:', interval)
                    //         if (String(elm.value) === String(interval) && (this.chartType==3 && i==0 || this.chartType!=3 && i!=0) && elm.target) {
                    //             elm.target.addClass('active')
                    //         } else if (elm.target) {
                    //             elm.target.removeClass('active')
                    //         }
                    //     })
                    // });

                    // 生成自定义按钮
                    this.buttonArr.forEach((v, i) => {
                        var btn = this.widget.createButton().on('click', e => {
                            this.handleClick(e, v.value, v.chartType);

                            this.buttonArr.forEach((nv) => {
                                if (nv.target != v.target) nv.target.removeClass('active');
                            });
                            v.target.addClass('active');
                        });
                        var cls = v.save ? "time-group-save" : "time-group-normal";
                        btn.html(v.text);
                        btn.attr("title", v.text).parent().addClass(cls);
                        if (v.key == this.period && v.chartType == this.chartType) {
                            btn.addClass('active');
                        }

                        v.target = btn
                    });
                }
            });
        }, 1000)
    },
    isReady() {
        return this.widget && this.widget._ready;
    },
    getSubscribePeriod(period) {
        var resolution = this.periodToTV[period].value;
        resolution = this.getSrcResolution(resolution);
        return this.tvToTypeMap[resolution];
    },
    getSrcResolution(resolution) {
        if (resolution == "D" || resolution.indexOf('D') != -1 || resolution.indexOf('W') != -1 || resolution.indexOf('M') != -1) {
            resolution = '1D';
        } else if (resolution < 1440 && resolution >= 60) {
            resolution = '60';
        } else if (resolution < 60 && resolution >= 5) {
            resolution = '5';
        } else if (resolution < 5 && resolution >= 1) {
            resolution = '1';
        }
        return resolution;
    },
    isBtnsInited() {
        return this.buttonArr[0] && this.buttonArr[0].target && this.buttonArr[0].target.length;
    },
    handleClick(e, value, chartType) {
        // $(e.target).addClass('active').closest('div.space-single').siblings('div.space-single').find('div.button').removeClass('active');
        var period = this.tvToTypeMap[value];
        if (period) {
            var oldRealPeriod = this.getSubscribePeriod(this.period);
            var newRealPeriod = this.getSubscribePeriod(period);

            if (this.chartType != chartType) {
                this.widget.chart().setChartType(chartType);
                this.chartType = chartType;
            }

            if (period != this.period) {
                this.period = period;
                this.widget.chart().setResolution(String(value));
            }

            if (oldRealPeriod != newRealPeriod) SockMgr.reqChart(this.symbol, newRealPeriod);

            this.onChangeOptions(this.symbol, period);
            if (this.switchCallback) this.switchCallback(this.symbol, period, chartType);
        }
    },

    getOverrides(options, cssTheme) {
        options.overrides["mainSeriesProperties.style"] = 1;
        options.volume_style = {};
        options.MA_Cross_style = {};

        if (cssTheme == 'primary') {
            //options.toolbar_bg = "#262d33";
            options.custom_css_url = 'bundles/skin-theme.css';
            options.overrides["paneProperties.background"] = "#101832";
            options.overrides["scalesProperties.backgroundColor"] = "#85a0ce";
            options.overrides["scalesProperties.textColor"] = "#445878";
            options.overrides["scalesProperties.lineColor"] = "#2e3d5a";

            options.overrides["paneProperties.vertGridProperties.color"] = "#151e38";
            options.overrides["paneProperties.horzGridProperties.color"] = "#151e38";

            //options.overrides["mainSeriesProperties.candleStyle.upColor"] = "#993E32";
            //options.overrides["mainSeriesProperties.candleStyle.borderUpColor"] = "#993E32";
            //options.overrides["mainSeriesProperties.candleStyle.wickUpColor"] = "#993E32";
            //
            //options.overrides["mainSeriesProperties.candleStyle.downColor"] = "#206C46";
            //options.overrides["mainSeriesProperties.candleStyle.borderDownColor"] = "#206C46";
            //options.overrides["mainSeriesProperties.candleStyle.wickDownColor"] = "#206C46";
            //
            //options.studies_overrides["volume.volume.color.0"] = "#206C46";
            //options.studies_overrides["volume.volume.color.1"] = "#993E32";

            //options.volume_style["volume.color.0"] = "#206C46";
            //options.volume_style["volume.color.1"] = "#db30d5";
            //options.volume_style["volume.transparency"] = 70;
            //options.MA_Cross_style["short:plot.color"] = "#103842";
            //options.MA_Cross_style["long:plot.color"] = "#3f2c64";
        } else if (cssTheme == "white") {
            //options.toolbar_bg = "#fff";
            options.custom_css_url = 'bundles/skin-theme.css';
            options.overrides["paneProperties.background"] = "#fff";
            options.overrides["scalesProperties.backgroundColor"] = "#fff";
            options.overrides["scalesProperties.textColor"] = "#cfd5de";
            options.overrides["scalesProperties.lineColor"] = "#cfd5de";

            options.overrides["paneProperties.vertGridProperties.color"] = "#EBEEF4";
            options.overrides["paneProperties.horzGridProperties.color"] = "#EBEEF4";

            //	Hollow Candles styles
            //options.overrides["mainSeriesProperties.candleStyle.upColor"] = "#993E32";
            //options.overrides["mainSeriesProperties.candleStyle.borderUpColor"] = "#993E32";
            //options.overrides["mainSeriesProperties.candleStyle.wickUpColor"] = "#993E32";
            //
            //options.overrides["mainSeriesProperties.candleStyle.downColor"] = "#206C46";
            //options.overrides["mainSeriesProperties.candleStyle.borderDownColor"] = "#206C46";
            //options.overrides["mainSeriesProperties.candleStyle.wickDownColor"] = "#206C46";

            //options.overrides["mainSeriesProperties.candleStyle.drawWick"] = true;
            //options.overrides["mainSeriesProperties.candleStyle.drawBorder"] = true;
            //options.overrides["mainSeriesProperties.candleStyle.borderColor"] = "#206C46";
            //options.overrides["mainSeriesProperties.candleStyle.wickColor"] = "#206C46";

            //options.studies_overrides["volume.volume.color.0"] = "#206C46";
            //options.studies_overrides["volume.volume.color.1"] = "#993E32";
            //options.studies_overrides["volume.volume.transparency"] = 100;
            //options.studies_overrides['MA Cross.short:plot.color'] = '#5c9ff5';
            //options.studies_overrides['MA Cross.long:plot.color'] = '#f103f2';

            //options.volume_style["volume.color.0"] = "#206C46";
            //options.volume_style["volume.color.1"] = "#db30d5";
            //options.volume_style["volume.transparency"] = 100;
            //options.MA_Cross_style["short:plot.color"] = "#103842";
            //options.MA_Cross_style["long:plot.color"] = "#3f2c64";
        }
        return options;
    },
    getBars(symbol, resolution, from, to, callback, loadTime) {
        // console.log(arguments);
        if (this.getBarTimer) {
            clearTimeout(this.getBarTimer);
            this.getBarTimer = 0;
        }

        // console.log("getBars:"+resolution);\
        var newResolution = this.getSrcResolution(resolution);

        var period = this.tvToTypeMap[newResolution];

        var data;
        var sbData = this.dataCache[symbol];
        if (sbData) data = sbData[period];
        var fromMs = from * 1000;
        var toMs = to * 1000;

        //console.log("getBars from "+fromMs+","+toMs+"; "+dayjs(fromMs).format("YYYY-MM-DD HH:mm:ss")+" to "+dayjs(toMs).format("YYYY-MM-DD HH:mm:ss"));

        if (data) {
            var newBars = [];
            // var newBars = [].concat(data);
            // var count = newBars.length;
            var count = 0;
            var l = data.length;
            for (var i = 0; i < l; i++) {
                var info = data[i];
                var barTime = info.time;
                if (barTime >= fromMs && barTime <= toMs) {
                    newBars.push(info);
                    count++;
                }
                // else if (barTime < fromMs) {
                //     break;
                // }
            }
            var lastBar = data[l - 1];
            if (lastBar && lastBar.time <= toMs) {
                //ws不主动推送，每隔一段时间重新获取
                SockMgr.reqChart(this.symbol, this.getSubscribePeriod(this.period), 2);
            }

            // console.log(JSON.stringify(newBars));
            if (count > 0) {
                newBars.sort(function (l, r) {
                    return l.time > r.time ? 1 : -1
                });
                if (callback) callback({ s: 'ok', bars: newBars });
            } else {
                if (callback) callback({ s: 'no_data' });
            }
        } else {
            var now = new Date().getTime();
            //3秒钟还没获取到数据的返回无数据
            if (loadTime && now - loadTime > 3000) {
                if (callback) callback({ s: 'no_data' });
                return;
            }
            // if (this.period != period || this.symbol != symbol) {
            //     if (this.mode) WsMgr.switchKlineStype(symbol, this.mode);
            //     WsMgr.subscribeKline(symbol, this.getSubscribePeriod(period));
            //
            //     this.onChangeOptions(symbol, period);
            //
            //     // if (this.switchCallback) this.switchCallback(symbol, period);
            // }
            var self = this;
            if (!this.getBarTimer) {
                this.getBarTimer = setTimeout(function () {
                    self.getBars(symbol, resolution, from, to, callback, loadTime || now);
                }, 10);
            }
        }
    },
    setLanguage(lang) {
        if (this.widget) {
            this.lang = lang;
            this.widget.setLanguage(lang);
            this.initChartReady(true);
        }
    },
    setTheme(cssTheme) {
        if (this.widget) {
            this.changeSkin(cssTheme);
        }
    },
    changeSkin(cssTheme) {
        let skinTheme = cssTheme + "-theme";
        this.options = this.getOverrides(this.options, cssTheme);

        var overrides = this.options.overrides;

        this.widget.setTheme(skinTheme);
        this.widget.applyOverrides(overrides);

        try {
            var tvHtml = window.frames[0].frameElement.contentDocument.getElementsByTagName('html');
            tvHtml[0].classList.remove(this.cssTheme + '-theme');
            tvHtml[0].classList.add(skinTheme);
        } catch (e) {
            console.log(e.message);
        }
        this.cssTheme = cssTheme;
    },
    setResolution(value) {
        if (this.widget) {
            this.widget.chart().setResolution(value);
        }
    },
    // parseTime(endTime) {
    //     var date = new Date();
    //     date.setFullYear(endTime.substring(0, 4));
    //     date.setMonth(endTime.substring(5, 7) - 1);
    //     date.setDate(endTime.substring(8, 10));
    //     date.setHours(endTime.substring(11, 13));
    //     date.setMinutes(endTime.substring(14, 16));
    //     date.setSeconds(endTime.substring(17, 19));
    //     return Date.parse(date);
    // },
    getTVConfig() {
        return { "supported_resolutions": this.supported_resolutions };
    },
    resolveTVSymbol(symbol) {
        var data = {
            "name": symbol,
            "exchange-traded": "",
            "exchange-listed": "",
            "timezone": "Asia/Shanghai",
            "minmov": 1,
            "minmov2": 0,
            "pointvalue": 1,
            "fractional": false,
            "session": "24x7",
            "has_intraday": true,
            "has_no_volume": false,
            "description": symbol,
            "pricescale": 1,
            "ticker": symbol,
            "supported_resolutions": this.supported_resolutions,
            "intraday_multipliers": ['1', '5', '60']
        };

        var info = Trade.getPairInfo(symbol)
        if (info) {
            data.currency_code = info.toCode;
            data.description = info.tradeCode;
            if (info.priceFixed) data.pricescale = Math.pow(10, info.priceFixed);
        }

        return data;
    },
    destroy() {
        try {
            if (this.getBarTimer) {
                clearTimeout(this.getBarTimer);
                this.getBarTimer = 0;
            }
            if (this.chartReadyTimer) {
                clearTimeout(this.chartReadyTimer);
                this.chartReadyTimer = null;
            }
            if (this.positionTimer) {
                clearTimeout(this.positionTimer);
                this.getBarTimer = null;
            }
            if (this.widget) {
                this.widget.remove();
                this.widget._ready = false;
            }
        } catch (e) {

        }
    },
    onChangeOptions(symbol, period) {
        this.symbol = symbol;
        this.period = period;

        this.widget._options.symbol = symbol;
        this.widget._options.interval = this.periodToTV[period].value;
    },
    switch(symbol, period) {
        if (!period) period = this.period;

        if (this.period != period || this.symbol != symbol) {
            SockMgr.reqChart(symbol, this.getSubscribePeriod(period));

            this.widget.setSymbol(symbol, this.periodToTV[period].value);
            this.onChangeOptions(symbol, period);
            this.initChartReady();

            if (this.switchCallback) this.switchCallback(symbol, period);

        }
    },
    //时间递增
    appendData(data, noParse) {
        var newData = data.data;

        //第一条k线
        var item = newData[0];
        if (!noParse) item = this.parseKlineDataItem(item);
        if (!item) return;

        var firstDt = item.date;

        if (!this.dataCache[data.symbol]) {
            this.dataCache[data.symbol] = {};
            this.realLastBarTime[data.symbol] = {};
            this.tickerBars[data.symbol] = {};
        }
        if (!this.dataCache[data.symbol][data.period]) {
            this.dataCache[data.symbol][data.period] = [];
            this.realLastBarTime[data.symbol][data.period] = 0;
            this.tickerBars[data.symbol][data.period] = {};
        }

        var cacheData = this.dataCache[data.symbol][data.period];
        var findIndex = -1;
        if (cacheData.length > 0) {
            //找出<=新数据时间的键
            var cacheIndex = cacheData.length - 1;
            while (cacheIndex >= 0) {
                var lastData = cacheData[cacheIndex];
                var cacheLastDt = lastData.date;

                if (cacheLastDt < firstDt) {
                    break;
                }
                if (cacheLastDt == firstDt) {
                    findIndex = cacheIndex;
                    break;
                }

                cacheIndex--;
            }
        }

        var newIndex = findIndex == -1 ? cacheData.length : findIndex;
        var lastTime = 0;
        var ind = -1;
        for (var i = 0, l = newData.length; i < l; i++) {
            var item = newData[i];
            if (!noParse) item = this.parseKlineDataItem(item);
            if (!item) continue;

            var time = item.time;
            //重复数据
            if (time == lastTime) {
                cacheData.pop();
            } else if (time < lastTime) {
                continue;
            } else {
                ind++;
            }
            //数据模型 time0 open1 close2 min3 max4 vol5 tag6 macd7 dif8 dea9
            // cacheData[newIndex+i] = [dt, Number(list[2]), Number(list[5]), Number(list[4]), Number(list[3]), Number(list[6])];
            cacheData[newIndex + ind] = item;

            lastTime = time;
        }
        if (!noParse && lastTime > 0) this.realLastBarTime[data.symbol][data.period] = lastTime;

        return cacheData;
    },
    parseKlineDataItem(info) {
        if (!info) return;
        //open,close,high,low,vol,时间戳
        var list = info;
        if (list.length < 6) return;

        var time = list[5] * 1000;
        var dt = dayjs(time).format("YYYY-MM-DD HH:mm:ss");

        return {
            date: dt,
            time: time,
            open: Number(list[0]),
            close: Number(list[1]),
            low: Number(list[3]),
            high: Number(list[2]),
            volume: Number(list[4])
        };
    },
    //生成最后一条假的k线
    // onUpdateTicker(data){
    //     // console.log(data);
    //     // {ASK BID CLOSE HIGH LAST LOW LastModify VOL}
    //     for (var symbol in data){
    //         if (!this.realLastBarTime[symbol]) continue;
    //
    //         var ticker = data[symbol];
    //         var stype = WsMgr.getKlineStype(symbol);
    //         var lastTime = ticker.LastModify;
    //
    //         for (var period in this.periodToTV){
    //             if (!this.realLastBarTime[symbol][period]) continue;
    //
    //             var msec = this.periodMsecMap[period];
    //             var tickBarTime = this.getTickBarTime(lastTime, this.realLastBarTime[symbol][period], msec);
    //             if (tickBarTime){
    //                 ["BID", "ASK", "LAST"].forEach((v, i)=>{
    //                     this.updateTickerBar(symbol, period, v, tickBarTime, ticker);
    //                 });
    //
    //                 var tickerBar = this.tickerBars[symbol][period][stype];
    //                 this.appendData([tickerBar], true);
    //             }
    //         }
    //     }
    // },
    // //同一个ticker生成不同stype的k线数据
    // updateTickerBar(symbol, period, stype, tickBarTime, ticker){
    //     var newPrice = Number(ticker[stype]);
    //     if (newPrice){
    //         var tickerBar = this.tickerBars[symbol][period][stype];
    //         if (tickerBar && tickerBar.time==tickBarTime){
    //             tickerBar.close = newPrice;
    //             tickerBar.low = Math.min(newPrice, tickerBar.low);
    //             tickerBar.high = Math.max(newPrice, tickerBar.high);
    //             tickerBar.volume = tickerBar.volume + ticker.VOL;
    //         }else{
    //             this.tickerBars[symbol][period][stype] = {
    //                 date:moment(tickBarTime).format("YYYY-MM-DD HH:mm:ss"),
    //                 time: tickBarTime,
    //                 open: newPrice,
    //                 close: newPrice,
    //                 low: newPrice,
    //                 high: newPrice,
    //                 volume: ticker.VOL
    //             };
    //         }
    //     }
    // },
    // //获取ticker对应period的barTime
    // getTickBarTime(tickTime, lastBarTime, msec){
    //     var tickBarTime = lastBarTime;
    //     //ticker的时间>=最后一条的时间
    //     while (tickTime>=lastBarTime+msec){
    //         if (tickBarTime <= tickTime && tickBarTime + msec>=tickTime){
    //             return tickBarTime;
    //         }
    //         tickBarTime = tickBarTime + msec;
    //     }
    // },
    // periodToMSec(period){
    //     // {'5MIN':"1", '3MIN':"3", '5MIN':"5", '15MIN':"15", '30MIN':"30", '1HOUR':"60", '2HOUR':"120",
    //         // '3HOUR':"180", '4HOUR':"240", '6HOUR':"360", '12HOUR':"720", '1DAY':"1D", "3DAY":"3D", "1WEEK":"1W", "2WEEK":"2W" }
    //     var interval = this.periodToTV[period];
    //     var p = interval.slice(-1);
    //     var m, n;
    //     if (p=="D"){
    //         m = Number(interval.slice(0, -1));
    //         n = 24*60*60*1000;
    //     }else if(p=="W"){
    //         m = Number(interval.slice(0, -1));
    //         n = 7*24*60*60*1000;
    //     }else{
    //         m = Number(interval);
    //         n = 60*1000;
    //     }
    //     return m*n;
    // },
    onUpdateData(srcData) {
        // console.log(' >> :', srcData)
        if (srcData.symbol != this.symbol || srcData.period != this.getSubscribePeriod(this.period)) return;
        if (srcData.data.length <= 0) return;

        this.appendData(srcData)
        // this.dataFeed.update()
    },
    //onUpdateTick(data){
    //console.log("tick", data);
    //},
    // 订阅K线数据
    // subscribeBars(srcData) {
    //     this.dataFeed.update()
    //     if (srcData.data[0]) {
    //         const bars = {};
    //         const newBars = srcData.data[0].replace(',', ' ').split(',');
    //         newBars.forEach((item, index) => {
    //             switch (index) {
    //                 case 0:
    //                     bars.time = new Date(item).getTime()
    //                     break;
    //                 case 1:
    //                     bars.open = Number(item)
    //                     break;
    //                 case 2:
    //                     bars.high = Number(item)
    //                     break;
    //                 case 3:
    //                     bars.low = Number(item)
    //                     break;
    //                 case 4:
    //                     bars.close = Number(item)
    //                     break;
    //                 case 5:
    //                     bars.volume = Number(item)
    //                     break;
    //             }
    //         })
    //         const lastBar = this.dataCache[this.symbol][this.period];
    //         const lastTime = lastBar && lastBar.length ? lastBar[lastBar.length - 1].time : Date.now();
    //         if (bars.time > lastTime) {
    //             this.subscribeBarsData = bars
    //         }

    //     }
    // },
    getServerTime() {
        return dayjs().unix();
    }
};
