function idDom(id) {
    return document.getElementById(id);
};

//获取class类名的参数dom
function classDom(Class) {
    return document.getElementsByClassName(Class)[0];
};

//获取document里的所有div，返回的是个数组
function tagDom(dom) {
    return document.getElementsByTagName(dom);
};

//获取document里的第一个参数dom
function QSDom(dom) {
    return document.querySelector(dom);
};

//获取document里所有的参数dom，返回是个数组
function QSADom(dom) {
    return document.querySelectorAll(dom);
};

//创建一个dom
function createDom(dom) {
    return document.createElement(dom);
};

//创建一个文本
function createtxt(txt) {
    return document.createTextNode(txt)
}

//将obj1添加到obj中
function addDom(obj, obj1) {
    obj.appendChild(obj1);
};

//将参数obj节点添加到document的body里
function addBody(obj) {
    document.body.appendChild(obj);
};

//判断一个object是否为{}
function isEmpty(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
};

//去除字符串左侧空格
function lTrim(val) {
    return val.replace(/(^\s*)/g, "")
};

//去除字符串左右两边的空格
function trim(val) {
    return val.replace(/(^\s*)|(\s*$)/gm, "")
};

//去除字符串右侧空格
function rTrim(val) {
    return val.replace(/(\s*$)/g, "");
};

//判断是否为number类型
function isNumber(obj) {
    return typeof obj === 'number' && !isNaN(obj)
};

//判断数据类型的方法（对typeof的增强，7种常用类型的判断，返回小写字符串）
function dataType(obj) {
    if (obj === null) {
        return 'null';
    }
    if (obj !== obj) {
        return 'nan';
    }
    if (typeof Array.isArray === 'function') {
        if (Array.isArray(obj)) {	//浏览器支持则使用isArray()方法
            return 'array';
        }
    } else {  					//否则使用toString方法
        if (Object.prototype.toString.call(obj) === '[object Array]') {
            return 'array';
        }
    }
    return (typeof obj).toLowerCase();
};

//生成32位唯一字符串(大小写字母数字组合)
function soleString32() {
    var str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var timestamp = +new Date() + Math.floor(Math.random() * 10);
    var resultStr = '';

    for (var i = 0; i < 19; i++) {
        resultStr += str.charAt(Math.floor(Math.random() * str.length));
    }
    resultStr += timestamp;

    resultStr = resultStr.split('');
    resultStr.sort(function (a, b) {
        return Math.random() - 0.5;
    });
    resultStr = resultStr.join('');
    return resultStr;
};

//自定义事件的实现
var customEvent = {
    json: {},
    on: function (evName, fn) {
        if (dataType(this.json[evName]) != 'object') {
            this.json[evName] = {};
        }
        if (dataType(fn) == 'function') {
            fn.id = soleString32();
            this.json[evName][fn.id] = fn;
        }
        return this;
    },
    emit: function (evName, data) {
        var evFnArr = this.json[evName];

        if (dataType(evFnArr) == 'object') {
            for (var attr in this.json[evName]) {
                if (dataType(this.json[evName][attr]) == 'function') {
                    this.json[evName][attr](data);
                }
            }
        }
        return this;
    },
    remove: function (evName, fn) {
        var evFnArr = this.json[evName];

        if (dataType(evName) == 'string' && dataType(evFnArr) == 'object') {
            if (dataType(fn) == 'function') {
                if (fn.id) {
                    delete this.json[evName][fn.id];
                } else {
                    for (var attr in this.json[evName]) {
                        if (this.json[evName][attr] + '' === fn + '') {
                            delete this.json[evName][attr];
                            break;
                        }
                    }
                }
            } else {
                delete this.json[evName];
            }
        }
        return this;
    }
};

//获取url后面的参数
function getParmeter(name, search) {
    search = search || window.location.search;
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", 'i'); // 匹配目标参数
    let result = search.substr(1).match(reg); // 对querystring匹配目标参数
    if (result != null) {
        return decodeURIComponent(result[2]);
    } else {
        return null;
    }
};

// 冒泡排序
function bubbleSort(arr) {
    var low = 0;
    var high = arr.length - 1; //设置变量的初始值
    var tmp, j;
    while (low < high) {
        for (j = low; j < high; ++j) {         //正向冒泡,找到最大者
            if (arr[j] > arr[j + 1]) {
                tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;
            }
        }
        --high;  //修改high值, 前移一位
        for (j = high; j > low; --j) {          //反向冒泡,找到最小者
            if (arr[j] < arr[j - 1]) {
                tmp = arr[j]; arr[j] = arr[j - 1]; arr[j - 1] = tmp;
            }
        }
        ++low;  //修改low值,后移一位
    }
    return arr;
};

