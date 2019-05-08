import React from 'react';
import { autobind } from 'core-decorators';
import { connect } from "react-redux";
import propTypes from 'prop-types';
import DateSelect from 'components/DateSelect'
import MinNotLogin from 'components/MinNotLogin';
import { Pagination } from 'antd'
import { getSingleSz } from 'js/http-req'
import { resetTime, sliceArr, beforeWeekMonth } from 'js/common'
import './style.less'
@autobind
class Earnings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: null,
      endDate: null,
      navIndex: 1,
      myData: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      todayRank: [],
      hisRank: [],
      myHis: [],
      total: 0,
    }
  }
  reqToday = {
    pageSize: 20, pageNo: 1
  }
  reqHis = {
    pageSize: 20, pageNo: 1, tradeDate: beforeWeekMonth('day')
  }
  reqMyHis = {
    pageSize: 10, pageNo: 1, startDate: null, endDate: null
  }
  componentDidMount() {
    this._getTodayRank(this.reqToday)
  }
  subNavClick(Index) {
    if (Index == 1) {
      this._getTodayRank(this.reqToday)
    } else if (Index == 2) {
      this._getHisRank(this.reqHis)
      this.setState({
        startDate: beforeWeekMonth('day')
      })
    } else if (Index == 3 && this.props.userMsg) {
      this._getMyHis(this.reqMyHis)
      this.setState({
        startDate: null
      })
    }
    this.setState({
      navIndex: Index
    })
  }
  //今日奖励
  _getTodayRank(req) {
    getSingleSz('/v1/digging_entrust/today_rank', req).then((res) => {
      if (res.data.status == 200) {
        console.log(res.data.data)
        this.setState(() => {
          let arr = []
          if (res.data.data.list.length) {
            arr.push(sliceArr(res.data.data.list, 0, 10))
            arr.push(sliceArr(res.data.data.list, 10))
          }
          return {
            todayRank: arr,
            total: res.data.data.total
          }
        })
      }
    }).catch(err => {
      console.log(err)
    })
  }
  // 历史奖励
  _getHisRank(req) {
    getSingleSz('/v1/digging_entrust/his_rank', req).then((res) => {
      if (res.data.status == 200) {
        console.log(res.data.data)
        this.setState(() => {
          let arr = []
          if (res.data.data.list.length) {
            arr.push(sliceArr(res.data.data.list, 0, 10))
            arr.push(sliceArr(res.data.data.list, 10))
          }
          return {
            hisRank: arr,
            total: res.data.data.total
          }
        })
      }
    }).catch(err => {
      console.log(err)
    })
  }
  //我的奖励
  _getMyHis(req) {
    getSingleSz('/v1/digging_entrust/my_his', req).then((res) => {
      if (res.data.status == 200) {
        console.log(res.data.data)
        let arr = res.data.data.list
        this.setState(() => ({
          myHis: arr,
          total: res.data.data.total
        })
        )
      }
    }).catch(err => {
      console.log(err)
    })
  }

  onChangePage(page, pageSize) {
    if (this.state.navIndex == 1) {
      this.reqToday.pageNo = page
      this._getTodayRank(this.reqToday)
    } else if (this.state.navIndex == 2) {
      this.reqHis.pageNo = page
      this._getHisRank(this.reqHis)
    } else if (this.state.navIndex == 3) {
      this.reqMyHis.pageNo = page
      this._getMyHis(this.reqMyHis)
    }
  }

  onChangeDate(dateStr, type) {
    this.reqMyHis[type] = dateStr
    this.setState({
      [type]: dateStr
    })
  }
  btnChange(time, type) {
    debugger
    if (type == 'all') {
      this.setState({
        startDate: null,
        endDate: null,
      })
      this.reqMyHis.startDate = null;
      this.reqMyHis.endDate = null;
      this._getMyHis(this.reqMyHis)

    } else if (type == 'week' || type == 'month') {
      this.setState({
        startDate: time,
        endDate: resetTime(new Date()),
      })
      this.reqMyHis.startDate = time;
      this.reqMyHis.endDate = resetTime(new Date());
      this._getMyHis(this.reqMyHis)

    } else {
      if (this.state.navIndex == 3) {
        this.reqMyHis.startDate = time;
        this.reqMyHis.endDate = type;
        this._getMyHis(this.reqMyHis)
      } else if (this.state.navIndex == 2) {
        this.reqHis.tradeDate = time ? time : ''
        this._getHisRank(this.reqHis)
      }

    }
  }
  render() {
    const { startDate, endDate, navIndex, myData, todayRank, hisRank, myHis, total } = this.state;
    console.log(startDate)
    return (
      <div className="terrace terrace-order">
        <div>
          <div className="terrace-title">
            <p className={`terrace-title-single${navIndex == 1 ? ' active' : ''}`} onClick={this.subNavClick.bind(this, 1)}>今日排名</p>
            <p className={`terrace-title-single${navIndex == 2 ? ' active' : ''}`} onClick={this.subNavClick.bind(this, 2)}>历史奖励</p>
            <p className={`terrace-title-single${navIndex == 3 ? ' active' : ''}`} onClick={this.subNavClick.bind(this, 3)}>我的奖励</p>
          </div>

          {navIndex == 1 &&
            <div>
              <div className='allData'>
                {todayRank && JSON.stringify(todayRank) !== '[]' ?
                  todayRank.map((item, index) => {
                    return (
                      <ul key={index}>
                        <li>
                          <p>排名</p>
                          <p>积分</p>
                        </li>
                        {item && JSON.stringify(item) !== '[]' ?
                          item.map((item1, i) => {
                            return (
                              <li key={i}>
                                <p>{item1.rank}</p>
                                <p>{item1.point}</p>
                              </li>
                            )
                          }) : <li className='notData'>暂无数据</li>
                        }
                      </ul>
                    )
                  }) : <div className='notData'>暂无数据</div>
                }
              </div>
              <div className='szAll-page' key='todayRank'>
                <Pagination size="small" total={total} hideOnSinglePage defaultPageSize={20} onChange={this.onChangePage}
                  defaultCurrent={1} />
              </div>
            </div>
          }
          {
            navIndex == 2 &&
            <div>
              <div className="terrace-wrap-select">
                <DateSelect startDate={startDate} endDate={endDate} isGlup={false} change={this.onChangeDate} btnChange={this.btnChange} />
              </div>
              <div className='allData'>
                {hisRank && JSON.stringify(hisRank) !== '[]' ?
                  hisRank.map((item, index) => {
                    return (
                      <ul key={index}>
                        <li>
                          <p>排名</p>
                          <p>积分</p>
                          <p>奖励(SZ)</p>
                        </li>
                        {item && JSON.stringify(item) !== '[]' ?
                          item.map((item1, index) => {
                            return (
                              <li key={index}>
                                <p>{item1.rank}</p>
                                <p>{item1.point}</p>
                                <p>{item1.diggingAmount}</p>
                              </li>
                            )
                          }) : <li className='notData'>暂无数据</li>
                        }
                      </ul>
                    )
                  }) : <div className='notData'>暂无数据</div>
                }
              </div>
              <div className='szAll-page' key="hisRank">
                <Pagination size="small" total={total} hideOnSinglePage defaultPageSize={20} onChange={this.onChangePage}
                  defaultCurrent={1} />
              </div>
            </div>
          }
          {
            navIndex == 3 && this.props.userMsg ?
              <div>
                <div className="terrace-wrap-select">
                  <DateSelect startDate={startDate} endDate={endDate} change={this.onChangeDate} btnChange={this.btnChange} />
                </div>
                <div className='myData'>
                  <ul>
                    <li>
                      <p>日期</p>
                      <p>排名</p>
                      <p>积分</p>
                      <p>奖励(SZ)</p>
                    </li>
                    {myHis && JSON.stringify(myHis) !== '[]' ?
                      myHis.map((item, index) => {
                        return (
                          <li key={index}>
                            <p>{item.tradeDate}</p>
                            <p>{item.rank}</p>
                            <p>{item.point}</p>
                            <p>{item.diggingAmount}</p>
                          </li>
                        )
                      }) : <li className='notData'>暂无数据</li>
                    }
                  </ul>
                </div>
                <div className='szAll-page' key="myHis">
                  <Pagination size="small" total={total} hideOnSinglePage defaultPageSize={10} onChange={this.onChangePage}
                    defaultCurrent={1} />
                </div>
              </div> : navIndex == 3 ? <MinNotLogin text="我的奖励" /> : ''
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    userMsg: state.userMsg.userMsg
  }
}

export default connect(mapStateToProps)(Earnings);
