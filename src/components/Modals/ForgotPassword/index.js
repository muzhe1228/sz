import React from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import I18n from 'components/i18n';
import {Modal} from 'components/Modal';
import LineInput from 'components/LineInput';
import TimeButton from 'components/TimeButton';
import XSteps from 'components/XSteps';
import { CountrySelect } from 'components/Select';
import { Tabs, TabsItem } from 'components/Tabs';
import validateUtils from 'js/validateUtils';
import { sendSmsMobile, sendSmsEmail, checkSmsMobile, checkSmsEmail, findPassword } from 'js/http-req';
import { message} from 'antd';
import md5 from 'md5';

import { browser } from 'src';

import Country from 'js/country.json';
import './style.less';

import modifySuccess from 'images/modifySuccess.png';


@autobind
export default class ForgotPassword extends React.Component {
    static contextTypes = {
      clientType: PropTypes.string,
      geetestId: PropTypes.string,
      _geetest: PropTypes.func
    };

  constructor(props) {
    super(props)
    this.state = {
      modalShow: false,
      tabIndex: 0,
      mobile: '', // 手机号
      areaCode: 86, // 手机区号
      mobileCode: '', // 手机验证码
      emailCode: '', // 邮箱验证码
      password: '', // 密码
      passwordConfirm: '', // 确认密码
      email: '',// 邮箱号
      countrys: [],
      canSendCellCode: false,
      canSendMailCode: false,
      captchaObj: {}
    }
  }

  componentDidMount() {
    let arr = Country.map((one) => {
      return { label: one.code + '(' + one.country + ')', value: one.code }
    })

    this.state.countrys = arr;

  }

  _geetestHandler(captchaObj) {
    this.setState({
      captchaObj: captchaObj
    })
    let self = this;

    captchaObj.onSuccess(function () {
      let { email, mobile, areaCode } = self.state;
      let result = captchaObj.getValidate();
      if (!result) {
        message.error('请完成验证');
        return false;
      }

      if (self.state.tabIndex == 0) {
        let req = {
          "areaCode": areaCode,
          "codeType": 3, // 2是注册
          "mobile": mobile,
          "geetestId": self.context.geetestId,
          "clientType": self.context.clientType,
          "geetest_challenge": result.geetest_challenge,
          "geetest_validate": result.geetest_validate,
          "geetest_seccode": result.geetest_seccode
        }
        sendSmsMobile(req).then((res) => {
          if (res.data.status == 200) {
            message.success('验证码发送成功！');
            self.timeP.start();
          }
        }).catch((res) => {
          message.error(res.data.message);
        })

      } else {
        let req = {
          "codeType": 3, // 2是注册
          "email": email,
          "type": 1,
          "geetestId": self.context.geetestId,
          "clientType": self.context.clientType,
          "geetest_challenge": result.geetest_challenge,
          "geetest_validate": result.geetest_validate,
          "geetest_seccode": result.geetest_seccode
        }
        sendSmsEmail(req).then((res) => {
          if (res.data.status == 200) {
            message.success('验证码发送成功！');
            self.timeM.start();
          }
        }).catch((res) => {
          message.error(res.data.message);
        })
      }
    });
  }

  handleUserInput(name, value) {
    this.setState({ [name]: value });
  }

  _init() { // 切换注册方式时初始化数据
    let { tabIndex } = this.state;
    if (tabIndex === 0) { // 根据注册类型不同初始化
      this.setState({
        email: '', // 邮箱号
        emailCode: ''
      })
    } else {
      this.setState({
        mobile: '', // 手机号
        areaCode: 86, // 手机区号
        mobileCode: '', // 手机验证码
      })
    }
  }

  _sendSmsMobile() {
    if (!this._checkMobile()) {
      message.error('手机号不能为空')
      return false;
    }
    this.context._geetest(this._geetestHandler);
    this.state.captchaObj.verify();
    return true;
  }

