// var ws = new WebSocket("wss://www.penaex.com//websocket-market");
import {success,error} from 'components/Message';
import {customEvent} from './index';
import pako from 'pako';
let send_connect_cmd = { cmd: 'ping' };
let lockReconnect = false;
class myWebSocket {
    constructor(server, opts) {
  		opts = opts || {};
  		this.heartCheck = { // 心跳检测
  			timeout: 20000, // 设置心跳超时时间
  			timeoutObj: null,
  			reset: () => {
  				clearTimeout(this.heartCheck.timeoutObj);
  				this.heartCheck.start();
  			},
  			start: () => {
  				console.log('心跳中...');
  				var self = this;
  				let _send_connect_cmd = this.userId ? Object.assign(send_connect_cmd, { userId: this.userId }) : send_connect_cmd;
  				this.heartCheck.timeoutObj = setTimeout(() => {
  					this.ws.send(JSON.stringify(_send_connect_cmd));
  				}, this.heartCheck.timeout)
  			}
  		};
      this.userId = null; // 是否携带userId
  		this.isBase_64 = true; // 是否返回信息为base64
  		this.server = server; // 所连接的服务地址
  		this.protocol = opts.protocol || '';
  		this.connectStatus = null; // 连接状态
      this.processMessage = null; // 信息返回的处理
      this.reconnectListener = []; // 组件内使用的重连连接监听
  		this._eventListeners = {}; // 订阅的回调
  		this._eventModuleNames = {}; // 模块组名称
  		this.callback = null;
      this.resData = null;
  		this._createSocket();
  	}
    _createSocket() {
  		try {
  		  if ('WebSocket' in window) {
  		  	this.ws = new WebSocket(this.server);
  		  	this._init();
  		  } else {
  		  	error('您的浏览器不支持websocket');
  		  }
  		} catch (e) {
  		  this.reconnect() // 断开重连
  		}
  	}
    connect() {
        this.ws = new WebSocket(this.server);
    }
    _init() {
  		let self = this;
  		console.log('初始化开始')
  		this.ws.onopen = function (evt) {
  			console.log('打开连接', evt)
  			this.connectStatus = evt;
  			self.heartCheck.start()
  		}

  		this.ws.onclose = function (evt) {
  			console.log('关闭连接', evt)
  			self.reconnect();
  		}

  		this.ws.onmessage = function (evt) {
  			// console.log('原始信息接收数据', evt)
  			self.heartCheck.reset();
  			self.onMessage(evt.data);
        console.log(self.resData)
  		}

  		this.ws.onerror = function (evt) {
  			console.log('错误信息', evt);
  			self.reconnect();
  		}
  	}
    reconnect () { // 重连机制
  	  if (lockReconnect) return;
  	  lockReconnect = true;
  	  setTimeout(() => {
  	  	this._createSocket();
  	  	this.executeReconnectListener();
  	  	lockReconnect = false;
  	  }, 2000)
  	}
    open() { // 打开websocket
  		this._clear();
  		this._createSocket();
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
  		var json = pako.inflate(new Uint8Array(b64), { to: 'string' });
  		var _response = decodeURIComponent(json);
  		var response_json = JSON.parse(_response)
  		return response_json;
  	}
    _processResponse(res) {// 接收到的信息不需做解码处理
  		let response_json = JSON.parse(res);
  		return response_json;
  	}
    getConnectStatus() {
  		return this.connectStatus;
  	}
    setCallback(cb) { // 设置回调-unused
  		if (typeof cb !== 'function') throw new Error('it’s not a callback function');
  		this.callback = cb;
  	}
    onMessage(res) {
      let data = this.isBase_64?this._processResponseBase64(res):this._processResponse(res);
      if (data.cmd!='pong') {
          this.resData = data;
      }else {
          console.log('239094sddsds')
      }
  	}
    sendData(data) { // 发送数据
  		let _timer = null;
  		let _sendCmdData = null; // 当没连接上的时候会暂存数据直到连接上并发送

  		if (this.ws && this.ws.readyState === 0) {
  			_sendCmdData = data;
  			_timer = setInterval(() => {
  				if (this.ws.readyState === WebSocket.OPEN) {
  					try {
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
    				this.ws.send(data);
    			} catch (e) {
    				throw new Error(e);
    			}
		  }
	}
}

export default myWebSocket
