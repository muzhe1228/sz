import React from 'react';
import { connect } from 'react-redux';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Modal from 'components/Modal';
import { toFixedNum, walletAllPric, searchList, coinSplice } from 'js/common'
import SockMgr, { C_SOCKET_CMDS } from "js/socket";
import { getPositionList, rechargeAddress, getPositionAll, getWithdrawHandFee, getCoinAddress } from 'js/http-req'
import { Input, Checkbox, Table, Icon, message } from 'antd';
import { browser } from 'src';
import { Withdraw, Withdraw1 } from 'components/Modals';
import CountUp from 'react-countup';
import './style.less';

import codeIcon from 'images/smallCode.png'
const initGeetest = window.initGeetest, Search = Input.Search;
@autobind
class MyWallet extends React.Component {
  static contextTypes = {
    lang: PropTypes.string,
    tradeInfo: PropTypes.object
  };
  constructor(props, context) {
    super(props, context);
    this.symbols = [];

    this.state = {
      ticks: {},
      ticksBtc: {},
      isShowWith: false,
      isShowWith1: false,
      fee: '',
      addrList: []
    };
    this.timer = null
  }

  state = {
    listData: null,
    filteredInfo: null,
    sortedInfo: null,
    address: '',
    allNum: [],//持有币的总数量
    searchVal: ''
  }

  componentWillMount() {
    SockMgr.exTickBtcSend()
    SockMgr.on(C_SOCKET_CMDS.exTick, this.onTick);
    SockMgr.on(C_SOCKET_CMDS.exTicBTC, this.onTicksBtc);
    this.onTick(SockMgr.getExchangeData());
    this.onTicksBtc(SockMgr.getExTicBTCData());
  }
  onTick(data) {
    this.setState({ ticks: data });
  }
  onTicksBtc(data) {
    this.setState({ ticksBtc: data });
  }
  componentDidMount() {
    this._getPositionAll()

  }
  //监听是否隐藏小额按钮
  onChangeCheck(e) {
    this._getPositionAll(e.target.checked)
  }

  // 获取所有币种并和账户币种合并(是否隐藏小额 true是、默认false)
  _getPositionAll(isShow) {
    let req = {}, _this = this;
    getPositionAll(req).then((allRes) => {
      let subReq = { pageSize: 1000, pageNo: 1 }, _this = this;
      getPositionList(subReq).then((res) => {
        let List = [], List1 = []
        res.data.data.list.forEach((item, isPush) => {
          allRes.data.data.forEach((item1, index) => {
            item1.userId = item.userId
            if (item.coinCode == item1.coinCode) {
              item1.amount = item.amount;
              item1.currentAmount = item.currentAmount;
              item1.enableAmount = item.enableAmount;
              item1.frozenAmount = item.frozenAmount;
            }
          })
        });
        let restList = allRes.data.data.concat()
        restList.forEach((item, index) => {
          if (!item.enableAmount) {
            List1.push(item)
          } else {
            List.push(item)
          }
        })
        List1 = List.concat(List1)
        _this.setState({
          listData: isShow ? List : List1,
          allNum: List
        })
      })
    })
  }

  //搜索币种
  searchCoinInp(e) {
    e.persist()
    let _this = this
    _this.timer = setTimeout(() => {
      _this.setState({
        searchVal: e.target.value
      })
    }, 300)
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
    SockMgr.off(C_SOCKET_CMDS.exTicBTC, this.onTicksBtc);
    SockMgr.off(C_SOCKET_CMDS.tick, this.onTick);
  }

  _rechargeAddress(value) {
    return rechargeAddress({ coinType: value, userId: this.props.userMsg.userId }).then(resp => {
      if (resp.data.status === 200) {
        return resp.data.data;
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
    })
  }

  async _showRecharge(record) {
    if (record.isrecharge == 0) {
      message.error('该币种暂不支持充值');
      return false;
    }
    let address = await this._rechargeAddress(record.coinCode);
    console.log(address)
    let div =
      <div style={{ padding: '48px 40px', fontSize: 14 }}>
        <p style={{ marginBottom: 16 }}>向如下地址充值(<span>{record.coinCode}</span>)</p>
        <p>{address.rechargeAdd}</p>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 37, paddingBottom: 47 }}>
          <img src={address.rechargeAdd ? `http://qr.liantu.com/api.php?text=${address.rechargeAdd}` : ''} alt='' style={{ width: 180, height: 180 }} />
        </div>
        {
          (record.coinCode == "EOS" || record.coinCode == "XRP") ? <div className='eosMark'>
            <p>{record.coinCode}充值标签：</p>
            <p>{address.tag}</p>
            <p className='eosCode'>
              <img className='eosCode-icon' src={codeIcon} alt='' style={{ width: 15, height: 15 }} />
              <span className='eosCode-code'>
                <span className='eosCode-code-jiao'></span>
                <img src={address.tag?`http://qr.liantu.com/api.php?text=${address.tag}`:''} alt='' style={{ width: 150, height: 150 }} />
              </span>
            </p>
          </div> : ''
        }