function descendingSort(arr) {
    arr.sort(function (x, y) {
        return y - x;
    });
    return arr;
};

//获取数组中最大值，es5写法
function getArrMax(arr) {
    return Math.max.apply(Math, arr)
};

//获取数组中最大值，es6写法
function getArrMaxVal(arr) {
    return Math.max(...arr);
};

// 去除数组中的重复项
function unique(arr) {
    var newArr = [];
    var l = arr.length;
    for (var i = 0; i < l; i++) {
        for (var j = i + 1; j < l; j++) {
            if (arr[i] === arr[j]) j = ++i;
        }
        newArr.push(arr[i]);
    }
    return newArr;
};

// 获取一个区间的随机整数
// @param n : 区间的最小值
// @param m : 区间的最大值
function rnd(n, m) {
    var random = Math.floor(Math.random() * (m - n + 1) + n);
    return random;
};


//ajax
//ajax({//示例
//  url:'',
//  type:'post',
//  data:'',
//  closeToForm:false,
//  dataType:'json',
//  headers:{},
//  xhr:function(xhr){
//      console.log(xhr);
//  },
//  progress:function(ev){
//      console.log(ev);
//  },
//  success:function(data){
//      console.log(data);
//  },
//  error:function(data){
//      console.log(data);
//  },
//});
function ajax(json) {
    var str = '';
    var attr = null;
    json.type = json.type.toLowerCase() || 'get';
    json.dataType = json.dataType.toLowerCase() || 'json';
    if (!json.closeToForm && json.data && dataType(json.data) == 'object') {
        for (var key0 in json.data) {
            str += key0 + '=' + json.data[key0] + '&';
        }
        json.data = str.substring(0, str.length - 1);
    }

    var xhr = null;

    try {
        xhr = new XMLHttpRequest();
    } catch (e) {
        xhr = new window.ActiveXObject('Microsoft.XMLHTTP');
    }

    if (json.xhr && dataType(json.xhr) == 'function') {
        xhr = json.xhr(xhr);
    }

    if (xhr.upload && json.progress && dataType(json.progress) == 'function') {
        bind(xhr.upload, 'progress', json.progress);
    }

    if (json.type == 'get' && json.data) {
        json.url += '?' + json.data;
    }

    xhr.open(json.type, json.url, true);
    if (json.type == 'get') {
        xhr.send();
    } else {
        if (!json.closeToForm) xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
        if (json.headers && dataType(json.headers) == 'object') {
            for (attr in json.headers) {
                xhr.setRequestHeader(attr, json.headers[attr]);
            }
        }
        xhr.send(json.data);
    }

    json.before && dataType(json.before) == 'function' && json.before(xhr);
    xhr.onreadystatechange = function () {
        var data = null;

        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                try {
                    switch (json.dataType) {
                        case 'text':
                            data = xhr.responseText;
                            break;
                        case 'json':
                            data = JSON.parse(xhr.responseText);
                            break;
                        case 'html':
                            var oDiv = document.createElement('div');

                            oDiv.setAttribute('dataType', 'html');
                            oDiv.innerHTML = xhr.responseText;
                            data = oDiv;
                            break;
                        case 'script':
                            var oScript = document.createElement('script');

                            oScript.setAttribute('dataType', 'script');
                            oScript.innerHTML = xhr.responseText;
                            document.body.appendChild(oScript);
                            data = oScript;
                            break;
                    }

                } catch (e) {
                    console.log(e);
                }
                json.after && dataType(json.after) == 'function' && json.after(xhr, data);
                json.success && dataType(json.success) == 'function' && json.success(data);
            } else {
                json.error && dataType(json.error) == 'function' && json.error(xhr.status);
            }
        }
    };
};
var cookie = {
    getCookie: function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
        }
        return "";
    },
    setCookie: function (cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
    },
    clearCookie: function (cname) {
        this.setCookie(cname, "", -1)
    }
};

