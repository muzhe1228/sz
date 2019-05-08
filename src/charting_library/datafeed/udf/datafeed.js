
/*
	This class implements interaction with UDF-compatible datafeed.

	See UDF protocol reference at
	https://github.com/tradingview/charting_library/wiki/UDF
*/

// const jQuery = window.$;
var Datafeeds = {};

Datafeeds.UDFCompatibleDatafeed = function(mgr, updateFrequency) {
	this._mgr = mgr;
	this._configuration = undefined;

	this._barsPulseUpdater = new Datafeeds.DataPulseUpdater(this, updateFrequency || 10 * 1000);

	this._enableLogging = false;
	this._initializationFinished = false;
	this._callbacks = {};

	this._initialize();
};

Datafeeds.UDFCompatibleDatafeed.prototype.defaultConfiguration = function() {
	return {
		supports_search: false,
		supports_group_request: false,
		// supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M'],
		supported_resolutions: ['1', '5', '15', '30', '60', 'D'],
		supports_marks: true,
		supports_timescale_marks: true,
        supports_time: true,
        exchanges: [{
            value: "",
            name: "All Exchanges",
            desc: ""
        }],
        symbols_types: [{
            name: "All types",
            value: ""
        }]
	};
};

Datafeeds.UDFCompatibleDatafeed.prototype.getServerTime = function(callback) {
	if (this._configuration.supports_time) {
		var self = this;
		setTimeout(function () {
			callback(self._mgr.getServerTime());
        }, 10);
	}
};

Datafeeds.UDFCompatibleDatafeed.prototype.on = function(event, callback) {
	if (!this._callbacks.hasOwnProperty(event)) {
		this._callbacks[event] = [];
	}

	this._callbacks[event].push(callback);
	return this;
};

Datafeeds.UDFCompatibleDatafeed.prototype._fireEvent = function(event, argument) {
	if (this._callbacks.hasOwnProperty(event)) {
		var callbacksChain = this._callbacks[event];
		for (var i = 0; i < callbacksChain.length; ++i) {
			callbacksChain[i](argument);
		}

		this._callbacks[event] = [];
	}
};

Datafeeds.UDFCompatibleDatafeed.prototype.onInitialized = function() {
	this._initializationFinished = true;
	this._fireEvent('initialized');
};

Datafeeds.UDFCompatibleDatafeed.prototype._logMessage = function(message) {
	if (this._enableLogging) {
		var now = new Date();
		console.log(now.toLocaleTimeString() + '.' + now.getMilliseconds() + '> ' + message);
	}
};

Datafeeds.UDFCompatibleDatafeed.prototype._send = function(url, params) {
// 	var request = url;
// 	if (params) {
// 		for (var i = 0; i < Object.keys(params).length; ++i) {
// 			var key = Object.keys(params)[i];
// 			var value = encodeURIComponent(params[key]);
// 			request += (i === 0 ? '?' : '&') + key + '=' + value;
// 		}
// 	}
//
// 	this._logMessage('New request: ' + request);
//
// 	return jQuery.ajax({
// 		type: 'GET',
// 		url: request,
// 		contentType: 'text/plain'
// 	});
    console.log("_send");
};

Datafeeds.UDFCompatibleDatafeed.prototype._initialize = function() {
	var configurationData = this._mgr.getTVConfig();
	var defaultConfig = this.defaultConfiguration();
	if (configurationData){
		var conf = Object.assign({}, defaultConfig, configurationData);
        this._setupWithConfiguration(conf);
	}else{
		this._setupWithConfiguration(defaultConfig);
	}
};

Datafeeds.UDFCompatibleDatafeed.prototype.onReady = function(callback) {
	var that = this;
	if (this._configuration) {
		setTimeout(function() {
			callback(that._configuration);
		}, 0);
	} else {
		this.on('configuration_ready', function() {
			callback(that._configuration);
		});
	}
};

