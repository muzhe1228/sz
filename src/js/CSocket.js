let pako = require('pako');

const referenceTypes = {
    'array': true,
    'object': true
};

const type = data => Object.prototype.toString.call(data).slice(8, -1).toLowerCase();

// const CONNECT_CMD = JSON.stringify({cmd: 'ping'});
let send_connect_cmd = {cmd: 'ping'}; // 携带userId的情况
const SEPARATORSYMBOL = '_'; // 分发模式分隔符

export default class CSocket {
    constructor(server, opts) {
        opts = opts || {};
        this.heartCheck = { // 心跳检测
            timeout: 30000, // 设置心跳超时时间
            timeoutObj: null,
            onlineTime: 0,
            clearTimer: () => {
                clearInterval(this.heartCheck.timeoutObj);
                this.heartCheck.timeoutObj = null;
            },
            start: () => {
                if (this.heartCheck.timeoutObj) {
                    this.heartCheck.clearTimer();
                }

                this.heartCheck.timeoutObj = setInterval(() => {
                    if (new Date().getTime() - this.heartCheck.onlineTime > this.heartCheck.timeout*2){
                        this.reconnect();
                        return;
                    }
                    let _send_connect_cmd = this.userId ? Object.assign(send_connect_cmd, {userId: this.userId}) : send_connect_cmd;
                    this.ws.send(JSON.stringify(_send_connect_cmd));
                    console.log('心跳中...');
                }, this.heartCheck.timeout)
            },
            updateOnlineTime: ()=>{
                this.heartCheck.onlineTime = new Date().getTime();
            }
        };
        this.userId = null; // 是否携带userId
        this.isBase_64 = opts && opts.hasOwnProperty("isBase_64") ? opts.isBase_64 : true; // 是否返回信息为base64
        this.server = server; // 所连接的服务地址
        this.protocol = opts.protocol || '';
        this.connectStatus = null; // 连接状态
        this.processMessage = null; // 信息返回的处理
        this.reconnectListener = []; // 组件内使用的重连连接监听
        this._eventListeners = {}; // 订阅的回调
        this._eventModuleNames = {}; // 模块组名称
        this.callback = null;
        this.reconnectOkHandler = []; //重连成功后调用

        this.reconnectFlag = false;
        this.reconnTimer = 0;
        // this.lockReconnect = false;
        this.isQuit = false;

        // this.ws = new WebSocket(this.server);
        this._createSocket();
    }

    _init() {
        let self = this;
        // console.log('初始化开始')
        this.ws.onopen =  (evt) => {
            console.log('打开连接', evt)
            this.connectStatus = evt;
            self.heartCheck.start()

            //重连成功后重新订阅
            if (this.reconnectFlag){
                this.execReconnectOkListerer();
                this.reconnectFlag = false;
            }
        }

        this.ws.onclose = (evt) => {
            console.log('关闭连接', evt)
            if (!this.isQuit) self.reconnect();
        }

        this.ws.onmessage = (evt) => {
            // console.log('原始信息接收数据', evt)
            self.onMessage(evt.data);
        }

        this.ws.onerror = (evt) => {
            console.log('错误信息', evt);
            self.reconnect();
        }
    }

    setUserId(userId) {
        this.userId = userId;
    }

    open() { // 打开websocket
        this._clear();
        this._createSocket();
    }

    addReconnectOkListerer(cb){
        if (this.reconnectOkHandler.indexOf(cb)==-1) this.reconnectOkHandler.push(cb);
    }

    execReconnectOkListerer(){
        if (this.reconnectOkHandler.length){
            this.reconnectOkHandler.forEach(cb=>cb());
        }
    }

    executeReconnectListener(status) { // 重连监听
        if (this.reconnectListener.length) {
            this.reconnectListener.forEach(cb => {
                cb();
            });
        }
    }

    setReconnectListener(cb) {
        if (this.reconnectListener.indexOf(cb)==-1) this.reconnectListener.push(cb);
    }

    _createSocket() {
        try {
            if ('WebSocket' in window) {
                this.ws = new WebSocket(this.server);
                this._init();
            } else {
                console.log('您的浏览器不支持websocket');
            }
        } catch (e) {
            this.reconnect() // 断开重连
        }
    }

    reconnect() { // 重连机制
        if (this.reconnTimer) return;

        if (this.ws){
            if (this.ws.readyState==WebSocket.CONNECTING){
                return;
            }
            this.ws.close();
            this.ws = null;

            this.heartCheck.clearTimer();
        }
        this.reconnTimer = setTimeout(() => {
            this.reconnectFlag = true;
            this._createSocket();
            this.executeReconnectListener();
            this.reconnTimer = 0;
        }, 2000)
    }

    getSocketServerAddress() {
        return this.server;
    }