//判断网络连接与断开
function isOnline(onlineCb, offlineCb) {
    let el = document.body;
    if (el.addEventListener) {
        window.addEventListener("online", function () {
            onlineCb();
        }, true);
        window.addEventListener("offline", function () {
            offlineCb();
        }, true);
    }
    else if (el.attachEvent) {
        window.attachEvent("ononline", function () {
            onlineCb();
        });
        window.attachEvent("onoffline", function () {
            offlineCb();
        });
    }
    else {
        window.ononline = function () {
            onlineCb();
        };
        window.onoffline = function () {
            offlineCb();
        };
    }
};


//localStorage和localSession封装
var Store = function () {
    this.name = 'Store';
};
Store.prototype = {
    init: function (options) {
        this.store = function () {
            return options.type;
        };
        return this;
    },
    set: function (key, value) {
        var type = dataType(value);

        switch (type) {
            case 'object':
            case 'array':
                this.store().setItem(key, JSON.stringify(value));
                break;
            // case 'array':
            //             this.store().setItem(key,'['+value+']');
            //             break;
            case 'function'://如果是函数先用eval()计算执行js代码
                this.store().setItem(key, value);
                break;
            default:
                this.store().setItem(key, value);
        }

    },
    get: function (key) {
        var value = this.store().getItem(key);

        try {
            value = JSON.parse(value);
        } catch (e) { }
        return value;
    },
    getAll: function () {
        var json = {};
        var value = '';

        for (var attr in this.store()) {
            try {
                value = JSON.parse(this.store()[attr]);
            } catch (e) { }
            json[attr] = value;
        }
        return json;
    },
    remove: function (key) {
        this.store().removeItem(key);
    },
    clear: function () {
        this.store().clear();
    },
};
var lStore = new Store().init({
    'type': window.localStorage,
});

var sStore = new Store().init({
    'type': window.sessionStorage,
});


//判断设备跳转不同地址
function goPage(moHref, pcHref) {
    var reg = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i;

    window.location.href = navigator.userAgent.match(reg) ? moHref : pcHref;
};

//根据设备宽度来写相对布局,
//最小1rem=100px(宽度为375px屏幕下),3.75rem=100%;
//根据375屏幕下换算来布局
//小于375屏幕根节点字体大小与375屏幕保持一致，注意宽度的溢出
function htmlFontSize() {
    function change() {
        var fontSize = document.documentElement.clientWidth / 3.75;

        if (fontSize < 100) fontSize = 100;
        if (fontSize > 208) fontSize = 208;
        document.getElementsByTagName('html')[0].style.fontSize = fontSize + 'px';
    };
    change();
    window.onresize = change;
};

//判断是否是手机浏览器
function isPhone() {
    var reg = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i;
    return window.navigator.userAgent.match(reg) ? true : false;
};

//判断是否是微信浏览器
function isWeixin() {
    var reg = /(micromessenger)/i;
    return window.navigator.userAgent.match(reg) ? true : false;
};

//绑定事件，可重复绑定('事件名称'必须加引号)
function bind(obj, evname, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(evname, fn, false);
    } else {
        obj.attachEvent('on' + evname, function () {
            fn.call(obj);
        });
    }
};

//取消绑定，可重复取消('事件名称'必须加引号)
function unbind(obj, evname, fn) {
    if (obj.removeEventListener) {
        obj.removeEventListener(evname, fn, false);
    } else {
        obj.detachEvent('on' + evname, fn);
    }
};

//获取字符串中的数组
function findNum(str) {
    let arr = [];
    let tmp = '';
    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) <= '9' && str.charAt(i) > 0) {
            tmp += str.charAt(i);
        } else {
            if (tmp) {
                arr.push(tmp);
                tmp = '';
            }
        }

    }
    if (tmp) {
        arr.push(tmp);
        tmp = '';
    }
    return arr;
};

//获取到document的位置
function getPos(obj, attr) {
    var value = 0;
    var iPos = 0;
    while (obj) {
        iPos = attr == 'left' ? obj.offsetLeft : iPos = obj.offsetTop;
        value += iPos;
        obj = obj.offsetParent;
    }
    return value;
};

//正常化日期
function normalDate(oDate) {
    var CurrentDate = oDate;
    var reg = /\-+/g;

    if (dataType(oDate) == 'string') {
        oDate = oDate.split('.')[0];//解决ie浏览器对yyyy-MM-dd HH:mm:ss.S格式的不兼容
        oDate = oDate.replace(reg, '/');//解决苹果浏览器对yyyy-MM-dd格式的不兼容性
    }

    CurrentDate = new Date(oDate);
    return CurrentDate;
};

