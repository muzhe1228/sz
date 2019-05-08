import React, { Component } from 'react';
import { autobind } from 'core-decorators';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Select, Button, Pagination } from 'antd';
import { getSingleSz } from 'js/http-req'
import { compareSort, entrustStatus, decimalNum } from 'js/common'
import { scientificToNumber } from 'js'
import Decimal from "js/decimal";
import SocketMgr from "js/socket";
import './style.less';
const Option = Select.Option;
@autobind
class HistoryEntrust extends Component {
  constructor(props) {
    super(props);
    this.state = {
      historyData: {},
      tradList: [],
      pageKeys: 'all'
    };
    this.histReq = {
      pageNo: 1,
      pageSize: 20,
      tradeCode: '',
      position: '',
      userId: this.props.userMsg.userId
    }
  }
  componentDidMount() {
    this._getHistoryData(this.histReq)
    this._getTradeInfo()
  }
  //历史委托单列表
  _getHistoryData(data) {
    getSingleSz('/v1/tradeOrderHis/list', data).then((res) => {
      if (res.data.status == 200) {
        this.setState({
          historyData: res.data.data
        })
      }
    })
  }

  //获取交易对列表
  _getTradeInfo() {
    let _this = this;
    getSingleSz('/tradeInfo/allTradeInfo', {}, true).then((res) => {
      let list = []
      res.data.data.forEach(item => {
        Object.values(item).forEach(item1 => {
          list = list.concat(item1)
        })
      });
      _this.setState({
        tradList: list.sort(compareSort('sort', true))
      })
    })
  }
  //选择币对监听
  coinTradSelectChange(value) {
    this.histReq.pageNo = 1;
    this.histReq.tradeCode = value == 'all' ? '' : value;
    this.setState({
      pageKeys: value
    })
    this._getHistoryData(this.histReq)
  }
  //分页监听
  onChangePage(page, pageSize) {
    this.histReq.pageNo = page;
    this._getHistoryData(this.histReq)
    window.ScrollTop()
  }
  render() {
    const { historyData, tradList, pageKeys } = this.state;
    const { userMsg } = this.props;
    console.log(historyData)
    return (
      <div className="history-entrust">
        <h2 className="userCenterav">历史委托</h2>
        <div className='select-gulp'>
          <div className='select-gulp-single'>
            <p>交易对：</p>
            <Select defaultValue="all" style={{ width: 180 }} onChange={this.coinTradSelectChange}>
              <Option value="all">全部</Option>
              {tradList &&
                tradList.map((item, i) => {
                  return (<Option key={i} value={item.tradeCode}>{item.tradeCode}</Option>)
                })
              }
            </Select>
          </div>
          {/* <Button className='searchBtn'>搜索</Button> */}
        </div>
        <div className="userListWrap">
          <ul className='userListWrap-title'>
            <li>成交时间</li>
            <li>交易对</li>
            <li>类型/方向</li>
            <li>委托价格/委托量</li>
            <li>委托总额/成交均价</li>
            <li>已成交/成交总额</li>
            <li>手续费</li>
            <li>状态</li>
          </ul>
          {
            historyData.list && JSON.stringify(historyData.list) !== '[]' ?
              historyData.list.map((item, index) => {
                let timeList = item.createTime.split(' ')
                return (
                  <ul className="userListWrap-single" key={item.id}>
                    <li>{timeList &&
                      timeList.map((time, index) => {
                        return (
                          <p key={index}>{time}</p>
                        )
                      })
                    }</li>
                    <li>{item.coinCode}</li>
                    <li>
                      <p>{item.tradeType ? '限价' : '市价'}</p>
                      <p>{item.position ? '卖出' : '买入'}</p>
                    </li>
                    <li>
                      <p>{decimalNum((item.tradeType ? item.tradePrice : '--'), item.coinCode, tradList)}</p>
                      <p>{decimalNum((item.tradeType ? item.tradeAmount : (item.position ? item.tradeAmount : '--')), item.coinCode, tradList, 1)}</p>
                    </li>
                    <li>
                      <p>{decimalNum((item.tradeType ? Decimal.accMul(Number(item.tradeAmount), Number(item.tradePrice)) : (item.position ? '--' : item.tradeAmount)), item.coinCode, tradList)}</p>
                      <p>{decimalNum(item.dealPrice, item.coinCode, tradList)}</p>
                    </li>
                    <li>
                      <p>{decimalNum(item.sellAmount, item.coinCode, tradList, 1)}</p>
                      <p>{decimalNum(item.buyAmount, item.coinCode, tradList)}</p>
                    </li>
                    <li>{scientificToNumber(item.poundageAmount)}</li>
                    <li>{entrustStatus(item.status)}</li>
                  </ul>
                )
              }) : <p class="userCenter-list-single notData">暂无数据</p>
          }

        </div>
        <div className='szAll-page' key={pageKeys}>
          <Pagination size="small" total={historyData.total} hideOnSinglePage defaultPageSize={20} onChange={this.onChangePage}
            defaultCurrent={1} />
        </div>
      </div>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    userMsg: state.userMsg.userMsg
  }
}
export default connect(mapStateToProps)(HistoryEntrust);
