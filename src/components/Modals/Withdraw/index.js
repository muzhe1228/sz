
import React from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Modal } from 'components/Modal';
import LineInput from 'components/LineInput';
import TimeButton from 'components/TimeButton';
import { message } from 'antd';
import { sendSmsMobile, withdraw, checkAddress } from 'js/http-req';
import { scientificToNumber } from 'js';
import { Link } from 'react-router-dom';
import md5 from 'md5';
import { coinSplice, coinSplice1 } from 'js/common'
import './style.less'

@autobind
class SmsValidate extends React.Component {
  static contextTypes = {
    clientType: PropTypes.string,
    geetestId: PropTypes.string,
    _geetest: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      type: this.props.userMsg.isGoogleBind && this.props.userMsg.isOpenGoogle ? 2 : this.props.userMsg.isMobileBind ? 0 : 1,
      captchaObj: {},
      dropDawn: false,
      addr: '',
      tag: '',
      withdraw_number: '',
      tradePassword: '',
      googleCode: '',
      smsCode: ''
    }
  }

  componentDidMount() {
    this.context._geetest(this._geetestHandler);
  }

  _dropShow() {
    this.setState({
      dropDawn: true
    })
  }

  _dropHide() {
    this.setState({
      dropDawn: false
    })
  }

  handlerInput(name, value, chooseCoin) {
    if (name == 'withdraw_number') {

      if (value > chooseCoin.drawMax) {
        message.warning('提现数量大于最大提现数量');
        this.setState({
          withdraw_number: coinSplice1(chooseCoin.drawMax, chooseCoin.coinPrecision)
        })
      } else {
        console.log(chooseCoin.drawMax, chooseCoin.coinPrecision)
        // let obj = e.target, reg = /^[0-9]{1,}\.?[0-9]{0,}$/g, isTrue = reg.test(obj.value);
        // if (!isTrue) {
        //   message.warning('请输入数字或小数！')
        // }
        // obj.value = obj.value.replace(/^\./, '').replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/[^\d\.?]/, '');



        value = value.replace(/^\./, '').replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/[^\d\.?]/, '');
        let isToF = value.substr(value.length - 1, 1)
        this.setState({
          withdraw_number: isToF == '.' ? value : coinSplice1(value, chooseCoin.coinPrecision)
          // withdraw_number: isToF == '.' ? value : coinSplice(value, chooseCoin.coinPrecision)
        })
      }
    } else {
      this.setState({
        [name]: value
      })
    }
  }

  _chooseAddr(addr, tag) {
    this.setState({
      addr,
      tag
    })
  }

  _autoMax(chooseCoin) {
    if (chooseCoin.drawMax < chooseCoin.enableAmount) {
      message.warning('提现数量大于最大提现数量')
      this.setState({
        withdraw_number: coinSplice1(chooseCoin.drawMax, chooseCoin.coinPrecision)
      })
    } else {
      this.setState({
        withdraw_number: coinSplice1(chooseCoin.currentAmount, chooseCoin.coinPrecision)
      })
    }
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
        "codeType": 11,
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
    this.state.captchaObj.verify();
    return true;
  }

  _withdraw() {
    let { chooseCoin } = this.props;
    let { type } = this.state;
    if (this.state.addr == '') {
      message.error('地址不能为空');
      return false
    }
    debugger
    if (this.state.tag == '' && (chooseCoin.coinCode == 'EOS' || chooseCoin.coinCode == 'XRP')) {
      message.error('tag不能为空');
      return false
    }
    if (this.state.withdraw_number == '' || this.state.withdraw_number == '.') {
      message.error('请输入提币数量');
      return false
    }
    if (this.state.withdraw_number < this.props.chooseCoin.drawMin) {
      message.error('提现数量大于最大提现数量');
      return false
    }
    if (this.state.tradePassword == '') {
      message.error('请输入支付密码');
      return false
    }
    if (type == 0 && this.state.smsCode == '') {
      message.error('请输入短信验证码');
      return false
    }
    if (type == 2 && this.state.googleCode == '') {
      message.error('请输入谷歌验证码');
      return false
    }
    let req = {
      coinCode: this.props.chooseCoin.coinCode,
      drawAdd: this.state.addr
    };
    (this.props.chooseCoin.coinCode == 'EOS' || this.props.chooseCoin.coinCode == 'XRP') ? req.tag = this.tag : ''
    return checkAddress({ coinCode: this.props.chooseCoin.coinCode, drawAdd: this.state.addr }).then(resp => {
      if (resp.data.status == 200) {
        return true
      }
    }).catch(err => {
      message.error(err.data.message);
      return false;
    })
  }

  _reqWithdraw() {
    let { chooseCoin, fee } = this.props;
    let { addr, withdraw_number, tradePassword, googleCode, smsCode, tag } = this.state;
    let req = {
      coinCode: chooseCoin.coinCode,
      checkType: 11, //验证类型
      drawAdd: addr,
      tag: tag,
      drawAmount: withdraw_number,
      mobile: this.props.userMsg.mobile,
      poundageAmount: scientificToNumber(fee),
      tradePwd: md5(tradePassword), //交易密码
      validatePwd: smsCode === '' ? googleCode : smsCode,
      validateType: smsCode === '' ? 1 : 0
    }
    return withdraw(req).then(resp => {
      if (resp.data.status === 200) {
        this.setState({
          addr: '',
          tag: '',
          googleCode: '',
          smsCode: '',
          tradePassword: '',
          withdraw_number: ''
        })
        message.success('提币申请成功');
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
    flag = await this._withdraw();
    if (flag) {
      flag = false;
      flag = await this._reqWithdraw();
    }
    if (flag) {
      this.props.onOK();
    }
    cb(flag);
  }

  controlDrop(e) {
    if (e.target.name !== 'addr') {
      this.setState({
        dropDawn: false
      })
    }
  }

  _onClose() {
    this.setState({
      addr: '',
      googleCode: '',
      smsCode: '',
      tradePassword: '',
      withdraw_number: ''
    })
    this.props.onClose();
  }

  render() {
    let { isShow, onClose, chooseCoin, fee, addrList } = this.props;
    let { dropDawn, addr, withdraw_number, type, tag } = this.state;
    return (
      <div className='withdraw-container' onClick={this.controlDrop}>
        {
          isShow ?
            <Modal title='提现' okText='提现' next={0} onOk={this._ok} onClose={this._onClose}>
              <div style={{ padding: '0 40px', marginTop: 40, marginBottom: 20 }} >
                <input name="old-userName" type="text" style={{ display: '', opacity: 0 }} ></input>
                <input name="old-pwd" type="password" style={{ display: '', opacity: 0 }}></input>
                <p style={{ marginBottom: 30 }}>
                  可用数量：
                     <span style={{ color: '#D7DEE9' }}>{coinSplice(chooseCoin.currentAmount, chooseCoin.coinPrecision)} {chooseCoin.coinCode}</span>
                  <span style={{ color: '#BF5546', display: 'inline-block', float: 'right' }}><Link to='/user_center/asset_manage/withdraw_history'>提现历史</Link></span>
                </p>
                <div className='item-one'>
                  <LineInput placeholder='请输入地址' value={addr} type='text' name='addr' onChange={this.handlerInput} onFocus={this._dropShow} />
                  <i className='iconfont icon-numDown icon-right'></i>
                  {
                    dropDawn &&
                    <ul>
                      {
                        addrList.map((item, index) => {
                          return <li key={index} onClick={this._chooseAddr.bind(this, item.drawAdd, item.tag)}>{item.drawAdd}</li>
                        })
                      }
                    </ul>
                  }

                </div>
                {(chooseCoin.coinCode == 'EOS' || chooseCoin.coinCode == 'XRP') ?
                  <div className='item-one'>
                    <LineInput placeholder='标签' name='tag' type='text' value={tag} onChange={this.handlerInput} />
                  </div> : ''
                }

                <div className='item-one'>
                  <LineInput placeholder='请输入数量' name='withdraw_number' value={withdraw_number} type='text' onChange={this.handlerInput} validate='money' params={chooseCoin} />
                  <span className='icon-right' style={{ fontSize: 14 }} onClick={this._autoMax.bind(this, chooseCoin)}>全部</span>
                  <p style={{ float: "right", marginTop: 8 }}>
                    手续费：<span style={{ color: '#D7DEE9' }}>{scientificToNumber(fee)} {chooseCoin.coinCode}</span>
                  </p>
                </div>
                <div className='item-one'>
                  <LineInput placeholder='支付密码' name='tradePassword' type='password' onChange={this.handlerInput} validate='yzm' />
                </div>
                {
                  type == 2 ?
                    <div className='item-one'>
                      <LineInput placeholder='谷歌验证码' name='googleCode' type='text' onChange={this.handlerInput} validate='yzm' />
                    </div>
                    :
                    <div className='item-one hasBtn'>
                      <LineInput placeholder='短信验证' name='smsCode' type='text' onChange={this.handlerInput} validate='yzm' />
                      <TimeButton radius={true} onClick={this._sendSmsEmail} ref={ele => this.timeM = ele} />
                    </div>
                }
                <p style={{ color: '#BF5546', marginBottom: 12 }}>温馨提示：</p>
                <p className='notice'>最小提现数量：<span className='color-red'>{scientificToNumber(chooseCoin.drawMin)} {chooseCoin.coinCode}</span>。</p>
                <p className='notice'>为保障资金安全，当您账户安全策略变更、密码修改、使用新地址提币，我们会对提币进行人工审核，请耐心等待工作人员电话或邮件联系。</p>
                <p className='notice'>请务必确认浏览器安全，防止信息被篡改或泄露。</p>
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