//日期格式化函数
//oDate（时间戳或字符串日期都支持）
//fmt（格式匹配）
//月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
//年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
//例子：
//dateFormat0(new Date(),'yyyy-MM-dd hh:mm:ss.S') ==> 2006-07-02 08:09:04.423
//dateFormat0(new Date(),'yyyy-M-d h:m:s.S')      ==> 2006-7-2 8:9:4.18
function dateFormat0(mydate, ft) {
    var fmt = ft || 'yyyy/MM/dd hh:mm:ss';
    var oDate = normalDate(mydate);
    var date = {
        "M+": oDate.getMonth() + 1,                 //月份
        "d+": oDate.getDate(),                    //日
        "h+": oDate.getHours(),                   //小时
        "m+": oDate.getMinutes(),                 //分
        "s+": oDate.getSeconds(),                 //秒
        "q+": Math.floor((oDate.getMonth() + 3) / 3), //季度，+3为了好取整
        "S": oDate.getMilliseconds()              //毫秒
    };

    if (/(y+)/.test(fmt)) {//RegExp.$1(正则表达式的第一个匹配，一共有99个匹配)
        fmt = fmt.replace(RegExp.$1, (oDate.getFullYear() + '').substr(4 - RegExp.$1.length));
    }

    for (var attr in date) {
        if (new RegExp('(' + attr + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? date[attr] : ('00' + date[attr]).substring((date[attr] + '').length));
        }
    }

    return fmt;
};

//时间格式化(多长时间之前)
//oDate（时间戳或字符串日期都支持）
function dateFormat1(myDate) {
    var oDate = normalDate(myDate);

    if (+oDate >= +new Date()) {
        return '刚刚';
    }
    var lookTime = +new Date() - (+oDate);
    var seconds = Math.floor(lookTime / (1000));
    var minutes = Math.floor(lookTime / (1000 * 60));
    var hours = Math.floor(lookTime / (1000 * 60 * 60));
    var days = Math.floor(lookTime / (1000 * 60 * 60 * 24));
    var months = Math.floor(lookTime / (1000 * 60 * 60 * 24 * 30));
    var years = Math.floor(lookTime / (1000 * 60 * 60 * 24 * 30 * 12));

    if (seconds < 60) {
        lookTime = seconds + '秒前';
    } else if (minutes < 60) {
        lookTime = minutes + '分钟前';
    } else if (hours < 24) {
        lookTime = hours + '小时前';
    } else if (days < 30) {
        lookTime = days + '天前';
    } else if (months < 12) {
        lookTime = months + '个月前';
    } else {
        lookTime = years + '年前';
    }
    return lookTime;
};

//格式化数字 12=>12.00
function changeTwoDecimal_f(num) {
    var f_x = parseFloat(num);
    if (isNaN(f_x)) return;
    var f_x1 = Math.floor(num * 100) / 100;
    var s_x = f_x1.toString();
    var pos_decimal = s_x.indexOf('.');
    if (pos_decimal < 0) {
        pos_decimal = s_x.length;
        s_x += '.';
    }
    while (s_x.length <= pos_decimal + 2) {
        s_x += '0';
    }
    return s_x;
};

//金额格式化 12232323=>12,232,323.00
function getDecimal(val) {
    var oldValue = val;
    var value = +val;
    var arr = [];
    var len = 2;
    var zero = '';

    for (var i = 0; i < len; i++) {
        zero += '0';
    }

    if (dataType(value) == 'number') {
        value += '';
        value = value.split('.');
        value[0] = value[0].split('');
        value[1] = (value[1] || '') + zero;
        value[1] = value[1].substring(0, len);

        arr.unshift('.', value[1]);
        while (value[0].length > 3) {
            arr.unshift(',', value[0].splice(value[0].length - 3, 3).join(''));
        }

        arr = value[0].join('') + arr.join('');
    } else {
        arr = oldValue;
    }

    if (arr && arr.length) arr = arr.replace('-,', '-');
    return arr;
};

