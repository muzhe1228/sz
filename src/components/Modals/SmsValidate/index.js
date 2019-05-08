
import React from 'react';
import {autobind} from 'core-decorators';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {Modal} from 'components/Modal';
import LineInput from 'components/LineInput';
import TimeButton from 'components/TimeButton';
import { message} from 'antd';
import {sendSmsMobile} from 'js/http-req';
import './style.less'

@autobind
class SmsValidate extends React.Component{
    static contextTypes = {
      clientType: PropTypes.string,
      geetestId: PropTypes.string,
      _geetest: PropTypes.func
    };

    constructor(props){
        super(props);

        this.state = {
          captchaObj : {}
        }
    }

    componentDidMount() {
      this.context._geetest(this._geetestHandler);
    }

    _geetestHandler(captchaObj) {
      this.setState({
        captchaObj: captchaObj
      })
      let self = this;

      captchaObj.onSuccess(function () {
        let result = captchaObj.getValidate();
        if (!result) {
          message.error('请完成验证');
          return false;
        }
        let personalInfo = self.props.userMsg;
        let req = {
          "areaCode": personalInfo.areaCode,
          "codeType": self.props.codeType,
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
            self.timeM.start();
          }
        }).catch((res) => {
          message.error(res.data.message);
        })

      });
    }

    _sendSmsEmail() {
      this.context._geetest(this._geetestHandler);
      setTimeout(() => {
        this.state.captchaObj.verify();
      }, 0);
      return true;
    }

    async _ok(cb) {
      let flag = false;
      flag = await this.props.onOk();
      cb(flag);
    }

    render(){
      let {isShow, onClose} = this.props;
        return(
          <div className='smsValidate-container'>
            {
              isShow?
                <Modal title='短信验证' okText='确认' next={0} onOk={this._ok} onClose={onClose}>
                  <div style={{ padding: '0 125px', marginTop: 40, marginBottom: 60 }}>
                    <div style={{ marginBottom: 20 }} className='smsContainer'>
                      <LineInput placeholder='请输入短信验证码' type='text' name='smsCode' onChange={this.props.changeGoogle} validate='yzm'/>
                      <TimeButton  radius={true} onClick={this._sendSmsEmail} ref={ele => this.timeM = ele}/>
                    </div>
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
    userMsg: state.userMsg.userMsg
  }
}

export default connect(mapStateToProps)(SmsValidate);