        <p style={{ color: '#BF5546', marginBottom: 12 }}>温馨提示：</p>
        <p className='chongzhi-notice'>请勿向上述地址充值任何非 {record.coinCode} 资产，否则资产将不可找回。</p>
        <p className='chongzhi-notice'>您充值至上述地址后，需要整个网络节点的确认。</p>
        <p className='chongzhi-notice'>您的充值地址不会经常改变，可以重复充值；如有更改，我们会尽量通过网站公告或邮件通知您。</p>
        <p className='chongzhi-notice'>请务必确认设备及浏览器安全，防止信息被篡改或泄露。</p>
      </div>
    Modal.show({
      title: '充值',
      content: div,
      isShowButton: false,
    })
  }

  async _showWithdraw(record, type) {
    if (record.isdraw == 0) {
      message.error('该币种暂不支持提现');
      return false;
    }
    if (!record.currentAmount) {
      message.error('账户资金不足,请充值');
      return false;
    }
    if (!this.props.userMsg.isTradePwd) {
      message.warning('请先设置支付密码');
      return false;
    }
    if (this.props.userMsg.seniorAuth !== 3) {
      Modal.show({
        title: '提示',
        content: <div style={{ fontSize: 14, textAlign: 'center', padding: 65 }}>请先完成<span style={{ color: '#993E32' }}>高级实名认证</span>，才可完成此项操作！</div>,
        okText: '去认证',
        onOk: (cb) => { browser.push('/user_center/identification'); cb(true) },
      })
    } else {
      await this._getWithdrawHandFee(record);
      await this.searchCoinAddress(record.coinCode);
      if (type) {
        this.setState({
          isShowWith1: true,
          chooseCoin: record
        })
      } else {
        this.setState({
          isShowWith: true,
          chooseCoin: record
        })
      }
    }
  }

  searchCoinAddress(coin) {
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

  _getWithdrawHandFee(record) {
    this.setState({
      fee: ''
    })
    getWithdrawHandFee({ coinCode: record.coinCode }).then(resp => {
      if (resp.data.status === 200) {
        this.setState({
          fee: resp.data.data[0].data
        })
      }
    }).catch(err => {
      message.error(err.data.message)
    })
  }

  _closeShowWith() {
    this.setState({
      isShowWith: false,
      isShowWith1: false,
    })
  }

  render() {
    const { listData, ticks, ticksBtc, allNum, searchVal, isShowWith, isShowWith1, chooseCoin, fee, addrList } = this.state;
    let allPic = 0
    console.log(listData)
    if (ticks.CNY) {
      allPic = walletAllPric(allNum, ticks.CNY, ticksBtc)
    }
    return (
      <div className="my-wallet">
        <div className="my-asset" style={{ backgroundColor: " #162345" }}>
          <h2 className="userCenterav">总资产估值</h2>
          <div className="all-currency">
            <div className="all-currency-l">
              <h4>≈&nbsp;{allPic}CNY</h4>
              <p className='all-currency-l-bot'>实时汇率：BTC/CNY={ticks.CNY ? ticks.CNY.BTC.toFixed(2) : ''}</p>
            </div>
          </div>
        </div>
        <div className="my-wallet-wrap">
          <div className="my-wallet-wrap-top">
            <h2 className="userCenterav">总资产估值</h2>
            <div className='my-wallet-wrap-top-handle'>
              <Search
                className='wallSearch'
                placeholder="请输入币种名称"
                onChange={this.searchCoinInp}
              // onSearch={value => console.log(value)}
              />
              <Checkbox onChange={this.onChangeCheck}>隐藏小额资产</Checkbox>
              <div className='wallIcon'>
                <Icon type="question-circle" className='wallIcon-Icon' />
                <p className='wallIcon-hover'>估值等于 0BTC 资产</p>
              </div>
            </div>
          </div>
          <div className='my-wallet-wrap-list'>
            {/* <Table className='my-wallet-wrap-list-body' columns={columns} pagination={false} dataSource={listData}
                   onChange={this.handleChange}/> */}
            <div className='userCenter-list'>
              <ul className='userCenter-list-title'>
                <li>币种</li>
                <li>可用</li>
                <li>冻结</li>
                <li>≈折合(CNY)</li>
                <li>操作</li>
              </ul>
              {listData ?
                listData.map((item, index) => {
                  return (
                    <ul key={item.coinCode} className={"userCenter-list-single" + (searchList(searchVal, item.coinCode) ? " hide" : "")}>
                      <li>{item.coinCode}</li>
                      <li>{coinSplice((item.currentAmount ? item.currentAmount : 0), item.coinPrecision)}</li>
                      <li>{coinSplice((item.frozenAmount ? item.frozenAmount : 0), item.coinPrecision)}</li>
                      <li>{ticks.CNY && toFixedNum((item.currentAmount + item.frozenAmount), ticks.CNY[item.coinCode], ticksBtc[item.coinCode], ticks.CNY.BTC)}</li>
                      <li>
                        <span className='table-handle'>
                          <a href="javascript:;" onClick={this._showRecharge.bind(this, item)}>充币</a>
                          <a href="javascript:;" onClick={this._showWithdraw.bind(this, item, 0)}>提币</a>
                          <a href="javascript:;" onClick={this._showWithdraw.bind(this, item, 1)}>站内转账</a>
                        </span>
                      </li>
                    </ul>
                  )
                }) : '暂无数据'

              }
            </div>
          </div>

        </div>
        <Withdraw isShow={isShowWith} onClose={this._closeShowWith} chooseCoin={chooseCoin} fee={fee} addrList={addrList} onOK={this._getPositionAll} />
        <Withdraw1 isShow={isShowWith1} onClose={this._closeShowWith} chooseCoin={chooseCoin} onOK={this._getPositionAll} />
        {/* <AllShade></AllShade> */}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userMsg: state.userMsg.userMsg
  }
}
export default connect(mapStateToProps)(MyWallet);
