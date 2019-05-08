import React from 'react';
import {autobind} from 'core-decorators';
import PropTypes from 'prop-types';
import {Modal} from 'components/Modal';
import LineInput from 'components/LineInput';
import TimeButton from 'components/TimeButton';
import {sendSmsMobile, updateLoginPwd, checkSmsMobile, checkSmsEmail, sendSmsEmail} from 'js/http-req';
import { message} from 'antd';
import validateUtils from 'js/validateUtils';
import md5 from 'md5';

@autobind
export default class ModifyPassword extends React.Component{

    static contextTypes = {
      clientType: PropTypes.string,
      geetestId: PropTypes.string,
      _geetest: PropTypes.func
    };

    constructor(props){
        super(props);
        this.state={
          password: '',
          passwordConfirm: '',
          mobileCode: '',
          googleCode: '',
          emailCode: '', // 邮箱验证码
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
            "codeType": 7, // 7是修改登录密码
            "mobile": personalInfo.mobile,
            "type": 0,
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
  
        } else if(type == 1) {
          let req = {
            "codeType": 7, // 7是修改登录密码
            "email": personalInfo.email,
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

    _sendSmsMobile() {
      this.context._geetest(this._geetestHandler);
      this.state.captchaObj.verify();
      return true;
    }
    _sendSmsEmail() {
      this.context._geetest(this._geetestHandler);
      this.state.captchaObj.verify();
      return true;
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
        if(validateUtils.testPassword(password)) {
          return true;
        }else{
          message.error('密码由8到20位字母和数字组成');
          return false;
        }
      }
    }

    _checkSmsMobile() {
      let personalInfo = this.props.userInfo;
      let { mobileCode } = this.state;
      let req = {
        areaCode: personalInfo.areaCode,
        codeType: 7, // 7表示修改密码
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

    _checkSmsEmail() {
      let personalInfo = this.props.userInfo;
      let { emailCode } = this.state;
      let req = {
        codeType: 7, // 7表示修改密码
        email: personalInfo.email,
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
  
    async _ok(cb) {
      let flag =false;

      let personalInfo = this.props.userInfo;
      let type = personalInfo.isGoogleBind && personalInfo.isOpenGoogle ? 2 : personalInfo.isMobileBind ? 0 : 1
      let{
        password,
        googleCode,
        emailCode,
        mobileCode
      } = this.state;

      let req = {
        areaCode: personalInfo.areaCode,
        codeType: 7,
        password: md5(password),
      };

      if(!this._checkPassword()){
        return false;
      }

      if(type == 0) {
        flag = await this._checkSmsMobile()
        if(flag) {
          req.mobile = personalInfo.mobile,
          req.mobileCode = mobileCode,
          req.type = 0;
          
        }else{
          return false
        }

      }else if(type == 1) {
        flag = await this._checkSmsEmail()
        if(flag) {
          req.email = personalInfo.email,
          req.emailCode = emailCode,
          req.type = 1;
          
        }else{
          return false
        }

      }else{
        if (!googleCode) {
          message.error('请输入谷歌验证码！');
          return false;
        }
        req.googleCode = googleCode;
        req.type = 2;
        
      }

      updateLoginPwd(req).then(res => {
          if (res.data.status === 200) {
            message.success('修改成功')
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
        emailCode: '', // 邮箱验证码
      })
      this.props.onClose();
    }

    render(){
      let {isShow, onClose, userInfo} = this.props;
      let type = userInfo.isGoogleBind && userInfo.isOpenGoogle ? 2 : userInfo.isMobileBind ? 0 : 1;
      
        return(
          <div>
            {
              isShow?
                <Modal title='修改登录密码' okText='确认修改' next={0} onOk={this._ok} onClose={this._onClose}>
                  <div style={{ padding: '0 125px', marginTop: 40, marginBottom: 60 }}>
                    <div style={{ marginBottom: 20 }}>
                      <LineInput placeholder='新密码' type='password' name='password' onChange={this.handleUserInput}/>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <LineInput placeholder='确认密码' type='password' name='passwordConfirm' onChange={this.handleUserInput}/>
                    </div>
                    {
                      type == 0?
                        <div style={{ marginBottom: 20, display: 'flex' }}>
                          <LineInput placeholder='手机验证码' type='text' name='mobileCode' propsStyle={{flex: 1}} onChange={this.handleUserInput} validate='yzm'/>
                          <TimeButton  radius={true} onClick={this._sendSmsMobile} ref={ele => this.timeP = ele}/>
                        </div>
                      :
                      ''
                    }
                    {
                      type == 1?
                        <div style={{ marginBottom: 20, display: 'flex' }}>
                        <LineInput placeholder='邮箱验证码' type='text' name='emailCode' propsStyle={{flex: 1}} onChange={this.handleUserInput} validate='yzm'/>
                        <TimeButton  radius={true} onClick={this._sendSmsEmail} ref={ele => this.timeM = ele}/>
                        </div>
                      :
                      ''
                    }
                    {
                      type == 2?
                        <div style={{ marginBottom: 20 }}>
                          <LineInput placeholder='谷歌验证码' type='text' name='googleCode' onChange={this.handleUserInput} validate='yzm'/>
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
