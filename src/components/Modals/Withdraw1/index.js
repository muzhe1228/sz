
import React from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Modal } from 'components/Modal';
import LineInput from 'components/LineInput';
import TimeButton from 'components/TimeButton';
import { message } from 'antd';
import { withdraw1 } from 'js/http-req';
import { scientificToNumber } from 'js';
import { Link } from 'react-router-dom';
import md5 from 'md5';
import { coinSplice, coinSplice1 } from 'js/common'
import './style.less'

@autobind
class SmsValidate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inLoginName: '',
      transferAmount: '',
      tradePwd: '',
    }
  }

  handlerInput(name, value, chooseCoin) {
    if (name == 'inLoginName') {
      if (value.length > 30) {
        value = value.slice(0, 30)
        message.warning('用户名长度不得超过30位');
      };
      this.setState({
        inLoginName: value
      })
    } else if (name == 'transferAmount') {
      if (value > chooseCoin.drawMax) {
        message.warning('转账数量大于最大转账数量');
        this.setState({
          transferAmount: coinSplice1(chooseCoin.drawMax, chooseCoin.coinPrecision)
        })
      } else {
        value = value.replace(/^\./, '').replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/[^\d\.?]/, '');
        let isToF = value.substr(value.length - 1, 1)
        this.setState({
          transferAmount: isToF == '.' ? value : coinSplice1(value, chooseCoin.coinPrecision)
          // transferAmount: isToF == '.' ? value : coinSplice(value, chooseCoin.coinPrecision)
        })
      }
    } else {
      this.setState({
        [name]: value
      })
    }
  }

  _autoMax(chooseCoin) {
    if (chooseCoin.drawMax < chooseCoin.enableAmount) {
      message.warning('最多只能提取' + chooseCoin.drawMax)
      this.setState({
        transferAmount: coinSplice1(chooseCoin.drawMax, chooseCoin.coinPrecision)
      })
    } else {
      this.setState({
        transferAmount: coinSplice1(chooseCoin.currentAmount, chooseCoin.coinPrecision)
      })
    }
  }

  _withdraw() {
    let { type } = this.state;
    if (this.state.inLoginName == '' || this.state.inLoginName == '.') {
      message.error('请输入转账用户名');
      return false
    }
    if (this.state.transferAmount == '' || this.state.transferAmount == '.') {
      message.error('请输入转账数量');
      return false
    }
    if (this.state.transferAmount < this.props.chooseCoin.drawMin) {
      message.error('最小数转账量为' + this.props.chooseCoin.drawMin);
      return false
    }
    if (this.state.tradePwd == '') {
      message.error('请输入支付密码');
      return false
    }
    return true
  }

  _reqWithdraw() {
    let { chooseCoin } = this.props;
    let { inLoginName, transferAmount, tradePwd } = this.state;
    let req = {
      inLoginName: inLoginName,//转入用户登录名
      coinCode: chooseCoin.coinCode,//币种类型
      transferAmount: transferAmount,//转账数量
      tradePwd: md5(tradePwd), //交易密码
    }
    return withdraw1(req).then(resp => {

      if (resp.data.status === 200) {
        this.setState({
          googleCode: '',
          smsCode: '',
          tradePwd: '',
          transferAmount: ''
        })
        message.success('划转成功');
        return true;
      }
    }).catch(err => {
      message.error(err.data.message ? err.data.message : err.data);
      return true;
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

  _onClose() {
    this.setState({
      googleCode: '',
      smsCode: '',
      tradePwd: '',
      inLoginName: '',
      transferAmount: ''
    })
    this.props.onClose();
  }

  render() {
    let { isShow, chooseCoin } = this.props;
    let { transferAmount,inLoginName } = this.state;
    return (
      <div className='withdraw-container' onClick={this.controlDrop}>
        {
          isShow ?
            <Modal title='站内转账' okText='划转' next={0} onOk={this._ok} onClose={this._onClose}>
              <div style={{ padding: '0 40px', marginTop: 40, marginBottom: 20 }} >
                <input name="old-userName" type="text" style={{ display: '', opacity: 0 }} ></input>
                <input name="old-pwd" type="password" style={{ display: '', opacity: 0 }}></input>
                <p style={{ marginBottom: 30 }}>
                  可用余额：
                     <span style={{ color: '#D7DEE9' }}>{coinSplice(chooseCoin.currentAmount, chooseCoin.coinPrecision)} {chooseCoin.coinCode}</span>
                </p>

                <div className='item-one'>
                  <LineInput placeholder='请输入用户名' name='inLoginName' value={inLoginName} type='text' onChange={this.handlerInput} />
                </div>
                <div className='item-one'>
                  <LineInput placeholder={chooseCoin.coinCode + '数量'} name='transferAmount' value={transferAmount} type='text' onChange={this.handlerInput} validate='money' params={chooseCoin} />
                  <span className='icon-right' style={{ fontSize: 14 }} onClick={this._autoMax.bind(this, chooseCoin)}>全部</span>
                </div>
                <div className='item-one'>
                  <LineInput placeholder='支付密码' name='tradePwd' type='password' onChange={this.handlerInput} validate='yzm' />
                </div>
                <p style={{ color: '#BF5546', marginBottom: 12 }}>温馨提示：</p>
                <p className='notice'>最小提币数量：<span className='color-red'>{scientificToNumber(chooseCoin.drawMin)} {chooseCoin.coinCode}</span>。</p>
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
