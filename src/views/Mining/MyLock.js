import React from 'react';
import { autobind } from 'core-decorators';
import PropTypes from "prop-types";
import { Link } from 'react-router-dom';
import { getSingleSz, postSingleSz } from 'js/http-req';
import { Pagination, Tooltip, message, Button } from 'antd'
import LineInput from 'components/LineInput';
import { Modal } from 'components/Modal';
import DateSelect from 'components/DateSelect'
import { showTimeNeed, resetTime } from 'js/common';
import { Select } from 'antd'
import './my_lock_diff.less';

const Option = Select.Option;
@autobind
export default class Mining extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lockList: {},//锁仓列表
      toolTipText: '',//倒计时
      isShowApply: false,//解锁弹窗是否显示
      applyNum: '',//弹窗输入框的内容
      unlockData: {},//当前锁仓的数据用于判断解锁数量
      isCifr: false,//点击确定按钮
      pageKey: 'all',
      startDate: null,
      endDate: null,
      difSelect: 'lock'
    };
    this.req = {
      pageNo: 1,
      pageSize: 20,
      startDate: '',
      endDate: ''
    }
  }
  componentDidMount() {
    this._getLockList(this.req)
  }
  //锁仓记录
  _getLockList(req) {
    getSingleSz('/v1/freeze_lock/lock_list', req).then((res) => {
      console.log(res.data, '_getHisttoryListDiff')
      if (res.data.status == 200) {
        this.setState({
          lockList: res.data.data
        })
      }
    })
  }
  //解锁历史记录
  _getLocUnHiskList(req) {
    getSingleSz('/v1/freeze_lock/unlock_his', req).then((res) => {
      if (res.data.status == 200) {
        this.setState({
          lockList: res.data.data
        })
      }
    }).catch(err => {
      console.log(err.data)
    })
  }
  //锁仓历史记录
  _getLocHiskList(req) {
    getSingleSz('/v1/freeze_lock/lock_his', req).then((res) => {
      if (res.data.status == 200) {
        this.setState({
          lockList: res.data.data
        })
      }
    }).catch(err => {
      console.log(err.data)
    })
  }

  //显示锁仓&解锁弹窗
  _showApply(data) {
    this.setState({
      isShowApply: true,
      applyNum: '',
      unlockData: data,
      isCifr: false
    })
  }
  //关闭锁仓&解锁弹窗
  _onCloseApply() {
    this.setState({
      isShowApply: false,
      unlockData: {}
    })
  }
  //弹窗的确定按钮
  confirmHandle(num, data) {
    if (data.freezeSurplus < num * 10000) {
      message.warning('解锁数量不得大于锁仓数量！')
      return
    }
    if (this.state.isCifr) {
      this._unlock(num, data)
    }
    this.setState({
      isCifr: true
    })
  }
  //监听input输入框
  inputHandler(name, value, params) {
    console.log(value)
    this.setState({
      applyNum: value
    })
  }
  //点击解锁确定按钮
  _unlock(num, data) {
    console.log(num, data)
    num = num * 10000
    if (data.freezeAmount < num) {
      message.warning('解锁数量不得大于锁仓数量！')
    } else {
      postSingleSz('v1/freeze_lock/do_unfreeze', { unfreezeAmount: num, freezeId: data.id }).then(res => {
        if (res.data.status == 200) {
          this.setState({
            isShowApply: false
          })
          message.success('解锁锁成功！')
          this._getLockList(this.req)
        }
      }).catch(err => {
        console.log(err)
        message.error(err.data.message)
      })
    }
  }
  onChangeDate(dateStr, type) {
    this.req[type] = dateStr
    this.setState({
      [type]: dateStr
    })
  }
  btnChange(time, type) {
    if (type == 'all') {
      this.setState({
        startDate: null,
        endDate: null,
      })
      this.req.startDate = null;
      this.req.endDate = null;
    } else if (type == 'week' || type == 'month') {
      this.setState({
        startDate: time,
        endDate: resetTime(new Date()),
      })
      this.req.startDate = time;
      this.req.endDate = resetTime(new Date());
    } else {
      this.req.endDate = type;
      this.req.startDate = time;
    }
    if (this.state.difSelect == 'lock') {
      this._getLockList(this.req)
    } else if (this.state.difSelect == 'lockList') {
      this._getLocHiskList(this.req)
    } else if (this.state.difSelect == 'unlock') {
      this._getLocUnHiskList(this.req)
    }
  }

  handleTypeSelectChange(value) {
    this.setState({
      difSelect: value,
      pageKey: value,
      startDate: null,
      endDate: null
    })
    if (value == 'lock') {
      this._getLockList(this.req)
    } else if (value == 'lockList') {
      this._getLocHiskList(this.req)
    } else {
      this._getLocUnHiskList(this.req)
    }
  }
  //监听分页
  onChangePage(page, pageSize) {
    this.req.pageNo = page
    if (this.state.difSelect == 'lock') {
      this._getLockList(this.req)
    } else if (this.state.difSelect == 'lockList') {
      this._getLocHiskList(this.req)
    } else if (this.state.difSelect == 'unlock') {
      this._getLocUnHiskList(this.req)
    }
  }
  //倒计时间
  _showTimeNeed(end) {
    this.setState({
      toolTipText: showTimeNeed(end, '解锁')
    })
  }
  render() {
    const { startDate, endDate, lockList, toolTipText, isShowApply, applyNum, unlockData, isCifr, pageKey, difSelect } = this.state;
    let now = new Date();
    return (
      <div className="mining container">
        <Link to='/mining' className="toHistory">返回上一页<i className='iconfont icon-fanhui'></i></Link>
        <div className="lockDiff-right">
          <div className="lockDiff-right-select">
            <div className='select-gulp-single'>
              <p>类型：</p>
              <Select defaultValue="lock" style={{ width: 118 }} onChange={this.handleTypeSelectChange}>
                <Option value="lock">当前锁仓</Option>
                <Option value="lockList">锁仓记录</Option>
                <Option value="unlock">解锁记录</Option>
              </Select>
            </div>
            <DateSelect key={pageKey} startDate={startDate} endDate={endDate} change={this.onChangeDate} btnChange={this.btnChange} />
          </div>

          <ul className="lockDiff-right-title">
            <li>申请时间</li>
            <li>{
              difSelect == 'lock' ? '锁仓数量' : (difSelect == 'lockList') ? '未解锁数量' : '解锁数量'
            }</li>
            {
              difSelect == 'lock' ? <li>操作</li> : ''
            }
          </ul>
          <div className="lockDiff-right-wrap">
            {lockList.total ?
              lockList.list.map((item) => {
                return (<ul className="lockDiff-right-single" key={item.id}>
                  <li>{difSelect == 'lock' ? item.freezeTime : item.createTime}</li>
                  <li>{difSelect == 'lock' || difSelect == 'lockList' ? item.freezeSurplus : item.unfreezeAmount}</li>
                  {
                    difSelect == 'lock' ? <li>
                      {
                        new Date(item.unfreezeTime.replace(/\-/g, '/')).getTime() <= now.getTime() ?
                          <p className="lockHandle" onClick={() => this._showApply(item)}><i className='iconfont icon-jiesuo'></i>解锁</p>
                          :
                          <p className="lockHover">
                            <Tooltip placement="leftBottom" mouseEnterDelay={0.1} mouseLeaveDelay={0.1} trigger='hover' title={toolTipText}>
                              <span onMouseEnter={this._showTimeNeed.bind(this, item.unfreezeTime, '解锁')}>查看</span>
                            </Tooltip>
                          </p>
                      }
                    </li> : ''
                  }
                </ul>)
              }) : <p className="lockDiff-right-single notData">暂无数据</p>

            }
          </div>
          <div className='szAll-page' key={pageKey}>
            <Pagination size="small" total={lockList.total} hideOnSinglePage defaultPageSize={20} onChange={this.onChangePage}
              defaultCurrent={1} />
          </div>
        </div>
        {
          isShowApply &&
          <Modal isShowButton={false} onClose={this._onCloseApply} className={'modal-apply' + (isCifr ? ' small-apply' : '')} title={isCifr ? '' : '输入解锁数量'}>
            {isCifr ?
              <div>
                <p className='modal-apply-title'>确认解锁<span>{applyNum * 10000}</span>个SZ？</p>
                <div className='btnGlup'>
                  <Button className='okBtn' onClick={() => this.confirmHandle(applyNum, unlockData)}>确认</Button>
                  <Button className='cancelBtn' onClick={this._onCloseApply}>取消</Button>
                </div>
              </div>
              :
              <div>
                <p className='modal-apply-subtitle'>解锁<span>&nbsp;{applyNum * 10000}&nbsp;</span>SZ</p>
                <LineInput name='applyNum' onChange={this.inputHandler} isCalc={'10000'} value={applyNum} type='text' validate='number' propsStyle={{ width: '100%', margin: '0 auto', marginTop: 50 }} />
                <div className='btnGlup'>
                  <Button className='okBtn' onClick={() => this.confirmHandle(applyNum, unlockData)}>确认</Button>
                  <Button className='cancelBtn' onClick={this._onCloseApply}>取消</Button>
                </div>
                <p className='color-p bottom-p'><span className='color-p2'>提示：</span> 解锁后会立即影响交易挖矿产出</p>
              </div>
            }
          </Modal>
        }
      </div>
    )
  }
}
