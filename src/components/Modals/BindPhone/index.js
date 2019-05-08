import React from 'react';
import {autobind} from 'core-decorators';
import PropTypes from 'prop-types';
import I18n from 'components/i18n';
import {Modal} from 'components/Modal';
import LineInput from 'components/LineInput';
import TimeButton from 'components/TimeButton';
import {sendSmsMobile, checkSmsMobile, checkSmsEmail, sendSmsEmail, getGeetest, bindMobile} from 'js/http-req';
import { message} from 'antd';
import { CountrySelect } from 'components/Select';
import Country from 'js/country.json';

import './style.less';

@autobind
export default class BindPhone extends React.Component{

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
          countrys: '',
          areaCode: 86,
          newMobile: '',
          newMobileCode: '',
          sendNewMobileCode: false,
          captchaObj: {}
        };
    }

    componentDidMount() {
      let arr = Country.map((one) => {
        return { label: one.code + '(' + one.country + ')', value: one.code }
      })
  
      this.setState({
        countrys: arr
      })

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

        if(self.state.sendNewMobileCode) {
          let req = {
            "areaCode": self.state.areaCode,
            "codeType": 5, // 5是绑定手机
            "mobile": self.state.newMobile,
            "type": 0,
            "geetestId": self.context.geetestId,
            "clientType": self.context.clientType,
            "geetest_challenge": result.geetest_challenge,
            "geetest_validate": result.geetest_validate,
            "geetest_seccode": result.geetest_seccode
          }

          sendSmsMobile(req).then((res) => {
            if (res.data.status == 200) {
              message.success('手机验证码发送成功！');
              self.timePN.start();
            }
          }).catch((res) => {
            message.error(res.data.message);
            // message.error(<I18n message={res.data.message}/>);
          })

        }else{
          if (type == 0) {
            let req = {
              "areaCode": personalInfo.areaCode,
              "codeType": 5, 
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
                message.success('旧手机验证码发送成功！');
                self.timePO.start();
              }
            }).catch((res) => {
              message.error(res.data.message);
              // message.error(<I18n message={res.data.message}/>);
            })
    
          } else if(type == 1) {
            let req = {
              "codeType": 5, 
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
                message.success('邮箱验证码发送成功！');
                self.timeM.start();
              }
            }).catch((res) => {
              message.error(res.data.message);
            })
          }
        }
      });
    }

    _sendSmsMobile() {
      this.setState({
        sendNewMobileCode : false
      })
      this.context._geetest(this._geetestHandler);
      this.state.captchaObj.verify();
      return true;
    }

    _sendNewSmsMobile() {
      if(!this.state.newMobile) {
        message.error('请输入手机号码');
        return false;
      }
      this.setState({
        sendNewMobileCode : true
      })
      this.context._geetest(this._geetestHandler);
      this.state.captchaObj.verify();
      return true;
    }

    _sendSmsEmail() {
      this.setState({
        sendNewMobileCode : false
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
        codeType: 5, 
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

    _checkNewSmsMobile() {
      let { newMobile, newMobileCode, areaCode } = this.state;
      let req = {
        areaCode: areaCode,
        codeType: 5, 
        mobile: newMobile,
        mobileCode: newMobileCode,
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
        codeType: 5, // 5换绑手机
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
        areaCode,
        googleCode,
        emailCode,
        mobileCode,
        newMobile,
        newMobileCode
      } = this.state;

      if(!newMobile) {
        message.error('请输入手机号码')
        return false;
      }

      if(!newMobileCode) {
        message.error('请输入手机验证码')
        return false
      }
      flag = await this._checkNewSmsMobile();
      if(!flag) {
        return false;
      }

      let req = {
        areaCode: areaCode,
        codeType: 5,
        mobile: newMobile,
        mobileCode: newMobileCode
      };

      if(type == 0) {
        flag = await this._checkSmsMobile()
        if(flag) {
          req.oldMobile = personalInfo.mobile;
          req.oldMobileCode = mobileCode;
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

      bindMobile(req).then(res => {
          if (res.data.status === 200) {
            message.success('绑定成功');
            this.props.success();
            cb(true);
          }
      }).catch(err => {
          let _errMsg = err.data.message;
          message.error(_errMsg);
      })
    }

    ChooseAreaCode(name, value) {
      this.setState({
        areaCode: value
      })
    }

    _onClose() {
      this.setState({
          password: '',
          passwordConfirm: '',
          mobileCode: '',
          googleCode: '',
          emailCode: '', // 邮箱验证码
          countrys: '',
          areaCode: 86,
          newMobile: '',
          newMobileCode: '',
          sendNewMobileCode: false,
      })

      this.props.onClose();
    }


    render(){
      let {isShow, onClose, userInfo} = this.props;
      let {areaCode} = this.state;
      let type = userInfo.isGoogleBind && userInfo.isOpenGoogle ? 2 : userInfo.isMobileBind ? 0 : 1;
      
        return(
          <div className='ModifyMobile'>
            {
              isShow?
                <Modal title='绑定手机' okText='确认绑定' next={0} onOk={this._ok} onClose={this._onClose}>
                  <div style={{ padding: '0 125px', marginTop: 40, marginBottom: 60 }}>
                    <div style={{ display: 'flex', marginBottom: 20 }} className='hasSelect'>
                      <CountrySelect
                        name="areaCode"
                        value={areaCode}
                        onChange={this.ChooseAreaCode}
                        config={{
                          options: this.state.countrys
                        }}
                      />
                      <LineInput name='newMobile' placeholder='手机号码' onChange={this.handleUserInput} propsStyle={{ flex: 1 }} validate='number'/>
                    </div>
                    <div style={{ marginBottom: 20, display: 'flex'}}>
                      <LineInput placeholder='手机验证码' type='text' name='newMobileCode' onChange={this.handleUserInput} propsStyle={{ flex: 1 }} validate='yzm'/>
                      <TimeButton  radius={true} onClick={this._sendNewSmsMobile} ref={ele => this.timePN = ele}/>
                    </div>
                    {
                      type == 0?
                        <div style={{ marginBottom: 20, display: 'flex' }}>
                          <LineInput placeholder='旧手机验证码' type='text' name='mobileCode' propsStyle={{flex: 1}} onChange={this.handleUserInput}/>
                          <TimeButton  radius={true} onClick={this._sendSmsMobile} ref={ele => this.timePO = ele}/>
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
