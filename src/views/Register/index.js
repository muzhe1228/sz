import React, { Component } from 'react';
import { autobind } from 'core-decorators';
import I18n from 'components/i18n';
import SzInput from 'components/SzInput';
import HButton from 'components/HButton';
import { CountrySelect } from 'components/Select';
import TimeButton from 'components/TimeButton';
import { Tabs, TabsItem } from 'components/Tabs';
import { browser } from 'src';
import { soleString32 } from 'js';
import validateUtils from 'js/validateUtils';
import { getGeetest, sendSmsMobile, sendSmsEmail, register, checkSmsMobile, checkSmsEmail } from 'js/http-req';
import { message, Checkbox} from 'antd';
import RegState from 'components/RegState'
import md5 from 'md5';

import Country from 'js/country.json';

import './style.less';

import SignUpPic from 'images/signup-pic.png';

const initGeetest = window.initGeetest;

@autobind
export default class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tabIndex: 0,
      cellphoneNumber: '',
      smsCode: '',
      passwordByCell: '',
      passwordByMail: '',
      confirmpasswordCell: '',
      confirmpasswordMail: '',
      inviteCodeCell: '',
      inviteCodeMail: '',
      email: '',
      emailCode: '',
      selectCountry: 86,
      gt: '',
      challenge: '',
      geetestId: soleString32(),
      clientType: 'web',
      countrys: [],
      canSendCellCode: false,
      canSendMailCode: false,
      captchaObj: {},
      emailError: false,
      cellError: false,
      cellCodeError: false,
      emailCodeError: false,
      cellPasswordError: false,
      cellComPasswordError: false,
      emailPasswordError: false,
      emailComPasswordError: false,
      errorMsg: '',
      regIsShow:false,
      regChecked: true,
    };
  }

  componentWillMount() {
    let arr = Country.map((one) => {
      return { label: one.code + '(' + one.country + ')', value: one.code }
    })

    this.setState({
      countrys: arr
    })
    // this.state.countrys = arr;
  }

  componentDidMount() {
    this._geetest();
  }

  _geetest() {
    let self = this;

    let req = {
      geetestId: this.state.geetestId,
      clientType: this.state.clientType
    }
    getGeetest(req).then(function (res) {
      self.setState({ gt: res.data.gt, challenge: res.data.challenge });
      initGeetest({
        // 以下 4 个配置参数为必须，不能缺少
        gt: res.data.gt,
        challenge: res.data.challenge,
        offline: !res.data.success, // 表示用户后台检测极验服务器是否宕机
        new_captcha: res.data.new_captcha ? res.new_captcha : '', // 用于宕机时表示是新验证码的宕机

        product: "bind", // 产品形式，包括：float，popup
        width: "300px"

        // 更多配置参数说明请参见：http://docs.geetest.com/install/client/web-front/
      }, self._geetestHandler);
    })
  }

  _geetestHandler(captchaObj) {
    this.setState({ captchaObj: captchaObj });
    let self = this;

    captchaObj.onSuccess(function () {
      let { email, cellphoneNumber, selectCountry } = self.state;
      let result = captchaObj.getValidate();
      if (!result) {
        message.error('请先完成极验验证')
        return false;
      }

      if (self.state.tabIndex == 0) {
        let req = {
          "areaCode": selectCountry,
          "codeType": 2, // 2是注册
          "mobile": cellphoneNumber,
          "geetestId": self.state.geetestId,
          "clientType": self.state.clientType,
          "geetest_challenge": result.geetest_challenge,
          "geetest_validate": result.geetest_validate,
          "geetest_seccode": result.geetest_seccode
        }
        sendSmsMobile(req).then((res) => {
          if (res.data.status == 200) {
            message.success('验证码发送成功！')
            self.timeP.start();
          }
        }).catch((res) => {
          message.error(res.data.message)
        })

      } else {
        let req = {
          "areaCode": selectCountry,
          "codeType": 2, // 2是注册
          "email": email,
          "type": 1,
          "geetestId": self.state.geetestId,
          "clientType": self.state.clientType,
          "geetest_challenge": result.geetest_challenge,
          "geetest_validate": result.geetest_validate,
          "geetest_seccode": result.geetest_seccode
        }
        sendSmsEmail(req).then((res) => {
          if (res.data.status == 200) {
            message.success('验证码发送成功！')
            self.timeM.start();
          }
        }).catch((res) => {
          message.error(res.data.message)
        })
      }
    });
  }

  _sendSmsEmail() {
    if (!this._checkEmail()) {
      this.setState({
        errorMsg: '邮箱号不能为空',
        emailError: true
      });
      return false;
    }
    if (!validateUtils.testEmail(this.state.email)) {
      this.setState({
        errorMsg: '请输入正确的邮箱号',
        emailError: true
      });
      return false;
    }
    this._geetest();

    this.state.captchaObj.verify();
    return true;
  }
  _sendSmsMobile() {
    if (!this._checkMobile()) {
      this.setState({
        errorMsg: '手机号不能为空',
        cellError: true
      });
      return false;
    }
    this._geetest();

    this.state.captchaObj.verify();
    return true;
  }

  handleUserInput(name, value) {
    this.setState({
      [name]: value,
      emailError: false,
      cellError: false,
      cellCodeError: false,
      emailCodeError: false,
      cellPasswordError: false,
      cellComPasswordError: false,
      emailPasswordError: false,
      emailComPasswordError: false,
    });
  }

  _init() { // 切换注册方式时初始化数据
    let { tabIndex } = this.state;
    if (tabIndex === 0) { // 根据注册类型不同初始化
      this.setState({
        passwordByMail: '',
        confirmpasswordMail: '',
        inviteCodeMail: '',
        email: '',
        emailCode: '',
        emailError: false,
        emailCodeError: false,
        emailPasswordError: false,
        emailComPasswordError: false,
        errorMsg: ''
      })
    } else {
      this.setState({
        cellphoneNumber: '',
        smsCode: '',
        passwordByCell: '',
        confirmpasswordCell: '',
        inviteCodeCell: '',
        selectCountry: 86,
        cellError: false,
        cellCodeError: false,
        cellPasswordError: false,
        cellComPasswordError: false,
        errorMsg: ''
      })
    }
  }

  formSubmit(event) {
    event.preventDefault();
  }

  _submitHandle() {
    let { tabIndex } = this.state;
    if(tabIndex == 0){
      this.setState({canSignMobile: true});
      if (!this._checkMobile()) {
        this.setState({
          errorMsg: '手机号不能为空',
          cellError: true
        });
        return false;
      }

      if(!this.state.smsCode){
        this.setState({
          errorMsg: '请输入验证码',
          cellCodeError: true
        });
        return false;
      }
    }else{
      if (!this._checkEmail()) {
        this.setState({
          errorMsg: '邮箱号不能为空',
          emailError: true
        });
        return false;
      }
      if (!validateUtils.testEmail(this.state.email)) {
        this.setState({
          errorMsg: '请输入正确的邮箱号',
          emailError: true
        });
        return false;
      }
      if(!this.state.emailCode){
        this.setState({
          errorMsg: '请输入验证码',
          cellCodeError: true
        });
        return false;
      }
    }
    if(!this.state.regChecked) {
      message.warning('请阅读并同意用户协议')
      return false;
    }
    let _checkPassword = this._checkPassword();
    if (!_checkPassword) return false; // 密码通用验证
    if (tabIndex === 0) { // 短信验证只有手机注册时使用
      this._checkSmsMobile(); // 检查验证码
    } else {
      this._checkSmsEmail();
    }
  }

  _checkPassword() { // 检查密码
    let { tabIndex } = this.state;
    if (tabIndex === 0) {
      let { passwordByCell, confirmpasswordCell } = this.state;
      if (!passwordByCell) {
        this.setState({
          errorMsg: '密码不能为空',
          cellPasswordError: true
        });
        return false;
      } else if (confirmpasswordCell !== passwordByCell) {
        this.setState({
          errorMsg: '两次密码不一致',
          cellComPasswordError: true
        });
        return false;
      } else {
        if(validateUtils.testPassword(passwordByCell)) {
          return true;
        }else{
          this.setState({
            errorMsg: '密码由8到20位字母和数字组成',
            cellPasswordError: true
          });
          return false;
        }
      }
    } else {
      let { passwordByMail, confirmpasswordMail } = this.state;
      if (!passwordByMail) {
        this.setState({
          errorMsg: '密码不能为空',
          emailPasswordError: true
        });
        return false;
      } else if (confirmpasswordMail !== passwordByMail) {
        this.setState({
          errorMsg: '两次密码不一致',
          emailComPasswordError: true
        });
        return false;
      } else {
        if(validateUtils.testPassword(passwordByMail)) {
          return true;
        }else{
          this.setState({
            errorMsg: '密码由8到20位字母和数字组成',
            emailPasswordError: true
          });
          return false;
        }
      }
    }
  }

  _checkSmsMobile() {
    let self = this;
    let { selectCountry, cellphoneNumber, smsCode } = this.state;
    let req = {
      areaCode: selectCountry,
      codeType: 2, // 表示注册
      mobile: cellphoneNumber,
      mobileCode: smsCode,
    };

    checkSmsMobile(req).then(res => {
      if (res.data.status === 200) {
        self.signByPhone();
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
    })

  }
  _checkSmsEmail() {
    let self = this;
    let { email, emailCode } = this.state;
    let req = {
      codeType: 2, // 表示注册
      email: email,
      emailCode: emailCode,
      type: 1
    };

    checkSmsEmail(req).then(res => {
      if (res.data.status === 200) {
        self.signByEmail();
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
    })

  }

  signByPhone() {
    let { cellphoneNumber, smsCode, passwordByCell, selectCountry, inviteCodeCell } = this.state;
    let req = {
      type: 0, // 手机
      codeType: 2, // 注册
      areaCode: selectCountry,
      loginName: cellphoneNumber, // 手机号或邮箱
      loginPwd: md5(passwordByCell), // 登录密码
      mobile: cellphoneNumber, // 手机号
      mobileCode: smsCode, // 手机验证码
      userCode: inviteCodeCell
    };

    register(req).then(res => {
      this.setState({canSignMobile: true});
      if (res.data.status === 200) {
        message.success('注册成功');
        browser.push('/login');
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
    })
  }

  signByEmail() {
    let { email, emailCode, passwordByMail, inviteCodeMail } = this.state;
    let req = {
      type: 1, // 邮箱
      codeType: 2, // 注册
      email: email,
      emailCode: emailCode,
      loginName: email, // 手机号或邮箱
      loginPwd: md5(passwordByMail), // 登录密码
      userCode: inviteCodeMail
    };

    register(req).then(res => {
      if (res.data.status === 200) {
        message.success('注册成功');
        browser.push('/login');
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
    })
  }

  tab(index) {
    this.setState({ tabIndex: index }, () => {
      this._init();
    });
  }

  goLogin() {
    browser.push('/login');
  }

  ChooseFrontNumber(name, value) {
    this.setState({
      selectCountry: value
    })
  }

  _checkMobile() {
    let { cellphoneNumber } = this.state;
    if (!cellphoneNumber) return false;
    return true;
  }

  _checkEmail() {
    let { email } = this.state;
    if (!email) return false;
    return true;
  }

  showReg(){
    this.setState({
      regIsShow:true
    })
  }
  closeReg(){
    this.setState({
      regIsShow:false
    })
  }
  onChangeCheck(e) {
    this.setState({
      regChecked: e.target.checked
    })
  }

  render() {
    const nav = [
      {
        label: <I18n message={'MobileRis'} />,
      },
      {
        label: <I18n message={'EmailRis'} />,
      }
    ];
    let {
      selectCountry,
      emailError,
      cellError,
      cellCodeError,
      emailCodeError,
      cellPasswordError,
      cellComPasswordError,
      emailPasswordError,
      emailComPasswordError,
      errorMsg,
      regIsShow,
      regChecked,
    } = this.state;
    return (
      <div className="container">
        <div className="register-container">
          <form className='sign-form' onSubmit={this.formSubmit} autoComplete="off">
            <h3><I18n message={'SignUp'} /></h3>
            <Tabs labels={nav} tabClick={this.tab}>
              <TabsItem>

                <div className='posrela'>
                  {cellError ? <span className='errorTip'>{errorMsg}</span> : ''}
                  <label><I18n message={'Mobile'} /></label>
                  <div className='hasSelect'>
                    <CountrySelect
                      name="selectCountry"
                      value={selectCountry}
                      onChange={this.ChooseFrontNumber}
                      config={{
                        options: this.state.countrys
                      }}
                    />
                    <SzInput name='cellphoneNumber' value={this.state.cellphoneNumber} onChange={this.handleUserInput} type='text' error={cellError} validate='number'/>
                  </div>
                </div>

                <div className='posrela'>
                  {cellCodeError ? <span style={{ right: 125 }} className='errorTip'>{errorMsg}</span> : ''}
                  <label><I18n message={'Mobileverificationcode'} /></label>
                  <div className='hasBtn'>
                    <SzInput name='smsCode' value={this.state.smsCode} onChange={this.handleUserInput} type='text' error={cellCodeError} validate='yzm' />
                    <TimeButton text='获取验证码'  id='sendSmsMobile' key='sendSmsMobile' onClick={this._sendSmsMobile} ref={ele => this.timeP = ele}/>
                  </div>
                </div>

                <div className='posrela'>
                  {cellPasswordError ? <span className='errorTip'>{errorMsg}</span> : ''}
                  <label><I18n message={'LoginPassword'} /></label>
                  <SzInput name='passwordByCell' value={this.state.passwordByCell} onChange={this.handleUserInput} type='password' error={cellPasswordError}/>
                </div>
                
                <div className='posrela'>
                  {cellComPasswordError ? <span className='errorTip'>{errorMsg}</span> : ''}
                  <label><I18n message={'Confirmpassword'} /></label>
                  <SzInput name='confirmpasswordCell' value={this.state.confirmpasswordCell} onChange={this.handleUserInput} type='password' error={cellComPasswordError}/>
                </div>
                
                <label><I18n message={'InviteCode'} /></label>
                <SzInput name='inviteCodeCell' value={this.state.inviteCodeCell} onChange={this.handleUserInput} type='text' validate='iCode'/>
                <div style={{display: 'flex', marginBottom:10}}>
                  <Checkbox checked={regChecked} onChange={this.onChangeCheck}></Checkbox>
                  <p style={{marginTop: -3, marginLeft: 8}}> 我已阅读并同意<span style={{ color: '#993E32'}} className='regSpan' onClick={this.showReg}>《用户协议》</span></p>
                </div>
                <HButton type="sell" text={<I18n message={'SignUp'} />} radius={true} onClick={this._submitHandle} />
                <div style={{ display: 'flex', justifyContent: 'center ', marginTop: 24 }}>
                  <span>已有账号</span>
                  <span style={{ marginTop: 0, marginRight: 10 }}>?</span>
                  <span style={{ color: '#993E32', cursor: 'pointer' }} onClick={this.goLogin}> 立即登录</span>
                </div>
              </TabsItem>
              <TabsItem>
                <div className='posrela'>
                  {emailError ? <span className='errorTip'>{errorMsg}</span> : ''}
                  <label key='email'><I18n message={'Email'} /></label>
                  <SzInput name='email' value={this.state.email} onChange={this.handleUserInput} type='text' error={emailError} />
                </div>

                <div className='posrela'>
                  {emailCodeError ? <span style={{ right: 125 }} className='errorTip'>{errorMsg}</span> : ''}
                  <label key='emailCode'><I18n message={'Emailverificationcode'} /></label>
                  <div className='hasBtn'>
                    <SzInput name='emailCode' value={this.state.emailCode} onChange={this.handleUserInput} type='text' error={emailCodeError} validate='yzm'/>
                    <TimeButton text='获取验证码'  id='sendSmsEmail' key='sendSmsEmail' onClick={this._sendSmsEmail} ref={ele => this.timeM = ele}/>
                  </div>
                </div>

                <div className='posrela'>
                  {emailPasswordError ? <span className='errorTip'>{errorMsg}</span> : ''}
                  <label><I18n message={'LoginPassword'} /></label>
                  <SzInput name='passwordByMail' value={this.state.passwordByMail} onChange={this.handleUserInput} type='password' error={emailPasswordError} />
                </div>

                <div className='posrela'>
                  {emailComPasswordError ? <span className='errorTip'>{errorMsg}</span> : ''}
                  <label><I18n message={'Confirmpassword'} /></label>
                  <SzInput name='confirmpasswordMail' value={this.state.confirmpasswordMail} onChange={this.handleUserInput} type='password' error={emailComPasswordError} />
                </div>

                <label><I18n message={'InviteCode'} /></label>
                <SzInput name='inviteCodeMail' value={this.state.inviteCodeMail} onChange={this.handleUserInput} type='text' validate='iCode'/>
                <div style={{display: 'flex', marginBottom:10}}>
                  <Checkbox checked={regChecked} onChange={this.onChangeCheck}></Checkbox>
                  <p style={{marginTop: -3, marginLeft: 8}}> 我已阅读并同意<span style={{ color: '#993E32'}} className='regSpan' onClick={this.showReg}>《用户协议》</span></p>
                </div>
                <HButton type="sell" text={<I18n message={'SignUp'} />} radius={true} onClick={this._submitHandle} />
                <div style={{ display: 'flex', justifyContent: 'center ', marginTop: 24 }}>
                  <span>已有账号</span>
                  <span style={{ marginTop: 0, marginRight: 10 }}>?</span>
                  <span style={{ color: '#993E32', cursor: 'pointer' }} onClick={this.goLogin}> 立即登录</span>
                </div>
              </TabsItem>
            </Tabs>
          </form>

          <RegState onClick={this.closeReg} isShow={regIsShow}></RegState>

          <div className='right-content'>
            <h3>温馨提示</h3>
            <p>国籍信息注册后不可修改，请务必如实选择。</p>
            <p>验证邮件可能会被误判为垃圾邮件，请注意查收。</p>
            <p>请妥善保存您的SZ账号及登录密码。</p>
            <p>请勿和其他网站使用相同的登录密码。</p>
            <img src={SignUpPic} />
          </div>
        </div>
      </div>
    )
  }
}
