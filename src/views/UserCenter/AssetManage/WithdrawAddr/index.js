import React from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { HInput } from 'components/Form';
import HButton from 'components/HButton';
import { message, Select } from 'antd';
import { Modal } from 'components/Modal';
import { getCoinAndAmount, getCoinAddress, delCoinAddress, checkAddress, addCoinAddress } from 'js/http-req'
import { GoogleValidate, SmsValidate } from 'components/Modals'
import './style.less';
import codeIcon from 'images/smallCode.png'
const Option = Select.Option;

@autobind
class WithdrawAddr extends React.Component {
  static contextTypes = {
    clientType: PropTypes.string,
    geetestId: PropTypes.string,
    _geetest: PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      type: this.props.userMsg.isGoogleBind && this.props.userMsg.isOpenGoogle ? 2 : this.props.userMsg.isMobileBind ? 0 : 1,
      selectCurrency: '请选择',
      addVal: '',
      remark: '',
      tag: '',
      captchaObj: {},
      googleCode: '',
      mobileCode: '',
      coinList: [],
      addrList: [],
      chooseAdd: {},
      confirmDel: false,
      isShowModalGoogle: false,
      isShowModalSms: false
    };
  }

  change(value) {
    this.setState({ selectCurrency: value });
    this.searchCoinAddress(value);
  }
  async addWithdraw() {
    if (type == 0) {
      message.warning('请先绑定手机或者谷歌验证');
      return false
    }
    const { addVal, remark, tag, type, selectCurrency } = this.state;
    if (selectCurrency == '请选择') {
      message.error('请选择币种');
      return;
    }
    if (addVal == '') {
      message.error('提币地址不能为空');
      return;
    }
    if (remark == '') {
      message.error('备注不能不能为空');
      return;
    }
    if (tag == '' && (selectCurrency == 'EOS' || selectCurrency == 'XRP')) {
      message.error('标签不能不能为空');
      return;
    }
    let req = {
      coinCode: this.state.selectCurrency,
      drawAdd: this.state.addVal
    };
    (this.state.selectCurrency == 'EOS' || this.state.selectCurrency == 'XRP') ? req.tag = this.state.tag : ''
    let flag = await checkAddress(req).then(resp => {
      if (resp.data.status == 200) {
        return true
      }
    }).catch(err => {
      message.error(err.data.message);
      return false;
    })

    if (!flag) return false;

    if (type == 2) {
      this.setState({
        isShowModalGoogle: true
      })
    } else {
      this.setState({
        isShowModalSms: true
      })
    }
  }
  componentDidMount() {
    this._getCoinAndAmount();
    this.searchCoinAddress(this.state.selectCurrency);
  }


  _getCoinAndAmount() {
    getCoinAndAmount().then(res => {
      if (res.data.status === 200) {
        this._setCoinList(res.data.data);
      }
    }).catch(err => {
      console.log(err)
    })
  }

  _setCoinList(list) {
    let coinList = list.map(item => {
      return { label: item.coinCode, value: item.coinCode }
    })
    this.setState({
      coinList: coinList
    })
  }

  searchCoinAddress(coin) {
    if (coin == '请选择') {
      this.setState({
        addrList: []
      })
      return false
    }
    getCoinAddress(coin).then(resp => {
      if (resp.data.status === 200) {
        this.setState({
          addrList: resp.data.data
        })
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
    })
  }

  _delAddr(addr) {
    this.setState({
      confirmDel: true,
      chooseAdd: addr
    })
  }

  _closeConfirmDel() {
    this.setState({
      confirmDel: false
    })
  }

  _okToDel() {
    let { chooseAdd } = this.state, req = {
      drawAdd: chooseAdd.drawAdd,
      coinCode: chooseAdd.coinCode
    };
    (chooseAdd.coinCode == 'EOS' || chooseAdd.coinCode == 'XRP') ? req.tag = chooseAdd.tag : ''
    delCoinAddress(req).then(resp => {
      if (resp.data.status === 200) {
        message.success('删除成功');
        this.searchCoinAddress(chooseAdd.coinCode);
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
    })
    this._closeConfirmDel();
  }

  _closeGoogle() {
    this.setState({
      isShowModalGoogle: false
    })
  }

  changeGoogle(name, value) {
    this.setState({
      googleCode: value
    })
  }

  googleOnOk() {
    if (!this.state.googleCode) {
      message.error('请输入谷歌验证码');
      return false;
    }
    return this.addressAdd();
  }

  _closeSms() {
    this.setState({
      isShowModalSms: false
    })
  }

  changeSms(name, value) {
    this.setState({
      mobileCode: value
    })
  }

  smsOnOk() {
    return this.addressAdd();
  }

  addressAdd() {
    let { type } = this.state;
    let req = {
      codeType: 10,
      coinCode: this.state.selectCurrency,
      drawAdd: this.state.addVal,
      remarks: this.state.remark,
      tag: this.state.tag,
      type: this.state.type
    }
    if (type == 2) {
      req.googleCode = this.state.googleCode
    } else {
      req.mobile = this.props.userMsg.mobile;
      req.mobileCode = this.state.mobileCode;
    }
    return addCoinAddress(req).then(resp => {
      if (resp.data.status === 200) {
        message.success('添加成功');
        this.searchCoinAddress(this.state.selectCurrency);
        this.setState({
          addVal: '',
          remark: '',
          tag: ''
        })
        return true;
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
      return false;
    })
  }



  render() {
    const { selectCurrency, addVal, tag, remark, codeVal, showTelCode, coinList, addrList, confirmDel, isShowModalGoogle, isShowModalSms } = this.state;
    return (
      <div className="withdraw-addr" style={{ backgroundColor: "#162345" }}>
        <h2 className="title">
          <i className="line"></i>
          <span>提币地址</span>
        </h2>
        <div className="add-addr">
          <div className='add-addr-inp'>
            <div className='select-gulp-single'>
              <p>币种：</p>
              <Select defaultValue="请选择" style={{ width: 120 }} onChange={this.change}>
                <Option value="请选择">请选择</Option>
                {coinList ?
                  coinList.map((item) => {
                    return (
                      <Option key={item.coinCode} value={item.value}>{item.label}</Option>
                    )
                  }) : ''
                }
              </Select>
            </div>
            <div className='add-addr-inp-group'>
              <span>地址：</span>
              <div className="addr-input" style={{ marginRight: 5 }}>
                <HInput type="text" value={addVal} changeVal={(name, addVal) => this.setState({ addVal })} />
              </div>
            </div>
            <div className='add-addr-inp-group'>
              <span>备注：</span>
              <div className="remark-input" style={{ paddingRight: "10px" }}>
                <HInput type="text" value={remark} changeVal={(name, remark) => this.setState({ remark })} />
              </div>
            </div>

            {(selectCurrency == 'EOS' || selectCurrency == 'XRP') &&
              <div className='add-addr-inp-group'>
                <span>标签：</span>
                <div className="tag-input" style={{ paddingRight: "10px" }}>
                  <HInput type="text" value={tag} changeVal={(name, tag) => this.setState({ tag })} />
                </div>
              </div>
            }
            {(selectCurrency !== 'EOS' && selectCurrency !== 'XRP') &&
              <div className='add-addr-inp-group'>
                <HButton type="sell" text="添加" onClick={this.addWithdraw} />
              </div>
            }
          </div>
          {(selectCurrency == 'EOS' || selectCurrency == 'XRP') &&
            <div className='addr-btn'>
              <HButton type="sell" text="添加" onClick={this.addWithdraw} />
            </div>
          }
        </div>
        <div className='data-list'>
          <div className='list-header'>
            <p>币种</p>
            <p>提币地址</p>
            <p>备注</p>
            <p>操作</p>
          </div>
          <ul>
            {(addrList && addrList.length) > 0 ?
              addrList.map((item, index) => {
                return <li key={index}>
                  <p>{item.coinCode}</p>
                  <p>
                    <span className='addrCodeWrap'>
                      <img className='addrIcon' src={codeIcon} alt='' style={{ width: 14, height: 14 }} />
                      <span className='addrCode'>
                        <img src={`http://qr.liantu.com/api.php?text=${item.drawAdd}`} alt='' style={{ width: 88, height: 88 }} />
                      </span>
                    </span>
                    <span className="addr-group">
                      <span>{item.drawAdd}</span>
                      {(selectCurrency == 'EOS' || selectCurrency == 'XRP') &&
                        <span>
                          地址标签：{item.tag}
                        </span>
                      }
                    </span>
                  </p>
                  <p>{item.remarks}</p>
                  <p onClick={this._delAddr.bind(this, item)}>删除</p>
                </li>
              })
              :
              <li><div>暂无数据</div></li>
            }
          </ul>
        </div>
        {
          showTelCode &&
          <div className="shade">
            <div className="tel-code">
              <h2>短信验证码</h2>
              <div className="code-input">
                <HInput type="number" value={codeVal} changeVal={(name, codeVal) => this.setState({ codeVal })} />
                <span onClick={this.getCode}>获取验证码</span>
              </div>
              <HButton type="sell" text="确定" size="big" onClick={this.sendCode} />
              <i className="iconfont icon-guanbi" onClick={() => this.setState({ showTelCode: false })}></i>
            </div>
          </div>
        }
        {
          confirmDel &&
          <Modal isShowButton={false} onClose={this._closeConfirmDel} className='confirmDel'>
            <p>确认删除地址？</p>
            <div className='hasBtn'>
              <HButton size='middle' type="sell" text="确定" onClick={this._okToDel} style={{ marginRight: 28, width: 180 }} />
              <HButton size='middle' text="取消" onClick={this._closeConfirmDel} style={{ width: 180, border: 'solid 1px #993E32', color: '#993E32', fontSize: 14 }} />
            </div>
          </Modal>
        }
        <GoogleValidate isShow={isShowModalGoogle} onClose={this._closeGoogle} changeGoogle={this.changeGoogle} onOk={this.googleOnOk} />
        <SmsValidate codeType={10} isShow={isShowModalSms} onClose={this._closeSms} changeGoogle={this.changeSms} onOk={this.smsOnOk} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    userMsg: state.userMsg.userMsg
  }
}

export default connect(mapStateToProps)(WithdrawAddr);
