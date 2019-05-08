import React from 'react';
import {autobind} from 'core-decorators';
import PropTypes from 'prop-types';
import {Modal} from 'components/Modal';
import LineInput from 'components/LineInput';
import TimeButton from 'components/TimeButton';
import {sendSmsMobile, bindEmail, checkSmsMobile, checkSmsEmail, sendSmsEmail} from 'js/http-req';
import { message} from 'antd';
import validateUtils from 'js/validateUtils';

@autobind
export default class BindEmail extends React.Component{

    static contextTypes = {
      clientType: PropTypes.string,
      geetestId: PropTypes.string,
      _geetest: PropTypes.func
    };

    constructor(props){
        super(props);
        this.state={
          email: '',
          mobileCode: '',
          googleCode: '',
          emailCode: '', // 邮箱验证码,
          sendEmail: false,
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
        let result = captchaObj.getValidate();
        if (!result) {
          message.error('请完成验证');
          return false;
        }

        if(self.state.sendEmail) {
          let req = {
            "codeType": 6, 
            "email": self.state.email,
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
              self.time1.start();
            }
          }).catch((res) => {
            message.error(res.data.message);
          })
        }else{
          let req = {
            "areaCode": personalInfo.areaCode,
            "codeType": 6, // 6是绑定邮箱
            "mobile": personalInfo.mobile,
            "geetestId": self.context.geetestId,
            "clientType": self.context.clientType,
            "geetest_challenge": result.geetest_challenge,
            "geetest_validate": result.geetest_validate,
            "geetest_seccode": result.geetest_seccode
          }
          sendSmsMobile(req).then((res) => {
            if (res.data.status == 200) {
              message.success('验证码发送成功！');
              self.time2.start();
            }
          }).catch((res) => {
            message.error(res.data.message);
          })
        }
      });
    }

    _sendSmsMobile() {
      this.setState({
        sendEmail: false
      })
      this.context._geetest(this._geetestHandler);
      this.state.captchaObj.verify();
      return true;
    }
    _sendSmsEmail() {
      let {email} = this.state;
      if (!email) {
        message.error('邮箱不能为空');
        return false;
      }
      if (!validateUtils.testEmail(email)) {
        message.error('请输入正确的邮箱号');
        return false;
      }
      this.setState({
        sendEmail: true
      })

      this.context._geetest(this._geetestHandler);
      this.state.captchaObj.verify();
      return true;
    }

    _checkSmsMobile() {
      let personalInfo = this.props.userInfo;
      let { mobileCode } = this.state;
      let req = {
        areaCode: personalInfo.areaCode,
        codeType: 6, 
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
      let { emailCode, email } = this.state;
      let req = {
        codeType: 6, 
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
  
    async _ok(cb) {
      let self = this;
      let flag =false;
      if (!this.state.email) {
        message.error('邮箱不能为空');
        return false;
      }
      if (!validateUtils.testEmail(this.state.email)) {
        message.error('请输入正确的邮箱号');
        return false;
      }
      flag = await this._checkSmsEmail()
      if(!flag) {
        return false
      }

      let personalInfo = this.props.userInfo;
      let type = personalInfo.isGoogleBind && personalInfo.isOpenGoogle ? 2 : 0;
      let{
        email,
        googleCode,
        emailCode,
        mobileCode
      } = this.state;

      let req = {
        areaCode: personalInfo.areaCode,
        codeType: 6,
        email: email,
        emailCode: emailCode,
      };

      if(type == 0) {
        flag = await this._checkSmsMobile()
        if(flag) {
          req.mobile = personalInfo.mobile,
          req.mobileCode = mobileCode,
          req.type = 0;
          
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

      bindEmail(req).then(res => {
        if (res.data.status === 200) {
          message.success('绑定成功');
          self.props.success();
          cb(true);
        }
      }).catch(err => {
        let _errMsg = err.data.message;
        message.error(_errMsg);
      })
      
    }

    _onClose() {
      this.setState({
        email: '',
        mobileCode: '',
        googleCode: '',
        emailCode: '', // 邮箱验证码,
        sendEmail: false,
      })
      this.props.onClose();
    }

    render(){
      let {isShow, onClose, userInfo} = this.props;
      let type = userInfo.isGoogleBind && userInfo.isOpenGoogle ? 2 : 0;
      
        return(
          <div>
            {
              isShow?
                <Modal title='绑定邮箱' okText='确认绑定' next={0} onOk={this._ok} onClose={this._onClose}>
                  <div style={{ padding: '0 125px', marginTop: 40, marginBottom: 60 }}>
                    <div style={{ marginBottom: 20 }}>
                      <LineInput placeholder='邮箱号码' type='text' name='email' onChange={this.handleUserInput}/>
                    </div>
                    <div style={{ marginBottom: 20, display: 'flex' }}>
                      <LineInput placeholder='邮箱验证码' type='text' name='emailCode' propsStyle={{flex: 1}} onChange={this.handleUserInput} validate='yzm'/>
                      <TimeButton radius={true} onClick={this._sendSmsEmail} ref={ele => this.time1 = ele}/>
                    </div>
                    {
                      type == 0?
                        <div style={{ marginBottom: 20, display: 'flex' }}>
                          <LineInput placeholder='手机验证码' type='text' name='mobileCode' propsStyle={{flex: 1}} onChange={this.handleUserInput} validate='yzm'/>
                          <TimeButton radius={true} onClick={this._sendSmsMobile} ref={ele => this.time2 = ele}/>
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