  _sendSmsEmail() {
    if (!this._checkEmail()) {
      message.error('邮箱号不能为空')
      return false;
    }
    if (!validateUtils.testEmail(this.state.email)) {
      message.error('请输入正确的邮箱号')
      return false;
    }
    this.context._geetest(this._geetestHandler);
    this.state.captchaObj.verify();
    return true;
  }

  _checkMobile() {
    let { mobile } = this.state;
    if (!mobile) return false;
    return true;
  }

  _checkEmail() {
    let { email } = this.state;
    if (!email) return false;
    return true;
  }

  switchTabs(index) { // 获取tabs切换id，控制视图显示
    this.setState({ tabIndex: index }, () => {
      this._init();
    });
  }

  _checkPassword() { // 检查密码
    let { password, passwordConfirm } = this.state;
    if (!password) {
      message.error('密码不能为空');
      return false;
    } else if (passwordConfirm !== password) {
      message.error('两次密码不一致');
      return false;
    } else {
      //验证密码格式
      if(validateUtils.testPassword(password)) {
        return true;
      }else{
        message.error('密码由8到20位字母和数字组成');
        return false;
      }
    }
  }

  _checkSmsMobile() {
    let self = this;
    let { areaCode, mobile, mobileCode } = this.state;
    let req = {
      areaCode: areaCode,
      codeType: 3, // 表示找回密码
      mobile: mobile,
      mobileCode: mobileCode,
    };

    return checkSmsMobile(req).then(res => {
      if (res.data.status === 200) {
        return true;
      }
    }).catch(err => {
      // console.log(err.data.message);
      let _errMsg = err.data.message;
      message.error(_errMsg);
      return false;
    })
  }

