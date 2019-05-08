import React from 'react';
import { autobind } from 'core-decorators';
import propTypes from 'prop-types';
import { Pagination } from 'antd';
import DateSelect from 'components/DateSelect'
import { getSingleSz, getPositionAll } from 'js/http-req'
import Decimal from 'js/decimal';
import SockMgr, { C_SOCKET_CMDS } from "js/socket";
import { resetTime, coinNumRest, coinSplice } from 'js/common'

@autobind
export default class Terrace extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: null,
      endDate: null,
      itemData: {},
      coinList: [],
      ticks: {},
      ticksBtc: {},
    }
  }
  static props = {
    url: propTypes.string,
    isPage: propTypes.bool,
    isTime: propTypes.bool,
    itemList: propTypes.array,
    isSocket: propTypes.bool,
  }
  static defaultProps = {
    url: '/v1/poundage_total/page_today',
    isPage: true,
    isTime: false,
    itemList: [
      { lable: '币种', value: 'coinCode' },
      { lable: '平台本日手续费收入', value: 'poundageAmount', toFix: 'toFix' },
      { lable: '平台上小时手续费收入', value: 'currentHourPoundageAmount', toFix: 'toFix' }
    ],
    isSocket: false
  }

  req = {
    pageSize: 10, pageNo: 1, startDate: null, endDate: null
  }
  componentWillMount() {
    this._getPositionAll()
    this._getData(this.props.url, this.req)
  }

  _getData(url, req) {
    getSingleSz(url, req).then((res) => {
      if (this.props.isSocket) {
        res.data.data.list.forEach(item => {
          item.commonDividendProfitSumBtc = 0
          item.nodeDividendProfitSumBtc = 0
          item.dividendProfitSumBtc = 0
          item.dividendDetailStatBO.forEach(i => {
            item.commonDividendProfitSumBtc += i.dividendAmountBtc
            item.nodeDividendProfitSumBtc += i.nodeDividendAmountBtc
            item.dividendProfitSumBtc = Decimal.accAdd(Number(item.dividendProfitSumBtc), Number(Decimal.accAdd(i.dividendAmountBtc, i.nodeDividendAmountBtc)))
          })
        });
      }
      this.setState({
        itemData: res.data
      })
    })
  }
  onChangeDate(dateStr, type) {
    this.req[type] = dateStr
    this.setState({
      [type]: dateStr
    })
  }
  _getPositionAll() {
    let _this = this
    getPositionAll().then((res) => {
      _this.setState({
        coinList: res.data.data
      })
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
      this._getData(this.props.url, this.req)

    } else if (type == 'week' || type == 'month') {
      this.setState({
        startDate: time,
        endDate: resetTime(new Date()),
      })
      this.req.startDate = time;
      this.req.endDate = resetTime(new Date());
      this._getData(this.props.url, this.req)

    } else {
      this.req.startDate = time;
      this.req.endDate = type;
      this._getData(this.props.url, this.req)
    }
  }
  resNumPric(item, item1, coinArr) {
    if (item1.toFix == 'toFix') {
      return coinNumRest(item[item1.value], item.coinCode, coinArr)
    } else if (item1.toFix) {
      return coinSplice(item[item1.value], item1.toFix)
    } else {
      return item[item1.value]
    }
  }
  //监听分页
  onChangePage(page, pageSize) {
    this.req.pageNo = page
    this._getData(this.props.url, this.req)
  }
  render() {
    const { startDate, endDate, itemData, coinList } = this.state;
    const { isPage, isTime, itemList } = this.props;
    console.log(Decimal.accAdd(10, 1.999))
    return (
      <div className="terrace-wrap">
        {isTime ?
          <div className="terrace-wrap-select">
            <DateSelect startDate={startDate} endDate={endDate} change={this.onChangeDate} btnChange={this.btnChange} />
          </div> : ''
        }
        <ul className="terrace-wrap-title">
          {itemList &&
            itemList.map((item, index) => {
              return (<li key={index}>{item.lable}</li>)
            })
          }
        </ul>
        {isPage && itemData.data ? (itemData.data.list && JSON.stringify(itemData.data.list) !== '[]' ?
          itemData.data.list.map((item, index) => {
            return (
              <ul className="terrace-wrap-single" key={index}>
                {
                  itemList &&
                  itemList.map((item1, i) => {
                    return (
                      <li key={i}>{this.resNumPric(item, item1, coinList)}</li>
                    )
                  })
                }
              </ul>
            )
          }) : <p className="notData">暂无数据</p>) :
          (itemData.data && JSON.stringify(itemData.data) !== '[]' ?
            itemData.data.map((item, index) => {
              return (
                <ul className="terrace-wrap-single" key={index}>
                  {
                    itemList &&
                    itemList.map((item1, i) => {
                      return (<li key={i}>{this.resNumPric(item, item1, coinList)}</li>)
                    })
                  }
                </ul>
              )
            }) : <p className="notData">暂无数据</p>)
        }

        <div className='szAll-page'>
          <Pagination size="small" total={itemData.data && itemData.data.total} hideOnSinglePage defaultPageSize={10} onChange={this.onChangePage}
            defaultCurrent={1} />
        </div>
      </div>
    )
  }

}