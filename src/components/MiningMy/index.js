import React from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import MiningNav from '../MiningNav';
import { Modal } from 'components/Modal';
import LineInput from 'components/LineInput';
import MinNotLogin from 'components/MinNotLogin';
import { Link } from 'react-router-dom';
import { message, Button, Tooltip } from 'antd';
import { getDecimal } from 'js';
import { allAxios, getMinSuocang, getSingleSz, postSingleSz, getMoreSz, getPositionList } from 'js/http-req';
import { coinSplice, showTimeNeed, timeSection, resetDate, showNum } from 'js/common';
import './style.less';

@autobind
class MiningMy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navIndex: 0,
      Text: '我的收益',
      mySuoCang: 0,
      isShowApply: false,
      isShowtuichu: false,
      applyNum: '',
      mySz: '',
      lockUnit: '',
      lockAllNum: {},
      myOrderMining: {},//我的挂单挖矿
      isLock: true,//判断锁仓还是解锁
      unlockData: {},//当前锁仓的数据用于判断解锁数量
      isCifr: false,//点击确定按钮
      toolTipText: '',//倒计时
      MyEarnings: {},//我的收益
      lockList: {},//锁仓列表
      keyValueDiff: null,//基准难度
      dataDiff: null,//当前难度 
      DiffList: [],//历史挖矿难度列表
    };
    this.titleArr = [
      { name: '我的收益' },
      { name: '我的锁仓' },
      { name: '我的难度' },
    ];
    this.reqData = {
      pageNo: 1,
      pageSize: 3,
    }
  }

  componentDidMount() {
    this.navHandle(this.state.navIndex)
  }


  _getMySz() {
    let seq = {
      coinCode: 'SZ',
      pageSize: 1000,
      pageNo: 1
    }
    getPositionList(seq).then(res => {
      if (res.data.status == 200) {
        this.setState({
          mySz: res.data.data.list[0].currentAmount
        })
      }
    })
  }
  navHandle(index) {
    this.setState({
      navIndex: index
    }, () => {
      if (this.props.userMsg) {
        if (index == 0) {
          this._getMyEarnings()
        } else if (index == 1) {
          this._getMoreSz()
          this._getMySz()
        } else if (index == 2) {
          this._getDiffData();
          this._getDiffNum();
          this._getHisttoryListDiff();
        }
      }
    })
  }
  //我的收益
  _getMyEarnings() {
    getSingleSz('/user_profit/get_profit_total').then((res) => {
      console.log(res.data, 'MyEarnings')
      this.setState({
        MyEarnings: res.data.data
      })
    })
  }
  //锁仓总量&&锁仓历史
  _getMoreSz() {
    getMoreSz({ url: '/v1/freeze_total/user_count' },
      { url: '/v1/freeze_lock/lock_list', req: this.reqData }).then(allAxios.spread((res, res1) => {
        this.setState({
          lockAllNum: res.data.data,
          lockList: res1.data.data
        })
      }))
  }
  //锁仓总量
  _getLockAll() {
    getSingleSz('/v1/freeze_total/user_count').then((res) => {
      console.log(res.data)
      this.setState({
        lockAllNum: res.data.data
      })
    })
  }

  //锁仓历史
  _getLockList(req) {
    getSingleSz('/v1/freeze_lock/lock_list', req).then((res) => {
      console.log(res.data, '_getLockList')
      if (res.data.status == 200) {
        this.setState({
          lockList: res.data.data
        })
      }
    })
  }

  //基准难度
  _getDiffData() {
    getSingleSz('/v1/config/standard_difficulty').then((res) => {
      console.log(res.data)
      this.setState({
        keyValueDiff: res.data.data.keyValue
      })
    })
  }
  //当前难度
  _getDiffNum() {
    getSingleSz('/v1/digging_user/current_difficulty').then((res) => {
      console.log(res.data, 'num')
      this.setState({
        dataDiff: res.data.data
      })
    })
  }

  //历史挖矿难度
  _getHisttoryListDiff() {
    getSingleSz('/v1/digging_user/history_difficulty', this.reqData).then((res) => {
      console.log(res.data, '_getHisttoryListDiff')
      if (res.data.status == 200) {
        this.setState({
          DiffList: res.data.data.slice(0, 3)
        })
      }
    })
  }


  //显示锁仓&解锁弹窗
  _showApply(Is, data) {
    if (Is) {
      this._getMinSuocang();
      this.setState({
        isShowApply: true,
        applyNum: '',
        isLock: Is,
        isCifr: false
      })
    } else {
      this.setState({
        isShowApply: true,
        applyNum: '',
        isLock: Is,
        unlockData: data,
        isCifr: false
      })
    }

  }
  //关闭锁仓&解锁弹窗
  _onCloseApply() {
    this.setState({
      isShowApply: false,
      isLock: true,
      unlockData: {}
    })
  }
  //
  _getMinSuocang() {
    getMinSuocang().then(res => {
      if (res.data.status == 200) {
        this.setState({
          lockUnit: res.data.data.keyValue
        })
      }
    }).catch(err => {
      console.log(err.data)
    })
  }
  //监听input输入框
  inputHandler(name, value, params) {
    console.log(value)
    this.setState({
      applyNum: value
    })
  }
  //弹窗的确定按钮
  confirmHandle(isLock, num, data) {
    let reg = /^[0-9]{1,}$/g, isTrue = reg.test(num)
    if (isTrue) {
      if (isLock) {
        if (this.state.mySz < num * 10000) {
          message.warning('锁仓总量不得大于可用sz量！')
          return
        }
        if (this.state.isCifr) {
          this._submitApply(num)
        }
      } else {
        console.log(data)
        if (data.freezeSurplus < num * 10000) {
          message.warning('解锁数量不得大于锁仓数量！')
          return
        }
        if (this.state.isCifr) {
          this._unlock(num, data)
        }

      }
      this.setState({
        isCifr: true
      })
    } else {
      message.warning(`输入${isLock ? '锁仓' : '解锁'}数量有误！`)
    }


  }

  //点击锁仓确定按钮
  _submitApply(lockNum) {
    let reg = /^[0-9]{1,}$/g, isTrue = reg.test(lockNum)
    if (isTrue) {
      postSingleSz('v1/freeze_lock/do_freeze', { freezeAmount: lockNum * 10000 }).then((res) => {
        if (res.data.status == 200) {
          this.setState({
            isShowApply: false
          })
          message.success('锁仓成功！')
          this._getMoreSz()
        }
      }).catch(err => {
        message.error(err.data.message);
      })
    } else {
      message.warning('输入锁仓数量有误！')
    }
  }
  //点击解锁确定按钮
  _unlock(num, data) {
    postSingleSz('v1/freeze_lock/do_unfreeze', { unfreezeAmount: num * 10000, freezeId: data.id }).then(res => {
      if (res.data.status == 200) {
        this.setState({
          isShowApply: false
        })
        message.success('解锁锁成功！')
        this._getMoreSz()
      }
    }).catch(err => {
      message.error(err.data.message)
    })
  }
  //倒计时间
  _showTimeNeed(end) {
    this.setState({
      toolTipText: showTimeNeed(end, '解锁')
    })
  }
  render() {
    const { navIndex, isShowApply, applyNum, lockUnit, MyEarnings, myOrderMining, isCifr, lockAllNum, lockList, isLock, unlockData, toolTipText, keyValueDiff, dataDiff, DiffList } = this.state;
    let now = new Date();
    return (
      <div className="mine-my">
        <MiningNav titleArr={this.titleArr} onChange={this.navHandle} />
        {
          !this.props.userMsg &&
          <MinNotLogin text={navIndex == 0 ? '我的收益' : navIndex == 1 ? '我的锁仓' : '我的难度'} />
        }
        {
          navIndex == 0 && this.props.userMsg &&
          <div className='my-income-content'>
            <div>
              <p>昨日总收益累计折合(BTC)</p>
              <p>{coinSplice(MyEarnings.lastProfitBtc, 8)}</p>
              <p>历史总收益累计：</p>
              <p>{coinSplice(MyEarnings.profitSumBtc, 8)}</p>
            </div>
            <div>
              <p>昨日分红收益折合(BTC)</p>
              <p>{coinSplice(MyEarnings.lastDividendProfitBtc, 8)}</p>
              <p>历史分红收益：</p>
              <p>{coinSplice(MyEarnings.dividendProfitSumBtc, 8)}</p>
            </div>
            <div>
              <p>昨日交易挖矿收益(SZ)</p>
              <p>{coinSplice(MyEarnings.lastDiggingProfitSz, 2)}</p>
              <p>历史交易挖矿收益：</p>
              <p>{coinSplice(MyEarnings.diggingProfitSumSz, 2)}</p>
            </div>
            <div>
              <p>昨日返佣收益(SZ)</p>
              <p>{coinSplice(MyEarnings.lastInvitationProfitSz, 2)}</p>
              <p>历史返佣收益：</p>
              <p>{coinSplice(MyEarnings.invitationProfitSumSz, 2)}</p>
            </div>
          </div>
        }
        {
          navIndex == 1 && this.props.userMsg &&
          <div className="myDiff">
            <ul className="myDiff-left">
              <li><i className='iconfont icon-jiesuo lock'></i>当前锁仓(SZ)</li>
              <li>{lockAllNum ? lockAllNum.lockAmount : '--'}</li>
              <li><p className="lockBtn" onClick={() => this._showApply(true)}>锁仓</p></li>
            </ul>
            <div className="myDiff-right">
              <ul className="myDiff-right-title">
                <li>申请时间</li>
                <li>锁仓数量</li>
                <li>操作</li>
              </ul>

              {lockList.total ?
                lockList.list.map((item) => {
                  return (<ul className="myDiff-right-single" key={item.id}>
                    <li>{item.freezeTime}</li>
                    <li>{item.freezeSurplus}</li>
                    <li>{
                      new Date(item.unfreezeTime.replace(/\-/g, '/')).getTime() <= now.getTime() ?
                        <p className="lockHandle" onClick={() => this._showApply(false, item)}><i className='iconfont icon-jiesuo'></i>解锁</p>
                        :
                        <p className="lockHover">
                          <Tooltip placement="leftBottom" mouseEnterDelay={0.1} mouseLeaveDelay={0.1} trigger='hover' title={toolTipText}>
                            <span onMouseEnter={this._showTimeNeed.bind(this, item.unfreezeTime, '解锁')}>查看</span>
                          </Tooltip>
                        </p>
                    }
                    </li>
                  </ul>)
                }) : <p className="notData">暂无数据</p>}
              {lockList.total >= 3 ? <Link to='/my_lock' className="showMore">查看更多></Link> : <Link to='/my_lock' className="showMore">查看历史></Link>}
            </div>
          </div>
        }
        {
          navIndex == 2 && this.props.userMsg &&
          <div className="myDiff">
            <ul className="myDiff-left">
              <li>
                当前难度(SZ/小时)
              <p></p>
              </li>
              <li>{dataDiff}</li>
              <li>基准难度(SZ/小时)：{keyValueDiff}</li>
            </ul>
            <div className="myDiff-right">
              <ul className="myDiff-right-title">
                <li>时段({resetDate('/')})</li>
                <li>基准难度</li>
                <li>我的挖矿难度</li>
              </ul>
              {
                DiffList && JSON.stringify(DiffList) !== '[]' && Array.isArray(DiffList) ?
                  DiffList.map((item, index) => {
                    return (
                      <ul className="myDiff-right-single" key={index}>
                        <li>{timeSection(item.tradeHour)}</li>
                        <li>{item.diggingDifficulty}</li>
                        <li>{item.diggingAmountLimit}</li>
                      </ul>
                    )
                  }) : <p className="notData">暂无数据</p>
              }
              {DiffList.length >= 3 ? <Link to='/my_diff' className="showMore">查看更多></Link> : <Link to='/my_diff' className="showMore">查看历史></Link>}
            </div>
          </div>
        }
        {
          navIndex == 3 && this.props.userMsg &&
          <ul className="mining-order">
            <li>
              <p className='mining-order-title'>今日排名</p>
              <p className='mining-order-text'>{showNum(myOrderMining.rank)}</p>
              <p className='mining-order-title'>今日累计积分</p>
              <p className='mining-order-text'>{showNum(myOrderMining.point)}</p>
            </li>
            <li>
              <p className='mining-order-title'>昨日排名</p>
              <p className='mining-order-text'>{showNum(myOrderMining.yesterdayRank)}</p>
              <p className='mining-order-title'>昨日获得奖励(SZ)</p>
              <p className='mining-order-text'>{coinSplice(myOrderMining.yesterdayDiggingAmount, 2)}</p>
            </li>
            <li>
              <p className='mining-order-title'>历史奖励累计(SZ)</p>
              <p className='mining-order-text'>{coinSplice(myOrderMining.diggingAmountTotal, 2)}</p>
            </li>
          </ul>
        }
        {
          isShowApply &&
          <Modal isShowButton={false} onClose={this._onCloseApply} className={'modal-apply' + (isCifr ? ' small-apply' : '')}
            title={isCifr ? '' : (isLock ? '输入锁仓数量' : '输入解锁数量')}>
            {isCifr ?
              <div>
                <p className='modal-apply-title'>确认{isLock ? '锁仓' : '解锁'}<span>{applyNum * 10000}</span>个SZ？</p>
                <div className='btnGlup'>
                  <Button className='okBtn' onClick={() => this.confirmHandle(isLock, applyNum, unlockData)}>确认</Button>
                  <Button className='cancelBtn' onClick={this._onCloseApply}>取消</Button>
                </div>
              </div>
              :
              <div>
                <p className='modal-apply-subtitle'>{isLock ? '锁仓' : '解锁'}<span>&nbsp;{applyNum * 10000}&nbsp;</span>SZ</p>
                <LineInput name='applyNum' onChange={this.inputHandler} isCalc={'10000'} value={applyNum} type='text' validate='number' propsStyle={{ width: '100%', margin: '0 auto', marginTop: 50 }} />
                <div className='btnGlup'>
                  <Button className='okBtn' onClick={() => this.confirmHandle(isLock, applyNum, unlockData)}>确认</Button>
                  <Button className='cancelBtn' onClick={this._onCloseApply}>取消</Button>
                </div>
                <p className='color-p bottom-p'><span className='color-p2'>提示：</span>{isLock ? `参与交易挖矿至少锁仓${getDecimal(lockUnit)}SZ` : '解锁后会立即影响交易挖矿产出'}</p>
              </div>
            }
          </Modal>
        }
        {/* {
              isShowtuichu &&
              <Modal isShowButton={false} onClose={this._onClosetuichu} className='modal-tuichu' title='输入数字节点'>
                <LineInput name='applyNum' onChange={this.inputHandler} value={applyNum} type='text' validate='number' propsStyle={{ width: 380, margin: '0 auto', marginTop: 50 }} />
                <HButton text='确认' onClick={this._submitTuichu} type='sell' style={{ width: 380, height: 46, margin: '0 auto', display: 'block', marginTop: 36 }} />
                <p className='color-p bottom-p'><span className='color-p2'>提示：</span>退出数字节点将会失去相应的权益</p>
              </Modal>
            } */}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    userMsg: state.userMsg.userMsg
  }
}

export default connect(mapStateToProps)(MiningMy);