// 实现ajax请求
/*myAjax({
    url:json.url,
    type:json.type,
    data:json.data,
    closeToForm:json.closeToForm,
    dataType:json.dataType,
    headers:json.headers,
    before:function(xhr){
        //loading显示处理
        store.dispatch(action.getLoading(true));;
    },
    after:function(xhr){
        //loading隐藏处理
        store.dispatch(action.getLoading(false));;
    },
    success:function(data){
        //只要成功都会走
        //成功code已经失败code处理
        if(dataType(data)==="object"){
            json.success&&json.success(data);
            return;
        }
    },
    error:function(err){
        error(err+'网络异常');
        store.dispatch(action.getLoading(false));
    },
});*/
function myAjax(obj) {
    /*1.判断有没有传递参数，同时参数是否是一个对象*/
    var key = null;
    if (obj.data && dataType(obj.data) == 'object') {
        var str = '';
        for (var attr in obj.data) {
            str += attr + '=' + obj.data[attr] + '&';
            if (obj.url == '/v1/user/draw_address/') {
                str = obj.data[attr];
            }
        }
        if (obj.url == '/v1/user/draw_address/') {
            obj.data = str
        } else {
            obj.data = str.substring(0, str.length - 1);
        }
    }
    if (obj == null || typeof obj != "object") {
        return false;
    }
    /*2.获取请求类型,如果没有传递请求方式，那么默认为get*/
    var type = obj.type || 'post';
    /*3.获取请求的url  location.pathname:就是指当前请求发起的路径*/
    var url = obj.url || window.location.pathname;
    /*4.获取请求传递的参数*/
    var data = obj.data || {};
    /*5.获取请求传递的回调函数*/
    var success = obj.success || function () { };

    /*6:开始发起异步请求*/
    /*6.1:创建异步对象*/
    var xhr = new XMLHttpRequest();
    /*6.2:设置请求行,判断请求类型，以此决定是否需要拼接参数到url*/
    if (type == 'get') {
        if (!isEmpty(data)) {
            if (obj.url == '/v1/user/draw_address/') {
                url = url + data;
            } else {
                url = url + "?" + data;
            }
        } else {
            url = url;
        }
        /*重置参数，为post请求简化处理*/
        data = null;
    }
    xhr.open(type, url);
    /*6.2:设置请求头:判断请求方式，如果是post则进行设置*/
    xhr.setRequestHeader("Content-Type", "application/json");
    if (obj.headers && dataType(obj.headers) == 'object') {
        for (key in obj.headers) {
            xhr.setRequestHeader(key, obj.headers[key]);
        }
    }

    /*6.3:设置请求体,post请求则需要传递参数*/
    xhr.send(data);

    /*7.处理响应*/
    xhr.onreadystatechange = function () {
        /*8.判断响应是否成功*/
        if (xhr.readyState == 0) {
            obj.before && dataType(obj.before) == 'function' && obj.before(xhr);
        }
        /*客户端可用的响应结果*/
        var result = null;
        /*9.获取响应头Content-Type ---类型是字符串*/
        var grc = xhr.getResponseHeader("Content-Type");
        /*10.根据Content-Type类型来判断如何进行解析*/
        if (grc && grc.indexOf("json") != -1) {
            /*转换为js对象*/
            try {
                if (xhr.responseText) result = JSON.parse(xhr.responseText);
            } catch (error) {
                result = xhr.responseText
            }
        }
        else if (grc && grc.indexOf("xml") != -1) {
            result = xhr.responseXML;
        }
        else {
            result = xhr.responseText;
        }
        if (xhr.readyState === 4 && xhr.status === 200) {
            /*11.拿到数据，调用客户端传递过来的回调函数*/
            obj.after && dataType(obj.after) == 'function' && obj.after(xhr, data);
            success(result);
        }
        if (xhr.readyState === 4 && xhr.status !== 200) {
            console.log(xhr.status)
            var grc = xhr.getResponseHeader("Content-Type");
            obj.error && dataType(obj.error) == 'function' && obj.error(xhr.status, result);
        }
    }

};

//文本被卷走的高度
function getScrollTop() {
    var scrollTop = 0, bodyScrollTop = 0, documentScrollTop = 0;
    if (document.body) {
        bodyScrollTop = document.body.scrollTop;
    }
    if (document.documentElement) {
        documentScrollTop = document.documentElement.scrollTop;
    }
    scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
    return scrollTop;
};

//获取文档的总高度
function getScrollHeight() {
    var scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
    if (document.body) {
        bodyScrollHeight = document.body.scrollHeight;
    }
    if (document.documentElement) {
        documentScrollHeight = document.documentElement.scrollHeight;
    }
    scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
    return scrollHeight;
};

//获取文本可见高度
function getWindowHeight() {
    var windowHeight = 0;
    if (document.compatMode == "CSS1Compat") {
        windowHeight = document.documentElement.clientHeight;
    } else {
        windowHeight = document.body.clientHeight;
    }
    return windowHeight;
};