    _clear() { // 清除 websocket
        if (!this.ws) return void 0;
        this.ws.onopen = null;
        this.ws.onclose = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
    }

    _processResponseBase64(res) { // 接收到的信息需做解码处理
        var b64 = new Buffer(res, 'base64');
        var json = pako.inflate(new Uint8Array(b64), {to: 'string'});
        var _response = decodeURIComponent(json);
        var response_json = JSON.parse(_response)
        return response_json;
    }

    _processResponse(res) {
        let response_json = JSON.parse(res);
        return response_json;
    }

    on(eventName, callback) { // 普通模式-订阅模式
        if (Array.isArray(this._eventListeners[eventName])) {
            this._eventListeners[eventName].push(callback)
        } else {
            this._eventListeners[eventName] = [callback];
        }
    }

    getConnectStatus() {
        return this.connectStatus;
    }

    setCallback(cb) { // 设置回调-unused
        if (typeof cb !== 'function') throw new Error('it’s not a callback function');
        this.callback = cb;
    }

    setMessageType(isBase_64) {
        this.isBase_64 = isBase_64;
    }

    _setProcessMessageWay(callback, message) {
        this.processMessage = callback;
    }

    onModuleDistribute(eventName, moduleName, callback) { // 模块的分发机制
        // if (Array.isArray(this._eventModuleNames[eventName])) {
        //   if (Array.isArray(this._eventListeners[eventName + SEPARATORSYMBOL + moduleName])) {
        //     this._eventListeners[eventName + SEPARATORSYMBOL + moduleName].push(callback);
        //   } else {
        //     this._eventListeners[eventName + SEPARATORSYMBOL + moduleName] = [callback];
        //   }
        //   this._eventModuleNames[eventName].push(moduleName);
        // } else {
        //   this._eventListeners[eventName + SEPARATORSYMBOL + moduleName] = [callback];
        //   this._eventModuleNames[eventName] = [moduleName];
        // }

        if (Array.isArray(moduleName)) moduleName = moduleName[0];
        if (Array.isArray(this._eventListeners[eventName + SEPARATORSYMBOL + moduleName])) {
            this._eventListeners[eventName + SEPARATORSYMBOL + moduleName].push(callback)
        } else {
            this._eventListeners[eventName + SEPARATORSYMBOL + moduleName] = [callback];
        }
    }

    onMessage(msg) { // 区分普通模式和分发模式
        let _msg = this.processMessage ? this.processMessage(msg) : (this.isBase_64 ? this._processResponseBase64(msg) : this._processResponse(msg));
        let _symbols = '';
        this.heartCheck.updateOnlineTime();
        if (type(_msg) === 'object' && _msg.hasOwnProperty('symbols')) {
            ('symbols' in _msg) && (_symbols = _msg.symbols) // 耦合
        }
        ;
        if (type(_msg) === 'object' && _msg.hasOwnProperty('symbol')) {
            ('symbol' in _msg) && (_symbols = _msg.symbol) // 耦合
        }
        // console.log('呃呃呃呃呃呃呃', _msg.cmd)
        // console.log('呃呃呃呃呃呃呃x', this._eventListeners[_msg.cmd + SEPARATORSYMBOL + _symbols.join('_')])

        if (_symbols && !Array.isArray(_symbols)) {
            _symbols = [_symbols];
        }

        if (_symbols && this._eventListeners[_msg.cmd + SEPARATORSYMBOL + _symbols.join('_')]) { // 说明该订阅有模块分发-进入分发模式-耦合
            this._eventListeners[_msg.cmd + SEPARATORSYMBOL + _symbols.join('_')] && this._eventListeners[_msg.cmd + SEPARATORSYMBOL + _symbols.join('_')].map(cb => {
                cb(_msg);
            });
        } else { // 普通模式
            this._eventListeners[_msg.cmd] && this._eventListeners[_msg.cmd].map(cb => {
                cb(_msg)
            });
        }
    }

    sendData(data) { // 发送数据
        let _timer = null;
        let _sendCmdData = null; // 当没连接上的时候会暂存数据直到连接上并发送
        if (this.ws && this.ws.readyState === 0) {
            _sendCmdData = data;
            _timer = setInterval(() => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    try {
                        // console.log(_sendCmdData);
                        this.ws.send(_sendCmdData);
                        clearInterval(_timer);
                    } catch (e) {
                        throw new Error(e);
                    }
                }
            }, 300)
            // console.log('暂时没连接上', data)
        }
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                // console.log(data);
                this.ws.send(data);
            } catch (e) {
                throw new Error(e);
            }
        }
    }
    destroy(){
        this.isQuit = true;
        this.heartCheck.clearTimer();
        if (this.ws) this.ws.close();
        this._clear();
        if (this.reconnTimer){
            clearTimeout(this.reconnTimer);
            this.reconnTimer = 0;
        }
    }

}