Datafeeds.UDFCompatibleDatafeed.prototype._setupWithConfiguration = function(configurationData) {
	this._configuration = configurationData;

	if (!configurationData.exchanges) {
		configurationData.exchanges = [];
	}

	//	@obsolete; remove in 1.5
	var supportedResolutions = configurationData.supported_resolutions || configurationData.supportedResolutions;
	configurationData.supported_resolutions = supportedResolutions;

	//	@obsolete; remove in 1.5
	var symbolsTypes = configurationData.symbols_types || configurationData.symbolsTypes;
	configurationData.symbols_types = symbolsTypes;

	// if (!configurationData.supports_search && !configurationData.supports_group_request) {
	// 	throw new Error('Unsupported datafeed configuration. Must either support search, or support group request');
	// }

	if (!configurationData.supports_search) {
		this._symbolSearch = new Datafeeds.SymbolSearchComponent(this);
	}

	if (configurationData.supports_group_request) {
		//	this component will call onInitialized() by itself
		// this._symbolsStorage = new Datafeeds.SymbolsStorage(this);
	} else {
		this.onInitialized();
	}

	this._fireEvent('configuration_ready');
	this._logMessage('Initialized with ' + JSON.stringify(configurationData));
};

//	BEWARE: this function does not consider symbol's exchange
Datafeeds.UDFCompatibleDatafeed.prototype.resolveSymbol = function(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
	var that = this;

	if (!this._initializationFinished) {
		this.on('initialized', function() {
			that.resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback);
		});

		return;
	}

	var resolveRequestStartTime = Date.now();
	that._logMessage('Resolve requested');

	function onResultReady(data) {
		var postProcessedData = data;
		if (that.postProcessSymbolInfo) {
			postProcessedData = that.postProcessSymbolInfo(postProcessedData);
		}

		that._logMessage('Symbol resolved: ' + (Date.now() - resolveRequestStartTime));

		onSymbolResolvedCallback(postProcessedData);
	}

	if (!this._configuration.supports_group_request) {
		setTimeout(function () {
            var data = that._mgr.resolveTVSymbol(symbolName ? symbolName.toUpperCase() : '');
            if (data){
                onResultReady(data);
            }else{
                that._logMessage('Error resolving symbol: ' + symbolName);
                onResolveErrorCallback('unknown_symbol');
            }
        }, 10);
	}
};

Datafeeds.UDFCompatibleDatafeed.prototype.getBars = function(symbolInfo, resolution, rangeStartDate, rangeEndDate, onDataCallback, onErrorCallback) {
	//	timestamp sample: 1399939200
	if (rangeStartDate > 0 && (rangeStartDate + '').length > 10) {
		throw new Error(['Got a JS time instead of Unix one.', rangeStartDate, rangeEndDate]);
	}

	var onLoadedCallback = function (data) {
        if (data){
            var nodata = data.s === 'no_data';

            if (data.s !== 'ok' && !nodata) {
                if (!!onErrorCallback) {
                    onErrorCallback(data.s);
                }

                return;
            }

            var bars = data.bars||[];
            onDataCallback(bars, { noData: nodata, nextTime: data.nb || data.nextTime });
        }else{
            console.warn(['getBars(): error']);

            if (!!onErrorCallback) {
                onErrorCallback(' error: ');
            }
        }
    };

	this._mgr.getBars(symbolInfo.ticker.toUpperCase(), resolution, rangeStartDate, rangeEndDate, onLoadedCallback);
};

Datafeeds.UDFCompatibleDatafeed.prototype.subscribeBars = function(symbolInfo, resolution, onRealtimeCallback, listenerGUID, onResetCacheNeededCallback) {
	console.log("subscribeBars: "+symbolInfo+", "+ resolution + ", "+ listenerGUID);
	this._barsPulseUpdater.subscribeDataListener(symbolInfo, resolution, onRealtimeCallback, listenerGUID, onResetCacheNeededCallback);
};

Datafeeds.UDFCompatibleDatafeed.prototype.unsubscribeBars = function(listenerGUID) {
	this._barsPulseUpdater.unsubscribeDataListener(listenerGUID);
};

Datafeeds.UDFCompatibleDatafeed.prototype.calculateHistoryDepth = function(period, resolutionBack, intervalBack) {
};

/*
	It's a symbol search component for ExternalDatafeed. This component can do symbol search only.
	This component strongly depends on SymbolsDataStorage and cannot work without it. Maybe, it would be
	better to merge it to SymbolsDataStorage.
*/

Datafeeds.SymbolSearchComponent = function(datafeed) {
	this._datafeed = datafeed;
};

//	==================================================================================================================================================
//	==================================================================================================================================================
//	==================================================================================================================================================

/*
	This is a pulse updating components for ExternalDatafeed. They emulates realtime updates with periodic requests.
*/

