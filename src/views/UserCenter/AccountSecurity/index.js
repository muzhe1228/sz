import React from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import * as actionsUser from 'store/action/userMsg';
import LinkText from 'components/LinkText';
import {ModifyPassword, BindPhone, GoogleValidate, BindEmail, ModifyMobile, SetTradePassword} from 'components/Modals';
import {basicInfo, openGoogleVerify, closeGoogleVerify} from 'js/http-req.js';
import {lStore} from 'js';
import { Switch, message } from 'antd';
import {browser} from 'src';
import './style.less';

@autobind
class AccountSecurity extends React.Component {
  static contextTypes = {
    _geetest: PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      email: '',
      mobile: '',
      isMobileBind: false,
      isEmailBind: false,
      isGoogleBind: false,
      isOpenGoogle: false,
      isTradePwd : false,
      isShowModalPassword: false,
      isShowModalGoogle: false,
      googleCode: '',
      isShowModalBindEmail: false,
      isShowModifyMobile: false,
      isShowBindPhone: false,
      isShowSetTrade: false,
    };
  }

  componentDidMount() {
    this._init();
  }

  _init() {
    basicInfo().then(res => {
      if(res.data.status == 200) {
        let data = res.data.data;
        const {dispatch} = this.props;
        dispatch(actionsUser.getUserMsg(data));
        lStore.set('userInfo', data);
        this.setState({
          userInfo: data,
          email: data.email,
          mobile: data.mobile,
          isMobileBind: data.isMobileBind,
          isEmailBind: data.isEmailBind,
          isGoogleBind: data.isGoogleBind,
          isOpenGoogle: data.isOpenGoogle,
          isTradePwd: data.isTradePwd
        })
      }
    })
  }

  _openGoogleVerify() {
    openGoogleVerify().then(res => {
      if (res.data.status === 200) {
        this.setState({ checked: true }, () => {
          this._getUserInfo();
          this.context.showMessageModalBox('谷歌验证开启成功', null, 'success');
        })
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      this.context.showMessageModalBox(_errMsg, null, 'error')
    })
  }

  _showModalPwd() {
    
    this.setState({
      isShowModalPassword: true
    })
  }

  _closePassword() {
    this.setState({
      isShowModalPassword: false
    })
  }

  _showModalBindEmail() {
    
    this.setState({
      isShowModalBindEmail: true
    })
  }

  _closeBindEmail() {
    this.setState({
      isShowModalBindEmail: false
    })
  }

  _bindEmailSuccess() {
    this._init();
  }

  googleOnOk () {
    let {googleCode} = this.state;
    let seq = {googleCode};
    return closeGoogleVerify(seq).then(res => {
      if (res.data.status === 200) {
        message.success('已成功关闭谷歌验证');
        this._init();
        return true;
      }
    }).catch(e => {
      if (e) {
        message.warning(e.data.message)
      }
    });
  }
  changeGoogle(name, value) {
    this.setState({
      googleCode: value
    })
  }
  _closeGoogle() {
    this.setState({
      isShowModalGoogle: false
    })
  }

  _showModalModifyMobile() {
    
    this.setState({
      isShowModifyMobile: true
    })
  }

  _closeModifyMobile() {
    this.setState({
      isShowModifyMobile: false
    })
  }

  _modifyMobileSuccess() {
    this._init();
  }

  _showModalBindPhone() {
    
    this.setState({
      isShowBindPhone: true
    })
  }

  _closeBindPhone() {
    this.setState({
      isShowBindPhone: false
    })
  }
  _bindPhoneSuccess() {
    this._init();
  }

  _handlerSetTrade() {
    if((this.state.userInfo.isGoogleBind && this.state.userInfo.isOpenGoogle) || this.state.userInfo.isMobileBind) {
      this._showModalSetTrade();
    }else{
      message.error('请先绑定手机或者谷歌验证')
      return false
    }
  }

  _showModalSetTrade() {
    
    this.setState({
      isShowSetTrade: true
    })
  }

  _closeSetTrade() {
    this.setState({
      isShowSetTrade: false
    })
  }
  _SetTradeSuccess() {
    this._init();
  }

  openOrCloseGoogle(checked) {
    if(checked){
      openGoogleVerify().then(res => {
        if (res.data.status === 200) {
          this._init();
          message.success('已成功打开谷歌验证');
        }
      }).catch(err => {
        let _errMsg = err.data.message;
        message.error(_errMsg);
      })
    }else{
      if(!this.state.userInfo.isMobileBind) {
        message.warning('请先绑定手机，才能关闭谷歌验证');
      }else{
        this.setState({
          isShowModalGoogle: true,
        })
      }
    }
  }

  _BindGoogle() {
    browser.push('/user_center/bind_google');
  }

  render() {
    let {
      userInfo,
      email, 
      mobile, 
      isMobileBind,
      isEmailBind,
      isGoogleBind,
      isOpenGoogle,
      isTradePwd,
      isShowModalPassword,
      isShowModalGoogle,
      isShowModalBindEmail,
      isShowModifyMobile,
      isShowBindPhone,
      isShowSetTrade,
    } = this.state;
    
    return (
      <div className="account-security" style={{backgroundColor: '#162345'}}>
        <h2 className='personalH2'>账号安全</h2>
        <div style={{padding: '0 0 0 40px'}}>
          <div className='sercurity-warning' style={{marginRight: 40}}>
            <i className='iconfont icon-no' style={{color: '#993E32', marginLeft: 10, marginRight: 5, fontSize: 12}}></i>
            <span>请不要透露短信和谷歌验证码给任何人，包括sz客服。</span>
          </div>
          <div className='data-list-one2'>
            <i className='iconfont icon-yes i-yes'></i>
            <span className='user-title'>登录密码：</span>
            <span className='fontSize12'>登录时使用</span>
            <LinkText className='linkTextpos' text='修改' onClick={this._showModalPwd}/>
          </div>
          <div className='data-list-one2'>
          {
            isMobileBind? <i className='iconfont icon-yes i-yes'></i> : <i className='iconfont icon-no i-no' ></i>
          }
            <span className='user-title'>绑定手机：</span>
            <span className='fontSize12'>提现、修改密码、及安全设置时用以收取验证码短信</span>
          {
            isMobileBind ? <LinkText className='linkTextpos' text='修改' onClick={this._showModalModifyMobile}/> : <LinkText className='linkTextpos' text='绑定' onClick={this._showModalBindPhone} />
          }
            <span className='user-conent-text'>{mobile}</span>
          </div>
          <div className='data-list-one2'>
          {
            isTradePwd? <i className='iconfont icon-yes i-yes'></i> : <i className='iconfont icon-no i-no' ></i>
          }
            <span className='user-title'>支付密码：</span>
            <span className='fontSize12'>交易、提现时使用(交易时输入资金密码)</span>
          {
            isTradePwd?<LinkText className='linkTextpos' text='修改' onClick={this._showModalSetTrade}/> : <LinkText className='linkTextpos' text='绑定' onClick={this._handlerSetTrade}/>
          }
            <span className='user-conent-text'></span>
          </div>
          <div className='data-list-one2'>
          {
            isGoogleBind?<i className='iconfont icon-yes i-yes'></i> : <i className='iconfont icon-no i-no' ></i>
          }
            <span className='user-title'>谷歌验证：</span>
            <span className='fontSize12'>提现、修改密码、及安全设置时用以输入谷歌验证码</span>
          {
            isGoogleBind ? 
            <div style={{float: 'right', marginRight: 40}}><Switch size='default' checked={isOpenGoogle}  onChange={this.openOrCloseGoogle}/></div> : 
            <LinkText className='linkTextpos' text='绑定' onClick={this._BindGoogle}/>
          }
          </div>
          <div className='data-list-one2'>
            {
              isEmailBind ? <i className='iconfont icon-yes i-yes'></i> : <i className='iconfont icon-no i-no' ></i>
            }
            <span className='user-title'>绑定邮箱：</span>
            <span className='fontSize12'>邮箱用于登录、提币及安全设置时使用，激活后不可修改</span>
            {
              isEmailBind ? <p className='linkTextpos'>已绑定</p> : <LinkText className='linkTextpos' text='绑定' onClick={this._showModalBindEmail}/>
            }
            <span className='user-conent-text'>{email}</span>
          </div>
        </div>

        <ModifyPassword isShow={isShowModalPassword} onClose={this._closePassword}  userInfo={userInfo}/>

        <GoogleValidate isShow={isShowModalGoogle} onClose={this._closeGoogle} changeGoogle={this.changeGoogle} onOk={this.googleOnOk} />

        <BindEmail isShow={isShowModalBindEmail} onClose={this._closeBindEmail} userInfo={userInfo} success={this._bindEmailSuccess} />

        <ModifyMobile isShow={isShowModifyMobile} onClose={this._closeModifyMobile} userInfo={userInfo} success={this._modifyMobileSuccess} />

        <BindPhone isShow={isShowBindPhone} onClose={this._closeBindPhone} userInfo={userInfo} success={this._bindPhoneSuccess}/>

        <SetTradePassword isShow={isShowSetTrade} onClose={this._closeSetTrade} userInfo={userInfo} success={this._SetTradeSuccess}/>
      </div>
    )
  }
}

export default connect()(AccountSecurity);