//滚动条到达底部
function getBottom(cb) {
    window.onscroll = function () {
        if (getScrollTop() + getWindowHeight() == getScrollHeight()) {
            cb();
        }
    };
};

function goTop() {
    var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
    if (currentScroll > 0) {
        window.requestAnimationFrame(goTop);
        window.scrollTo(0, currentScroll - (currentScroll / 5));
    }
};

//文字横向滚动
/*<div id="scroll_div" className="fl">
    <ul id="scroll_begin" className='list'>
        <li>恭喜793765***获得 <span className="pad_right">50元巨人点卡奖励</span></li>
        <li>恭喜793765***获得 <span className="pad_right">50元巨人点卡奖励</span></li>
        <li>恭喜793765***获得 <span className="pad_right">50元巨人点卡奖励</span></li>
        <li>恭喜793765***获得 <span className="pad_right">50元巨人点卡奖励</span></li>
    </ul>
    <div id="scroll_end"></div>
</div>*/
function ScrollTextLeft(scroll_begin, scroll_end, scroll_div) {
    var speed = 60;
    var MyMar = null;
    scroll_end.innerHTML = scroll_begin.innerHTML;
    function Marquee() {
        if (scroll_end.offsetWidth - scroll_div.scrollLeft <= 0) {
            scroll_div.scrollLeft -= scroll_begin.offsetWidth;
            // scroll_div.scrollLeft = 0;
        }
        else
            scroll_div.scrollLeft++;
    }
    MyMar = setInterval(Marquee, speed);
    scroll_div.onmouseover = function () {
        clearInterval(MyMar);
    }
    scroll_div.onmouseout = function () {
        MyMar = setInterval(Marquee, speed);
    }
};

//文字竖向滚动
/*<div className="roll" id="roll">
    <ul id='begin'>
        <li>第一个结构</li>
        <li>第二个结构</li>
        <li>第三个结构</li>
        <li>第四个结构</li>
        <li>第五个结构</li>
        <li>第六个结构</li>
        <li>第七个结构</li>
        <li>第八个结构</li>
    </ul>
    <div id="end"></div>
</div>*/
function ScrollTextTop(scroll_begin, scroll_end, scroll_div) {
    var speed = 50;
    var MyMar = null;
    scroll_end.innerHTML = scroll_begin.innerHTML;
    function Marquee() {
        if (scroll_end.offsetHeight - scroll_div.scrollTop <= 0) {
            scroll_div.scrollTop -= scroll_begin.offsetHeight;
            // scroll_div.scrollLeft = 0;
        }
        else
            scroll_div.scrollTop++;
    }
    MyMar = setInterval(Marquee, speed);
    scroll_div.onmouseover = function () {
        clearInterval(MyMar);
    }
    scroll_div.onmouseout = function () {
        MyMar = setInterval(Marquee, speed);
    }
};

//随机改变数组里元素的顺序
function arrRandom(arr) {
    const len = arr.length
    for (let i = 0; i < len; ++i) {
        const x = Math.floor(Math.random() * len)
        const y = Math.floor(Math.random() * len)
        const temp = arr[x]
        arr[x] = arr[y]
        arr[y] = temp
    }
    return arr
};
//科学技术法转化
function scientificToNumber(num) {
    if (!num) return num;
    let numStr = num.toString()
    if (numStr.toString().indexOf('e') < 0) {
        return num
    }
    return num.toFixed(18).replace(/\.0+$/, "").replace(/(\.\d+[1-9])0+$/, "$1")
};
export {
    idDom,
    classDom,
    tagDom,
    QSDom,
    QSADom,
    createDom,
    createtxt,
    addDom,
    addBody,
    isEmpty,
    lTrim,
    trim,
    rTrim,
    isNumber,
    customEvent,
    getParmeter,
    bubbleSort,
    descendingSort,
    getArrMax,
    getArrMaxVal,
    unique,
    rnd,
    ajax,
    cookie,
    isOnline,
    lStore,
    sStore,
    goPage,
    htmlFontSize,
    isPhone,
    isWeixin,
    bind,
    unbind,
    dataType,
    soleString32,
    findNum,
    getPos,
    normalDate,
    dateFormat0,
    dateFormat1,
    changeTwoDecimal_f,
    getDecimal,
    myAjax,
    getScrollTop,
    getScrollHeight,
    getWindowHeight,
    getBottom,
    goTop,
    ScrollTextLeft,
    ScrollTextTop,
    arrRandom,
    scientificToNumber
}
