import React from 'react';
import { autobind } from 'core-decorators';
import SzInput from 'components/SzInput';
import HButton from 'components/HButton';
import TimeButton from 'components/TimeButton';
import { soleString32 } from 'js';
import { message} from 'antd';
import {browser} from 'src';

import {basicInfo, getGoogleDevice, getGeetest, sendSmsMobile, sendSmsEmail, bindGoogleDevice} from 'js/http-req.js';

import './style.less';

const initGeetest = window.initGeetest;

@autobind
export default class BindGoogle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      code: '', // 手机或邮箱验证码
      googleKey: '', // 谷歌key
      googleUrl: '', // 谷歌地址
      googleCode: '', //谷歌code
      gt: '',
      challenge: '',
      geetestId: soleString32(),
      clientType: 'web',
      captchaObj: {},
    };
  }

  componentDidMount() {
    this._geetest();
    this._init();
    this._getGoogleDevice(); // 获取谷歌地址生成二维码
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
    let {userInfo} = this.state;
    this.setState({ captchaObj: captchaObj });
    let self = this;

    captchaObj.onSuccess(function () {
      let result = captchaObj.getValidate();
      if (!result) {
        message.error('请完成验证')
        return false;
      }

      if (userInfo.isMobileBind) {
        let req = {
          "areaCode": userInfo.areaCode,
          "codeType": 4, // 谷歌验证
          "mobile": userInfo.mobile,
          "geetestId": self.state.geetestId,
          "clientType": self.state.clientType,
          "geetest_challenge": result.geetest_challenge,
          "geetest_validate": result.geetest_validate,
          "geetest_seccode": result.geetest_seccode
        }
        sendSmsMobile(req).then((res) => {
          if (res.data.status == 200) {
            message.success('手机验证码发送成功！');
            self.timeM.start();
          }
        }).catch((res) => {
          message.error(res.data.message)
        })

      } else {
        let req = {
          "codeType": 4, // 2是注册
          "email": userInfo.email,
          "type": 1,
          "geetestId": self.state.geetestId,
          "clientType": self.state.clientType,
          "geetest_challenge": result.geetest_challenge,
          "geetest_validate": result.geetest_validate,
          "geetest_seccode": result.geetest_seccode
        }
        sendSmsEmail(req).then((res) => {
          if (res.data.status == 200) {
            message.success('邮箱验证码发送成功！');
            self.timeM.start();
          }
        }).catch((res) => {
          message.error(res.data.message)
        })
      }
    });
  }

  _init() {
    basicInfo().then(res => {
      if(res.data.status == 200) {
        let data = res.data.data;
        this.setState({
          userInfo: data          
        })
      }
    })
  }

  _getGoogleDevice() {
    getGoogleDevice().then(res => {
      if (res.data.status === 200) {
        let _res = res.data.data;
        this.setState({
          googleKey: _res.googleKey,
          googleUrl: _res.googleUrl
        })
        console.log(res);
      }
    })
  }

  handleUserInput(name, value) {
    this.setState({
      [name]: value
    });
  }

  _sendSms() {
    let {captchaObj} = this.state;
    captchaObj.verify();
    return true;
  }
  
  _bindGoogleDevice() {
    let { googleKey, code, googleCode, userInfo} = this.state;
    let req = {
      "areaCode": userInfo.areaCode,
      "codeType": 4,
      "googleCode": googleCode,
      "googleKey": googleKey,
    };

    if (userInfo.isMobileBind) {
      req.mobile = userInfo.mobile;
      req.mobileCode = code;
      req.type = 0;
    } else {
      req.email = userInfo.email;
      req.emailCode = code;
      req.type = 1;
    }

    bindGoogleDevice(req).then(res => {
      if (res.data.status === 200) {
        message.success('绑定成功');
        browser.push('/user_center/account_security')
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
    })
  }

  render() {
    let {googleUrl, googleKey} = this.state;
    return (
      <div className="bind-google" style={{backgroundColor: '#162345'}}>
        <h2 className='personalH2' style={{marginBottom: 20}}>设置Google验证</h2>
        <div style={{padding: '0 40px'}}>
          <p style={{fontSize: 16}}>3步完成绑定Google验证器：</p>
          <p style={{color: '#485E7E', marginTop: 10, marginBottom:30}}>
          <i className='iconfont icon-no' style={{color: '#993E32', marginLeft: 0, marginRight: 5, fontSize: 12}}></i>
          使用Google验证器可以在不方便接收短信时，进行操作保护，在提高账户安全性的同时保证良好的使用体验。
          </p>
          <div className='sercurity-warning'>
            <span className='yuanxing'>1</span>
            <span>在您的手机上安装Google验证器或其他兼容软件</span>
          </div>
          <div style={{paddingLeft: 46, marginTop:25, marginBottom: 25}}>
            <p style={{marginBottom: 15}}>
              <span style={{display:'inline-block',width:110, marginRight: 173}}>Android:</span>
              <span className='bind-google-color-green' style={{marginRight: 20}}>Authy双重身份认证器;</span>
              <span className='bind-google-color-green'>Google身份认证器</span>
            </p>
            <p style={{marginBottom: 15}}>
              <span style={{display:'inline-block',width:110, marginRight: 173}}>ios:</span>
              <span className='bind-google-color-green' style={{marginRight: 20}}>Authy双重身份认证器;</span>
              <span className='bind-google-color-green'>Google身份认证器</span>
            </p>
            <p style={{marginBottom: 15}}>
              <span style={{display:'inline-block',width:110, marginRight: 173}}>Windows Phone:</span>
              <span className='bind-google-color-green'>身份认证器</span>
            </p>
          </div>

          <div className='sercurity-warning'>
            <span className='yuanxing'>2</span>
            <span>安装完成后，您需要对该APP进行如下配置</span>
          </div>
          <div style={{paddingLeft: 46, marginTop:25, marginBottom: 25, minHeight: 132}}>
            <img src={`http://qr.liantu.com/api.php?text=${googleUrl}`} alt="" style={{width:132, height: 132, float: 'left', marginRight: 30}}/>
            <div style={{paddingTop: 25}}>
              <p style={{marginBottom: 10, color: '#7D8CA5'}}>如果您无法扫描成功上图的条形码，您还可以手动添加账户，并输入如下密匙：</p>
              <p style={{marginBottom: 20, color: '#AFB9C8'}}>{googleKey}</p>
              <p style={{color: '#993E32'}}>请妥善保存秘钥，如果误删，可通过手动输入密钥来恢复。为了您的安全平台不提供密钥找回。</p>
            </div>
          </div>

          <div className='sercurity-warning'>
            <span className='yuanxing'>3</span>
            <span>检验验证码</span>
          </div>
          <div style={{paddingLeft: 46, marginTop:25, paddingBottom: 99}}>
            <SzInput name='googleCode' placeholder='请输入6位验证码' 
            inputStyle={{borderRadius: 100, border: 'solid 1px #374B69', height: 36 }}
            onChange={this.handleUserInput} validate='yzm'
            />
            <div style={{position: 'relative', width: 293}}>
              <SzInput name='code' placeholder='邮箱或者手机验证码' 
              inputStyle={{borderRadius: 100, border: 'solid 1px #374B69', height: 36 }}
              onChange={this.handleUserInput} validate='yzm'
              />
              <TimeButton text='获取验证码'  id='sendSmsMobile' key='sendSmsMobile' onClick={this._sendSms} ref={ele => this.timeM = ele} className='yzm'/>
            </div>
            <HButton type='sell' text='绑定' onClick={this._bindGoogleDevice}/>
          </div>

        </div>
      </div>
    )
  }
}
