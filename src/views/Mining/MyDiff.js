import React from 'react';
import { autobind } from 'core-decorators';
import PropTypes from "prop-types";
import { Link } from 'react-router-dom';
import { getSingleSz } from 'js/http-req';
import DateSelect from 'components/DateSelect'
import { resetTime, timeSection } from 'js/common'
import './my_lock_diff.less';


@autobind
export default class Mining extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      DiffList: [],//历史挖矿难度列表
      startDate: null,
      endDate: null,
      tradeDate: null
    };
    this.req = {
      tradeDate: null,
      endDate: null
    }
  }
  componentWillMount() {
    this._getHisttoryListDiff()
  }
  //历史挖矿难度
  _getHisttoryListDiff() {
    getSingleSz('/v1/digging_user/history_difficulty', this.req).then((res) => {
      console.log(res.data, '_getHisttoryListDiff')
      if (res.data.status == 200) {
        this.setState({
          DiffList: res.data.data
        })
      }
    })
  }
  onChangeDate(dateStr, type) {
    this.setState({
      [type]: dateStr
    })
  }
  btnChange(time, type) {
    console.log(time, type)
    if (type == 'all') {
      this.setState({
        startDate: resetTime(new Date()),
        endDate: null,
      })
      this.req.tradeDate = null;
      this.req.endDate = null;
      this._getHisttoryListDiff(this.req)

    } else if (type == 'week' || type == 'month') {
      this.setState({
        startDate: resetTime(new Date()),
        endDate: time,
      })
      this.req.tradeDate = resetTime(new Date());
      this.req.endDate = time;
      this._getHisttoryListDiff(this.req)

    } else {
      this.setState({
        tradeDate: time
      })
      this.req.tradeDate = time;
      this.req.endDate = type;
      this._getHisttoryListDiff(this.req)
    }
  }


  //监听分页
  onChangePage(page, pageSize) {
    console.log(page)
  }
  render() {
    const { DiffList, startDate, endDate, tradeDate } = this.state;
    return (
      <div className="mining container">
        <Link to='/mining' className="toHistory">返回上一页<i className='iconfont icon-fanhui'></i></Link>
        <div className="lockDiff-right">
          <div className="lockDiff-right-select lockDiff-singleSelect">
            <DateSelect isGlup={false} startDate={startDate} endDate={endDate} change={this.onChangeDate} btnChange={this.btnChange} />
          </div>
          <ul className="lockDiff-right-title">
            <li>时段({tradeDate?tradeDate:'全部'})</li>
            <li>基准难度</li>
            <li>我的挖矿难度</li>
          </ul>
          <div className="lockDiff-right-wrap">
            {
              DiffList && JSON.stringify(DiffList) !== '[]' ?
                DiffList.map((item, index) => {
                  return (
                    <ul className="lockDiff-right-single" key={index}>
                      <li>{timeSection(item.tradeHour)}</li>
                      <li>{item.diggingDifficulty}</li>
                      <li>{item.diggingAmountLimit}</li>
                    </ul>
                  )
                }) : <p className="notData">暂无数据</p>
            }
          </div>
        </div>

      </div>
    )
  }
}