  _checkSmsEmail() {
    let { email, emailCode } = this.state;
    let req = {
      codeType: 3, // 表示注册
      email: email,
      emailCode: emailCode,
      type: 1
    };

    return checkSmsEmail(req).then(res => {
      if (res.data.status === 200) {
        return true;
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
      return false;
    })
  }
  

  _findPassword() { // 手机找回
    let { mobile, mobileCode, password, areaCode } = this.state;
    let req = {
      type: 0, // 手机
      codeType: 3, // 找回密码
      areaCode: areaCode,
      password: md5(password), // 登录密码
      mobile: mobile, // 手机号
      mobileCode: mobileCode, // 手机验证码
    };

    return findPassword(req).then(res => {
        if (res.data.status === 200) {
            return true;
        }
    }).catch(err => {
        let _errMsg = err.data.message;
        message.error(_errMsg);
        return false;
    })
  }

  _emailFind() { // 邮箱注册
    let { email, emailCode, password } = this.state;
    let req = {
      type: 1, // 邮箱
      codeType: 3, // 找回密码
      email: email,
      emailCode: emailCode,
      password: md5(password), // 登录密码
    };

    return findPassword(req).then(res => {
      if (res.data.status === 200) {
        return true;
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
      return false;
    })

  }

  ChooseAreaCode(name, value) {
    this.setState({
      areaCode: value
    })
  }

  async first(cb) {
    let { tabIndex } = this.state;

    if(tabIndex == 0) {
      let flag = false;
      if (!this._checkMobile()) {
        message.error('手机号不能为空')
        return false;
      }
      if (!this.state.mobileCode) {
        message.error('请输入验证码')
      } else {
        flag = await this._checkSmsMobile();
        flag ? cb(flag) : ''
      }
    }else{
      let flag = false;
      if (!this._checkEmail()) {
        message.error('邮箱号不能为空')
        return false;
      }
      if (!validateUtils.testEmail(this.state.email)) {
        message.error('请输入正确的邮箱号')
        return false;
      }
      flag = await this._checkSmsEmail();
      flag? cb(flag) : ''
    }
    
  }

  async second(cb) {
    let { tabIndex } = this.state;
    let flag = false;
    if(!this._checkPassword()){
      return 
    }
    if(tabIndex == 0) {
      flag = await this._findPassword();
      flag?cb(true): '';
    }else{
      flag = await this._emailFind();
      flag? cb(true): '';
    }

  }

  resetPwd() {
    this.context._geetest(this._geetestHandler);
    this.setState({modalShow: true});
  }

  onClose() {
    this.setState({
      modalShow: false,
      tabIndex: 0,
      mobile: '', // 手机号
      areaCode: 86, // 手机区号
      mobileCode: '', // 手机验证码
      emailCode: '', // 邮箱验证码
      password: '', // 密码
      passwordConfirm: '', // 确认密码
      email: '',// 邮箱号
      canSendCellCode: false,
      canSendMailCode: false,
    })
  }

  render() {
    let {areaCode} = this.state;
    const nav = [
      {
        label: '手机号码',
      },
      {
        label: '邮箱号码',
      }
    ]
    let div1 =
      <div className='reset-password-div reset-password-div1' key='div1'>
        <XSteps status={0} />
        <Tabs labels={nav} tabClick={this.switchTabs}>
          <TabsItem>
            <div style={{ padding: '0 125px' }}>
              <label style={{ fontSize: 12, color: '#374B69' }}>手机号码</label>
              <div style={{ display: 'flex', marginBottom: 31 }} className='forPhoneMargin'>
                <CountrySelect
                  name="areaCode"
                  value={areaCode}
                  onChange={this.ChooseAreaCode}
                  config={{
                    options: this.state.countrys
                  }}
                />
                <LineInput name='mobile' onChange={this.handleUserInput} validate='number'/>
              </div>
              <div style={{ display: 'flex', marginBottom: 50 }}>
                <LineInput name='mobileCode' placeholder='手机验证码' onChange={this.handleUserInput} validate='yzm'/>
                <TimeButton radius={true} className='restPwdPhoneCodeBtn' onClick={this._sendSmsMobile} ref={ele => this.timeP = ele}/>
              </div>
            </div>
          </TabsItem>
          <TabsItem>
            <div style={{ padding: '0 125px' }}>
              <div style={{ display: 'flex', marginBottom: 31 }}>
                <LineInput name='email' placeholder='邮箱号码' onChange={this.handleUserInput} />
              </div>
              <div style={{ display: 'flex', marginBottom: 50 }}>
                <LineInput name='emailCode' placeholder='邮箱验证码' onChange={this.handleUserInput}  validate='yzm'/>
                <TimeButton radius={true} className='restPwdEmailCodeBtn' onClick={this._sendSmsEmail} ref={ele => this.timeM = ele}/>
              </div>
            </div>
          </TabsItem>
        </Tabs>
      </div>

    let div2 =
      <div className='reset-password-div reset-password-div2'>
        <XSteps status={1} />
        <div style={{ padding: '0 125px' }}>
          <div style={{ display: 'flex', marginBottom: 31, paddingTop: 50 }}>
            <LineInput name='password' placeholder='新密码' type='password' onChange={this.handleUserInput} />
          </div>
          <div style={{ display: 'flex', marginBottom: 50 }}>
            <LineInput name='passwordConfirm' placeholder='确认密码' type='password' onChange={this.handleUserInput} />
          </div>
        </div>
      </div>

    let div3 =
      <div className='reset-password-div reset-password-div3'>
        <XSteps status={2} />
        <div style={{ padding: '0 125px', textAlign: 'center' }}>
          <img src={modifySuccess} alt="" style={{ width: 170, marginTop: 40, marginLeft: -20 }} />
          <p style={{ marginTop: 25, marginBottom: 43 }}>恭喜您～重置成功！</p>
        </div>
      </div>
    return (
      <div >
        {
          this.state.modalShow &&
          <Modal
            title='重置登录密码'
            children={[div3, div2, div1]}
            okText='去登录'
            onOk={(cb) => {
              let flag = false;
              flag = true;
              browser.push('/login');
              cb(flag)
            }}
            onClose={this.onClose}
            next={2}
            events={[this.second, this.first]}
            className='forgotPasswordM'
          />
        }
      <div className='linkA' onClick={this.resetPwd}><I18n message={'ForgotPassword'} />?</div>
      </div>
    )
  }
}
