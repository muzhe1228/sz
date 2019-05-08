import React, { Component } from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import I18n from 'components/i18n';
import SzInput from 'components/SzInput';
import HButton from 'components/HButton';
import { ForgotPassword, GoogleValidate } from 'components/Modals';
import './style.less';
import { browser } from 'src';
import { login, verifyGoogleCode, basicInfo } from 'js/http-req';
import { lStore } from 'js';
import LoginPic from 'images/login-pic.png';
import { message } from 'antd';
import { connect } from "react-redux";
import ENV from 'js/appConfig';
import * as actionsUser from 'store/action/userMsg';
import md5 from 'md5';

message.config({
  top: 50,
  duration: 3,
  maxCount: 1,
});

@autobind
class Login extends Component {
  static contextTypes = {
    clientType: PropTypes.string,
    geetestId: PropTypes.string,
    _geetest: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      loginName: '',
      password: '',
      loginNameError: false,
      passwordError: false,
      errorMsg: '请输入手机号或者邮箱',
      googleToken: '',
      isShowModalGoogle: false,
      googleCode: '',
      googleLoginName: '',
      captchaObj: {}
    };
  }

  componentDidMount() {
    this.context._geetest(this._geetestHandler);
    if (!lStore.get('token')) {
      const { dispatch } = this.props;
      dispatch(actionsUser.getUserMsg(null));
    }
  }

  handleUserInput(name, value) {
    this.setState({ [name]: value, loginNameError: false, passwordError: false });

  }

  _basicInfo() {
    basicInfo().then(res => {
      if (res.data.status == 200) {
        let data = res.data.data;
        const { dispatch } = this.props;
        dispatch(actionsUser.getUserMsg(data));
        lStore.set('userInfo', data);
      }
    })
  }

  _login() {
    this.context._geetest(this._geetestHandler);
    let self = this;
    const { loginName, password } = this.state;
    if (loginName.length === 0) {
      self.setState({
        errorMsg: '手机号或者邮箱不能为空',
        loginNameError: true
      });
      return;
    }
    if (
      loginName.match(/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/) ||
      loginName.match(/^\d*$/)
    ) {

    } else {
      self.setState({
        errorMsg: '请输入手机号或者邮箱号码',
        loginNameError: true
      });
      return;
    }
    if (password.length === 0) {
      self.setState({
        errorMsg: '密码不能为空',
        passwordError: true
      });
      return;
    }
    if (ENV.getENV().name == 'test2') {
      let req = {
        loginName: loginName,
        loginPwd: md5(password),
        geetestId: self.context.geetestId,
        clientType: self.context.clientType,
        geetest_challenge: 'geetest_challenge',
        geetest_validate: 'geetest_validate',
        geetest_seccode: 'rgeetest_seccode'
      }
      this.loginFun(req)
    } else {
      this.state.captchaObj.verify();
    }
  }

  _geetestHandler(captchaObj) {
    this.setState({
      captchaObj: captchaObj
    })
    let self = this;
    captchaObj.onSuccess(function () {
      const { loginName, password } = self.state;
      let result = captchaObj.getValidate();
      if (!result) {
        message.error('请完成验证');
      }
      let req = {
        loginName: loginName,
        loginPwd: md5(password),
        // loginPwd: password,
        geetestId: self.context.geetestId,
        clientType: self.context.clientType,
        geetest_challenge: result.geetest_challenge,
        geetest_validate: result.geetest_validate,
        geetest_seccode: result.geetest_seccode
      }
      self.loginFun(req)
    });
  }
  // 登录函数
  loginFun(req) {
    let self = this
    console.log(req)
    login(req).then(res => {
      console.log(res)
      if (res.data.status == 200) {
        if (res.data.data.googleToken) {
          self.setState({
            isShowModalGoogle: true,
            googleToken: res.data.data.googleToken,
            googleLoginName: res.data.data.loginName
          })
        } else {
          const data = res.data.data;
          lStore.set('token', data.token);
          self._basicInfo();
          message.success('登录成功！', 2);
          setTimeout(() => {
            browser.push('/');
          }, 0)
        }
      } else {
        message.error(res.data.message);
      }
    }).catch(res => {
      message.error(res.data.message);
    })
  }
  _closeGoogle() {
    this.setState({
      isShowModalGoogle: false
    })
  }

  changeGoogle(name, value) {
    this.setState({
      googleCode: value
    })
  }
  googleOnOk() {
    let seq = {
      loginName: this.state.googleLoginName,
      googleToken: this.state.googleToken,
      googleCode: this.state.googleCode
    }

    return verifyGoogleCode(seq).then(res => {
      if (res.data.status == 200) {
        const data = res.data.data;
        lStore.set('token', data.token);
        this._basicInfo();
        message.success('登录成功！', 2);
        setTimeout(() => {
          browser.push('/');
        }, 0)
        return true;
      }
    }).catch(err => {
      message.error(err.data.message);
      return false;
    })
  }

  render() {
    const { loginNameError, passwordError, loginName, password, errorMsg, isShowModalGoogle, googleToken } = this.state;
    return (
      <div className="container" style={{ backgroundColor: '#08112C' }}>
        <div className="login-container">
          <div className='login-form'>
            <h3><I18n message={'LogIn'} /></h3>
            <div className='posrela'>
              {loginNameError ? <span className='errorTip'>{errorMsg}</span> : ''}
              <label><I18n message={'Account'} /></label>
              <SzInput placeholder='请输入手机号或者邮箱号' name='loginName' value={loginName} onChange={this.handleUserInput} type='text' error={loginNameError} />
            </div>

            <div className='posrela'>
              {passwordError ? <span className='errorTip'>{errorMsg}</span> : ''}
              <label><I18n message={'Password'} /></label>
              <SzInput name='password' value={password} onChange={this.handleUserInput} type='password' error={passwordError} />
            </div>

            <HButton type="sell" text={<I18n message={'LogIn'} />} radius={true} onClick={this._login} />

            <ForgotPassword />
          </div>

          <div className='right-content'>
            <div><I18n message={'IsNotSzUserNow'} /></div>
            <div className='singRightNow'><I18n message={'singRightNow'} /></div>
            <Link to='/register'><HButton type="default" text={<I18n message={'SignUpFree'} />} radius={true} /></Link>
            <img src={LoginPic} />
          </div>
        </div>
        <GoogleValidate isShow={isShowModalGoogle} onClose={this._closeGoogle} changeGoogle={this.changeGoogle} onOk={this.googleOnOk} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    userMsg: state.userMsg.userMsg
  }
}

export default connect(mapStateToProps)(Login);
