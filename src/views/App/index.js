import React, { Component } from 'react';
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';
import PropTypes from 'prop-types';
import Home from 'views/Home';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import * as loading from 'store/action/loading';
import Loading from 'components/Loading';
import { allTradeInfo, allCoins } from '../../store/action/tradeInfo';
import 'style/main.less';
import SocketMgr from "../../js/socket";
import messages_en_US from '../../i18n/en';
import messages_zh_CN from '../../i18n/zh';
import { getGeetest } from 'js/http-req.js';
import { soleString32 } from 'js';
import { autobind } from 'core-decorators';
import { lStore } from '../../js';

//极验
const initGeetest = window.initGeetest;

window.ScrollTop = function () {
    if (document.body.scrollTop !== 0) {
        document.body.scrollTop = 0;
    } else {
        document.documentElement.scrollTop = 0;
    }
}
@autobind
class App extends Component {
    static childContextTypes = {
        isLoading: PropTypes.bool,
        lang: PropTypes.string,
        tradeInfo: PropTypes.object,
        getLanguage: PropTypes.func,
        geetestId: PropTypes.string,
        clientType: PropTypes.string,
        _geetest: PropTypes.func
    };
    constructor(props, context) {
        super(props, context);

        this.isInitedTraded = false;

        this.state = {
            geetestId: '',
            clientType: 'web',
            timer: null
        }
    }
    componentWillMount() {
        console.log(this.props,'this.propsthis.props')
        sessionStorage.setItem('isFlag', false);
        this.initTradeInfo(this.props);

    }

    initTradeInfo(props) {

        if (!this.isInitedTraded) {
            const { location, dispatch } = props;

            //请求数据
            var pathname = location.pathname, _this = this;
            if (pathname == "/trading" || pathname == "/" || pathname == '/mining'|| pathname == "/user_center/asset_manage/my_wallet") {
                console.log('打开定时器')
                //请求数据
                SocketMgr.init();
                dispatch(allCoins());
                dispatch(allTradeInfo());
                this.isInitedTraded = true;
            }
            this.state.timer = setInterval(() => {
                if (pathname == "/trading" || pathname == "/" || pathname == "/user_center/asset_manage/my_wallet") {
                    console.log('打开定时器')
                    //请求数据
                    SocketMgr.init();
                    dispatch(allCoins());
                    dispatch(allTradeInfo());
                    _this.isInitedTraded = true;
                } else {
                    console.log('关闭定时器')
                    clearInterval(_this.state.timer)
                }
            }, 1000 * 60 * 15)


        }
    }
    componentWillReceiveProps(nextProps) {
        this.initTradeInfo(nextProps);

        //当路由切换时
        if (this.props.location !== nextProps.location) {
            window.scrollTo(0, 0)
            var flag = JSON.parse(sessionStorage.getItem('isFlag'));
            flag = !flag;
            const {dispatch} = this.props;
            dispatch(loading.getLoading(flag));
            sessionStorage.setItem('isFlag', flag);
        }
    }

    _geetest(cb) {
        let self = this;
        let geetestId = soleString32()
        let clientType = 'web'
        this.setState({
            geetestId: geetestId
        })
        let req = {
            geetestId: geetestId,
            clientType: clientType
        }
        return getGeetest(req).then(function (res) {
            initGeetest({
                // 以下 4 个配置参数为必须，不能缺少
                gt: res.data.gt,
                challenge: res.data.challenge,
                offline: !res.data.success, // 表示用户后台检测极验服务器是否宕机
                new_captcha: res.data.new_captcha ? res.new_captcha : '', // 用于宕机时表示是新验证码的宕机
                product: "bind", // 产品形式，包括：float，popup
                width: "300px"
                // 更多配置参数说明请参见：http://docs.geetest.com/install/client/web-front/
            }, cb);
            return true;
        })
    }

    getLanguage() { // 语言选择
        let messages_language;
        let { lang } = this.props;
        switch (lang) {
            case 'zh':
                messages_language = messages_zh_CN;
                break;
            case 'en':
                messages_language = messages_en_US;
                break;
            default:
                messages_language = messages_zh_CN;
        }
        return messages_language;
    }


    getChildContext() {
        const { isLoading, lang, tradeInfo } = this.props;
        return {
            isLoading,
            lang,
            tradeInfo,
            getLanguage: this.getLanguage.bind(this),
            geetestId: this.state.geetestId,
            clientType: this.state.clientType,
            _geetest: this._geetest.bind(this)
        };
    }
    render() {
        const { isLoading } = this.props;

        return (
            <div className="app" style={{ minWidth: '1200px' }}>
                <Switch>
                    <Route path="/" component={Home} />
                </Switch>
                {/* <Loading show={isLoading} /> */}
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    const { isLoading, lang, tradeInfo } = state;
    return {
        isLoading: isLoading.isLoading,
        lang: lang.lang,
        tradeInfo,
    }
};

export default connect(mapStateToProps)(App);
