import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import LOGO from 'images/logo.png';
import * as actions from 'store/action/i18n';
import * as actionsUser from 'store/action/userMsg';
import { logOut } from 'js/http-req';
import I18n from 'components/i18n';
import HButton from 'components/HButton';
import { lStore } from 'js/index';
import { browser } from 'src';
import {Modal} from 'components/Modal';
import Sradio from 'components/Sradio';
import './style.less';

@autobind
class Header extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectLang: '1',
      dropDown: false,
      isShow: false,
      theme: lStore.get('theme')? lStore.get('theme') : '000'
    }
  }

  componentWillMount() {

  }

  componentDidMount() {
    if (lStore.get('langIndex')) {
      this.change('selectLang', lStore.get('langIndex'))
    }
  }

  change(name, value) {
    this.setState({ [name]: value });
    lStore.set('langIndex', value);
    const { dispatch } = this.props;
    switch (value) {
      case 1:
        dispatch(actions.getLang('zh'));
        lStore.set('lang', 'zh');
        break;
      case 2:
        dispatch(actions.getLang('en'));
        lStore.set('lang', 'en');
        break;
      default:
        dispatch(actions.getLang('zh'));
        lStore.set('lang', 'zh');
    }

  };
  //点击个人中心按钮
  toUserCenter() {
    browser.push('/user_center/user_index');
    this.setState({
      dropDown: false
    })
    lStore.set('userTab', 0)
  }


  loginOut() {
    logOut().then(res => {
      console.log(res.data.message);
    }).catch(err => {
      console.log(err.data.message);
    })
    lStore.remove('userInfo');
    lStore.remove('token');
    const { dispatch } = this.props;
    dispatch(actionsUser.getUserMsg(null));
    browser.push('/login');
  }

  _goWallet() {
    if (lStore.get('token')) {
      lStore.set('userTab', 1);
      browser.push('/user_center/asset_manage/my_wallet');
      lStore.set('userTab', 1)
    } else {
      browser.push('/login');
    }
  }

  _onClose() {
    this.setState({
      isShow: false,
      theme: lStore.get('theme') ? lStore.get('theme') : '000'
    })
  }

  _onShow() {
    this.setState({
      isShow: true
    })
  }

  _onchange(item) {
    this.setState({
      theme : item.value
    })
  }

  _ok() {
    if(lStore.get('theme') !== this.state.theme) {
      lStore.set('theme', this.state.theme);
      window.location.reload();
    }else{
      this._onClose();
    }
  }

  render() {
    const { selectLang, dropDown, isShow } = this.state;
    const { userMsg } = this.props;
    var pathname = window.location.pathname;
    return (
      <div className={"header " +  (pathname == '/' ? '' : 'addBakC')}>
        <div className="header-l">
          <h1><Link to="/"><img src={LOGO} alt="" /></Link></h1>
          <ul className="nav">
            <li><Link to="/trading"><I18n message={'TokenTrading'} /></Link></li>
            <li onClick={this._goWallet}><a >资产管理</a></li>
            <li><Link to="/mining"><I18n message={'Mining'} /></Link></li>
            <li><Link to="/numbernode"><I18n message={'sz_numbernode'} /></Link></li>
            {/* <I18n message={'Help'} /> */}
            <li><a target='_blank' href='https://szcom.zendesk.com/hc/zh-cn/sections/360001990371-%E5%85%AC%E5%91%8A'><I18n message={'Announcement'} /></a></li>
            <li><a target='_blink' href="http://support.sz.com"><I18n message={'Help'} /></a></li>
          </ul>
        </div>
        <ul className="header-r">
          {
            userMsg
              ?
              <li className="nick-name" ref={(val) => this.userList = val}>
                <div className='showOrNotMy'>
                  {/* <Button className='userName'>{userMsg ? userMsg.nickName : lStore.get('userInfo').nickName}</Button> */}
                  <HButton type="default" className='userName' text={userMsg ? userMsg.nickName : lStore.get('userInfo').nickName} />
                  <div className="user-operate">
                    <a onClick={this.toUserCenter}>个人中心</a>
                    <a onClick={this.loginOut}>退出登录</a>
                  </div>
                </div>
              </li>
              :
              <li><Link to="/login"><HButton type="default" size="home" text="登录" /></Link></li>
          }
          {
            userMsg
              ?
              ''
              :
              <li className="register"><Link to="/register"><HButton type="default" size="home" text="注册" /></Link></li>
          }
          <li style={{ marginRight: 30, fontSize: 14 }} className='appDownload'>
              <i className="iconfont icon-shezhi" style={{ marginRight: 5, fontSize: 14 }}></i>
              <span style={{ marginRight: 5 }} onClick={this._onShow}>设置</span>
          </li>
          <li style={{ marginRight: 30, fontSize: 14 }} className='appDownload'>
            <Link to='/app_download' style={{color: '#AFB9C8'}}>
              <i className="iconfont icon-app" style={{ marginRight: 5, fontSize: 14 }}></i>
              <span style={{ marginRight: 5 }}>App下载</span>
            </Link>
          </li>
          <li style={{ marginRight: 0, fontSize: 14 }} className="lang">
            <i className="iconfont icon-earth" style={{ marginRight: 5, fontSize: 14 }}></i>
            <p style={{ marginRight: 5 }} >简体中文</p>
            <i className="iconfont icon-numDown" style={{ fontSize: 14, verticalAlign: 'bottom' }}></i>
            <ul>
              <li>简体中文</li>
            </ul>
            {/* <Select
              name="selectLang"
              value={selectLang}
              onChange={this.change}
              placeholder='请输入选项'
              config={{
                options: [{
                  label: '简体中文',
                  value: 1
                }]
              }} */}
          </li>

        </ul>

        {
          isShow ?
            <Modal title='设置' okText='确认' next={0} onOk={this._ok} onClose={this._onClose} >
              <div style={{marginTop: 50, marginBottom: 50, marginLeft: 140}} class='modal-back'>
                <p>主题</p>
                <Sradio onChange={this._onchange} theme={this.state.theme}/>
              </div>
            </Modal>
            :
            ''
        }
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    isLoading: state.isLoading.isLoading,
    lang: state.lang.lang,
    userMsg: state.userMsg.userMsg
  }
}
export default connect(mapStateToProps)(Header);
