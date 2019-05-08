import React, { Component } from 'react';
import { autobind } from 'core-decorators';
import HButton from 'components/HButton';
import { getSingleSz, getMyNode, getPositionList, applyNode, getNodeList, applyUnFreezeNode, getNodeUnit, getNodeWater } from 'js/http-req';
import { getDecimal } from 'js';
import { Modal } from 'components/Modal';
import LineInput from 'components/LineInput';
import { message, Pagination, Tabs, Tooltip, Button } from 'antd';
import { showTimeNeed } from 'js/common';
import './style.less';
import { math } from 'sprite-core';

const TabPane = Tabs.TabPane;

@autobind
export default class DigitalNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nowNode: 0,
      nodeAmount: 0,//平台总节点
      freeze: 0,
      mySz: 0,
      isShowApply: false,
      applyNum: '',
      nodeList: [],
      nodeWater: [],
      total: 0,
      totalWater: 0,
      current: 1,
      isShowtuichu: false,
      freezeNo: '',
      nodeUnit: '',
      toolTipText: '',
      isCifr: false,//点击确定按钮
    };
  }

  componentDidMount() {
    this._init();


  }

  _init() {
    this._getMyNode();
    this._getMySz();
    this._getNodeList();
    this._getAllNode();
  }

  _getNodeWater() {
    this.setState({
      current: 1
    })
    let req = {
      pageNo: 1,
      pageSize: 7
    }
    getNodeWater(req).then(res => {
      if (res.data.status == 200) {
        this.setState({
          nodeWater: res.data.data.list,
          totalWater: res.data.data.total
        })
      }
    }).catch(err => {
      console.log(err.data);
    })
  }

  _getNodeList() {
    this.setState({
      current: 1
    })
    let req = {
      pageNo: 1,
      pageSize: 7
    }
    getNodeList(req).then(res => {
      if (res.data.status == 200) {
        this.setState({
          nodeList: res.data.data.list,
          total: res.data.data.total
        })
      }
    }).catch(err => {
      console.log(err.data);
    })
  }

  _getMySz() {
    let seq = {
      coinCode: 'SZ',
      pageSize: 1000,
      pageNo: 1
    }
    getPositionList(seq).then(res => {
      if (res.data.status == 200) {
        console.log(res.data.data.list, 'res.data.data.list')
        this.setState({
          mySz: res.data.data.list[0].currentAmount
        })
      }
    })
  }

  _getMyNode() {
    getMyNode().then(res => {
      if (res.data.data && res.data.status == 200) {
        this.setState({
          nowNode: res.data.data.nodeAmount,
          freeze: res.data.data.nodeFreezeAmount
        })
      }
    }).catch(err => {
      console.log(err.data);
    })
  }

  _getNodeUnit() {
    getNodeUnit().then(res => {
      if (res.data.status == 200) {
        this.setState({
          nodeUnit: res.data.data.keyValue
        })
      }
    })
  }
  //获取平台所有数字节点
  _getAllNode() {
    getSingleSz('/v1/freeze_total/ex_count').then(res => {
      if (res.data.status == 200) {
        console.log(res.data.data, 'ex_count')
        this.setState({
          nodeAmount: res.data.data.nodeAmount
        })

      }
    }).catch(err => {
      message.error(err.data.message)
    })
  }

  inputHandler(name, value) {
    this.setState({
      [name]: value
    })
  }

  _showApply() {
    this._getNodeUnit();
    this.setState({
      isShowApply: true,
      isCifr: false
    })
  }
  _showtuichu(freeze) {
    this.setState({
      isShowtuichu: true,
      freezeNo: freeze.id,
      nodeSurplus: freeze.nodeSurplus,
      applyUnfreezeAmount: freeze.applyUnfreezeAmount,
      isCifr: false
    })
  }

  _onCloseApply() {
    this.setState({
      applyNum: '',
      isShowApply: false
    })
  }
  _onClosetuichu() {
    this.setState({
      applyNum: '',
      isShowtuichu: false,
      freezeNo: ''
    })
  }

  _submitApply() {
    let { nodeUnit, mySz } = this.state;
    if (this.state.applyNum == '') {
      message.warning('请输入申请的节点数');
      return false
    }
    if (this.state.applyNum == 0) {
      message.warning('请输入申请的节点数');
      return false
    }
    if (this.state.applyNum * nodeUnit > mySz) {
      message.warning('SZ余额不足');
      return false
    }
    if (this.state.isCifr) {
      let seq = {
        nodeAmount: this.state.applyNum
      }
      applyNode(seq).then(res => {
        if (res.data.status == 200) {
          message.success('申请成功');
          this._init();
          this._getNodeWater();
          this.setState({
            isShowApply: false,
            applyNum: ''
          })
        }
      }).catch(err => {
        message.error(err.data.message);
      })
    }

    this.setState({
      isCifr: true
    })
  }

  _submitTuichu() {
    if (this.state.applyNum == '' || this.state.applyNum == 0) {
      message.warning('请输入申请的节点数');
      return false
    }
    debugger
    if (this.state.applyNum > (this.state.nodeSurplus - this.state.applyUnfreezeAmount)) {
      message.warning('超过冻结节点数');
      return false
    }
    if (this.state.isCifr) {
      let seq = {
        freezeId: this.state.freezeNo,
        unfreezeNodeAmount: this.state.applyNum
      }
      applyUnFreezeNode(seq).then(res => {
        if (res.data.status == 200) {
          message.success('申请成功');
          this._init();
          this._getNodeWater();
          this.setState({
            isShowtuichu: false,
            freezeNo: '',
            applyNum: ''
          })
        }
      }).catch(err => {
        message.error(err.data.message);
      })
    }

    this.setState({
      isCifr: true
    })
  }

  onChangePage(page, pageSize) {
    this.setState({
      current: page
    })
    let req = {
      pageNo: page,
      pageSize: pageSize
    }
    getNodeList(req).then(res => {
      if (res.data.status == 200) {
        this.setState({
          nodeList: res.data.data.list,
          total: res.data.data.total
        })
      }
    }).catch(err => {
      console.log(err.data);
    })
  }

  onChangePageWater(page, pageSize) {
    this.setState({
      current: page
    })
    let req = {
      pageNo: page,
      pageSize: pageSize
    }

    getNodeWater(req).then(res => {
      if (res.data.status == 200) {
        this.setState({
          nodeWater: res.data.data.list,
          totalWater: res.data.data.total
        })
      }
    }).catch(err => {
      console.log(err.data);
    })
  }

  _tabCallbak(key) {
    if (key == 2) {
      this._getNodeWater();
    }
    if (key == 1) {
      this._getNodeList();
    }
  }
  //倒计时间
  _showTimeNeed(end) {
    this.setState({
      toolTipText: showTimeNeed(end, '申请退出')
    })
  }

  render() {
    let { nowNode, nodeAmount, freeze, mySz, isShowApply, applyNum, nodeList, nodeWater, totalWater, total, current, isShowtuichu, nodeUnit, toolTipText, isCifr } = this.state;
    let now = new Date();
    return (
      <div className="digital-node">
        <div className='digital-head'>
          <h2 className='personalH2'>数字节点</h2>
          <div className='now-node'>
            <span>当前数字节点</span>
            <span>{nowNode}</span>
            <span>平台数字节点总数量：{nodeAmount}</span>
          </div>
          <div className='my-coin'>
            <div>
              <p>{getDecimal(freeze)} SZ</p>
              <p className='color-text'>冻结</p>
            </div>
            <div className='fenge'></div>
            <div>
              <p>{getDecimal(mySz)} SZ</p>
              <p className='color-text'>可用</p>
            </div>
          </div>

          <HButton text='申请数字节点' type='sell'
            onClick={this._showApply}
            style={{ width: 160, height: 42, position: 'absolute', right: '40px', bottom: '42px' }} />
        </div>

        <div className='record-list'>
          <Tabs defaultActiveKey="1" onChange={this._tabCallbak}>
            <TabPane tab="当前节点" key="1">
              <div className='tab-container1'>
                <div className='list-header'>
                  <p>申请时间</p>
                  <p>节点数量</p>
                  <p>申请退出数量</p>
                  <p>操作</p>
                </div>
                <ul className='list-ul'>
                  {
                    nodeList && nodeList.length > 0 ?
                      nodeList.map((item, index) => {
                        return <li key={index}>
                          <p>{item.freezeTime}</p>
                          <p>{item.nodeSurplus}</p>
                          <p>{item.applyUnfreezeAmount}</p>
                          {
                            new Date(item.allowApplyUnfreezeTime.replace(/\-/g, '/')).getTime() <= now.getTime() ?
                              <p> <span onClick={this._showtuichu.bind(this, item)}>申请退出</span> </p>
                              :
                              <p>
                                <Tooltip placement="leftBottom" mouseEnterDelay={0.1} mouseLeaveDelay={0.1} trigger='hover' title={toolTipText}>
                                  <span onMouseEnter={this._showTimeNeed.bind(this, item.allowApplyUnfreezeTime, '申请退出')}>查看</span>
                                </Tooltip>
                              </p>
                          }
                        </li>
                      })
                      :
                      <li style={{ textAlign: 'center', display: 'block' }}>暂无数据</li>
                  }
                </ul>
                <div className='szAll-page' style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                  <Pagination size="small" hideOnSinglePage defaultPageSize={7} current={current} defaultCurrent={1} total={total} onChange={this.onChangePage} />
                </div>
              </div>
            </TabPane>
            <TabPane tab="历史记录" key="2">
              <div className='tab-container2'>
                <div className='list-header'>
                  <p>申请时间</p>
                  <p>节点数量</p>
                  <p>SZ数量</p>
                  <p>类型</p>
                </div>
                <ul className='list-ul'>
                  {
                    nodeWater && nodeWater.length > 0 ?
                      nodeWater.map((item, index) => {
                        return <li key={index}>
                          <p>{item.freezeTime}</p>
                          <p>{item.nodeAmount}</p>
                          <p>{item.freezeAmount}</p>
                          <p>{item.freezeFlag == 1 ? '申请' : '退出'}</p>
                        </li>
                      })
                      :
                      <li style={{ textAlign: 'center', display: 'block' }}>暂无数据</li>
                  }
                </ul>
                <div className='szAll-page' style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                  <Pagination size="small" hideOnSinglePage defaultPageSize={7} current={current} defaultCurrent={1} total={totalWater} onChange={this.onChangePageWater} />
                </div>
              </div>
            </TabPane>
          </Tabs>

        </div>


        {
          isShowApply &&
          <Modal isShowButton={false} onClose={this._onCloseApply} className={'modal-apply' + (isCifr ? ' small-apply' : '')} title={isCifr ? '' : '输入数字节点'}>
            {isCifr ?
              <div>
                <p className='modal-apply-title'>确认申请<span>{applyNum}</span>个数字节点？</p>
                <HButton text='确认' onClick={this._submitApply} type='sell' style={{ width: 380, height: 46, margin: '0 auto', display: 'block', marginTop: 36 }} />
                <p className='color-p bottom-p'><span className='color-p2'>提示：</span>需要冻结{applyNum * 10}万个SZ</p>
              </div>
              : <div>
                <LineInput name='applyNum' onChange={this.inputHandler} value={applyNum} type='text' isCalc={'100000'} validate='number' propsStyle={{ width: 380, margin: '0 auto', marginTop: 50 }} />
                <div style={{ textAlign: 'center', margin: '18px 0 20px 0' }}>
                  <p className='color-p'>可用SZ余额</p>
                  <p className='color-p2'>{getDecimal(mySz)}</p>
                </div>
                <HButton text='确认' onClick={this._submitApply} type='sell' style={{ width: 380, height: 46, margin: '0 auto', display: 'block', marginTop: 36 }} />
                <p className='color-p2 bottom-p'><span>提示：</span>默认数字节点锁仓1个月，到期自然延期1个月，到期前3天，可以申请解锁</p>
              </div>
            }
          </Modal>
        }
        {
          isShowtuichu &&
          <Modal isShowButton={false} onClose={this._onClosetuichu} className={'modal-tuichu' + (isCifr ? ' small-apply' : '')} title={isCifr ? '' : '输入数字节点'}>
            {isCifr ?
              <div>
                <p className='modal-tuichu-title'>确认退出<span>{applyNum}</span>个数字节点？</p>
                <HButton text='确认' onClick={this._submitTuichu} type='sell' style={{ width: 380, height: 46, margin: '0 auto', display: 'block', marginTop: 36 }} />
                <p className='color-p bottom-p'><span className='color-p2'>提示：</span>退出数字节点将会失去相应的权益</p>
              </div>
              : <div>
                <LineInput name='applyNum' onChange={this.inputHandler} value={applyNum} type='text' isCalc={'100000'} validate='number' propsStyle={{ width: 380, margin: '0 auto', marginTop: 50 }} />
                <HButton text='确认' onClick={this._submitTuichu} type='sell' style={{ width: 380, height: 46, margin: '0 auto', display: 'block', marginTop: 36 }} />
                <p className='color-p bottom-p'><span className='color-p2'>提示：</span>退出数字节点将会失去相应的权益</p>
              </div>
            }
          </Modal>
        }
      </div>
    )
  }
}
