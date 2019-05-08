import React from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import { Modal } from 'components/Modal';
import LineInput from 'components/LineInput';
import TimeButton from 'components/TimeButton';
import { sendSmsMobile, bindTradePwd, checkSmsMobile, getGeetest } from 'js/http-req';
import { message } from 'antd';
import validateUtils from 'js/validateUtils';
import md5 from 'md5';
import { cookie } from 'js/index';
import ENV from 'js/appConfig';

@autobind
export default class SetTradePassword extends React.Component {

  static contextTypes = {
    clientType: PropTypes.string,
    geetestId: PropTypes.string,
    _geetest: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      password: '',
      passwordConfirm: '',
      mobileCode: '',
      googleCode: '',
      captchaObj: {}
    };
  }

  componentDidMount() {
    this.context._geetest(this._geetestHandler);
  }

  handleUserInput(name, value) {
    this.setState({
      [name]: value
    });
  }

  _geetestHandler(captchaObj) {
    this.setState({
      captchaObj: captchaObj
    })
    let self = this;

    captchaObj.onSuccess(function () {
      let personalInfo = self.props.userInfo;
      let type = personalInfo.isGoogleBind && personalInfo.isOpenGoogle ? 2 : personalInfo.isMobileBind ? 0 : 1
      let result = captchaObj.getValidate();
      if (!result) {
        message.error('请完成验证');
        return false;
      }

      if (type == 0) {
        let req = {
          "areaCode": personalInfo.areaCode,
          "codeType": 8, // 8是支付密码
          "mobile": personalInfo.mobile,
          "type": 0,
          "geetestId": self.context.geetestId,
          "clientType": self.context.clientType,
          "geetest_challenge": result.geetest_challenge,
          "geetest_validate": result.geetest_validate,
          "geetest_seccode": result.geetest_seccode
        }
        self.sendCode(req)
      }
    });
  }

  _sendSmsMobile() {
    let self = this
    self.context._geetest(this._geetestHandler);
    if (ENV.getENV().name == 'test2') {
      let personalInfo = self.props.userInfo, req = {
        "areaCode": personalInfo.areaCode,
        "codeType": 8, // 8是支付密码
        "mobile": personalInfo.mobile,
        "type": 0,
        "geetestId": self.context.geetestId,
        "clientType": self.context.clientType,
        geetest_challenge: 'geetest_challenge',
        geetest_validate: 'geetest_validate',
        geetest_seccode: 'rgeetest_seccode'
      }
      self.sendCode(req)
    } else {
      self.state.captchaObj.verify();
    }
    return true;
  }
  //发送验证码
  sendCode(req) {
    sendSmsMobile(req).then((res) => {
      if (res.data.status == 200) {
        message.success('验证码发送成功！');
        this.timeP.start();
      }
    }).catch((res) => {
      message.error(res.data.message);
    })

  }
  _checkPassword() {
    let { password, passwordConfirm } = this.state;
    if (!password) {
      message.error('密码不能为空')
      return false;
    } else if (passwordConfirm !== password) {
      message.error('两次密码不一致');
      return false;
    } else {
      if (validateUtils.testTradePassword(password)) {
        return true;
      } else {
        message.error('密码6位数字组成');
        return false;
      }
    }
  }

  _checkSmsMobile() {
    let personalInfo = this.props.userInfo;
    let { mobileCode } = this.state;
    let req = {
      areaCode: personalInfo.areaCode,
      codeType: 8,
      mobile: personalInfo.mobile,
      mobileCode: mobileCode,
    };

    return checkSmsMobile(req).then(res => {
      if (res.data.status === 200) {
        return true;
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
      return false;
    })
  }

  async _ok(cb) {
    let flag = false;

    let personalInfo = this.props.userInfo;
    let type = personalInfo.isGoogleBind && personalInfo.isOpenGoogle ? 2 : personalInfo.isMobileBind ? 0 : 1
    let {
      password,
      googleCode,
      mobileCode
    } = this.state;

    let req = {
      codeType: 8,
      password: md5(password),
    };

    if (!this._checkPassword()) {
      return false;
    }

    if (type == 0) {
      flag = await this._checkSmsMobile()
      if (flag) {
        req.mobile = personalInfo.mobile,
          req.mobileCode = mobileCode,
          req.type = 0;

      } else {
        return false
      }

    } else {
      if (!googleCode) {
        message.error('请输入谷歌验证码！');
        return false;
      }
      req.googleCode = googleCode;
      req.type = 2;

    }

    bindTradePwd(req).then(res => {
      if (res.data.status === 200) {
        message.success('设置成功');
        cookie.clearCookie(md5('payPwd'))
        this.props.success();
        cb(true);
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
    })
  }

  _onClose() {
    this.setState({
      password: '',
      passwordConfirm: '',
      mobileCode: '',
      googleCode: '',
    })
    this.props.onClose();
  }

  render() {
    let { isShow, onClose, userInfo } = this.props;
    let type = userInfo.isGoogleBind && userInfo.isOpenGoogle ? 2 : userInfo.isMobileBind ? 0 : 1;

    return (
      <div>
        {
          isShow ?
            <Modal title='设置支付密码' okText='确认' next={0} onOk={this._ok} onClose={this._onClose}>
              <div style={{ padding: '0 125px', marginTop: 40, marginBottom: 60 }}>
                <div style={{ marginBottom: 20 }}>
                  <LineInput placeholder='请输入6位数字密码' type='password' name='password' onChange={this.handleUserInput} validate='yzm' />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <LineInput placeholder='确认支付密码' type='password' name='passwordConfirm' onChange={this.handleUserInput} validate='yzm' />
                </div>
                {
                  type == 0 ?
                    <div style={{ marginBottom: 20, display: 'flex' }}>
                      <LineInput placeholder='手机验证码' type='text' name='mobileCode' propsStyle={{ flex: 1 }} onChange={this.handleUserInput} validate='yzm' />
                      <TimeButton radius={true} onClick={this._sendSmsMobile} ref={ele => this.timeP = ele}/>
                    </div>
                    :
                    ''
                }
                {
                  type == 2 ?
                    <div style={{ marginBottom: 20 }}>
                      <LineInput placeholder='谷歌验证码' type='text' name='googleCode' onChange={this.handleUserInput} validate='yzm' />
                    </div>
                    :
                    ''
                }
              </div>

            </Modal>
            :
            ''
        }
      </div>
    )
  }
}