Datafeeds.DataPulseUpdater = function(datafeed, updateFrequency) {
	this._datafeed = datafeed;
    this._datafeed._logMessage("DataPulseUpdater init "+updateFrequency);

	this._subscribers = {};

	this._requestsPending = 0;
	var that = this;

	var update = function() {
		if (that._requestsPending > 0) {
			return;
		}

		for (var listenerGUID in that._subscribers) {
			var subscriptionRecord = that._subscribers[listenerGUID];
			var resolution = subscriptionRecord.resolution;

			var datesRangeRight = that._datafeed._mgr.getServerTime();

			//	BEWARE: please note we really need 2 bars, not the only last one
			//	see the explanation below. `10` is the `large enough` value to work around holidays
			var datesRangeLeft = datesRangeRight - that.periodLengthSeconds(resolution, 10);

			that._requestsPending++;

			(function(_subscriptionRecord) { // eslint-disable-line
				that._datafeed.getBars(_subscriptionRecord.symbolInfo, resolution, datesRangeLeft, datesRangeRight, function(bars) {
					that._requestsPending--;

					//	means the subscription was cancelled while waiting for data
					if (!that._subscribers.hasOwnProperty(listenerGUID)) {
						return;
					}

					if (bars.length === 0) {
						return;
					}

					var lastBar = bars[bars.length - 1];
					if (!isNaN(_subscriptionRecord.lastBarTime) && lastBar.time < _subscriptionRecord.lastBarTime) {
						return;
					}

					var subscribers = _subscriptionRecord.listeners;

					//	BEWARE: this one isn't working when first update comes and this update makes a new bar. In this case
					//	_subscriptionRecord.lastBarTime = NaN
					var isNewBar = !isNaN(_subscriptionRecord.lastBarTime) && lastBar.time > _subscriptionRecord.lastBarTime;

					//	Pulse updating may miss some trades data (ie, if pulse period = 10 secods and new bar is started 5 seconds later after the last update, the
					//	old bar's last 5 seconds trades will be lost). Thus, at fist we should broadcast old bar updates when it's ready.
					if (isNewBar) {
						if (bars.length < 2) {
							throw new Error('Not enough bars in history for proper pulse update. Need at least 2.');
						}

						var previousBar = bars[bars.length - 2];
						for (var i = 0; i < subscribers.length; ++i) {
							subscribers[i](previousBar);
						}
					}

					_subscriptionRecord.lastBarTime = lastBar.time;

					for (var j = 0; j < subscribers.length; ++j) {
						subscribers[j](lastBar);
					}
				},

				//	on error
				function() {
					that._requestsPending--;
				});
			})(subscriptionRecord);
		}
	};

	if (typeof updateFrequency != 'undefined' && updateFrequency > 0) {
		setInterval(update, updateFrequency);
	}
};

Datafeeds.DataPulseUpdater.prototype.unsubscribeDataListener = function(listenerGUID) {
	this._datafeed._logMessage('Unsubscribing ' + listenerGUID);
	delete this._subscribers[listenerGUID];
};

Datafeeds.DataPulseUpdater.prototype.subscribeDataListener = function(symbolInfo, resolution, newDataCallback, listenerGUID) {
	this._datafeed._logMessage('Subscribing ' + listenerGUID);

	if (!this._subscribers.hasOwnProperty(listenerGUID)) {
		this._subscribers[listenerGUID] = {
			symbolInfo: symbolInfo,
			resolution: resolution,
			lastBarTime: NaN,
			listeners: []
		};
	}

	this._subscribers[listenerGUID].listeners.push(newDataCallback);
};

Datafeeds.DataPulseUpdater.prototype.periodLengthSeconds = function(resolution, requiredPeriodsCount) {
	var daysCount = 0;

	if (resolution === 'D') {
		daysCount = requiredPeriodsCount;
	} else if (resolution === 'M') {
		daysCount = 31 * requiredPeriodsCount;
	} else if (resolution === 'W') {
		daysCount = 7 * requiredPeriodsCount;
	} else {
		daysCount = requiredPeriodsCount * resolution / (24 * 60);
	}

	return daysCount * 24 * 60 * 60;
};

if (typeof module !== 'undefined' && module && module.exports) {
	module.exports = {
		UDFCompatibleDatafeed: Datafeeds.UDFCompatibleDatafeed,
	};
}
