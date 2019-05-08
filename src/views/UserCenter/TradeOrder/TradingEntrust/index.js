import React, { Component } from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import { Select, message } from 'antd';
import { getSingleSz, postSingleSz } from 'js/http-req';
import { compareSort, resetTime, entrustStatus, searchList, decimalNum } from 'js/common';
import { lStore } from 'js/index';
import I18n, { I18nFunc } from 'components/i18n';
import SockMgr, { C_SOCKET_CMDS } from "js/socket";
import ModalBox from 'components/Modal';
import Decimal from "js/decimal";
import './style.less';
const Option = Select.Option;

@autobind
export default class TradingEntrust extends Component {
  constructor(props) {
    super(props);
    this.state = {
      TradingList: [],
      tradList: [],
      selectCoinCode: null
    };
    this.isNewData = true
  }
  componentWillMount() {
    var user = lStore.get('userInfo');
    SockMgr.initOrderSocket();
    SockMgr.subscribeOrder(user.userId, user.token);
    SockMgr.on(C_SOCKET_CMDS.order_depth, this.onOrderDepth);
  }
  a = 0
  onOrderDepth(data) {

    let user = lStore.get('userInfo')
    // 第一次进入
    if (this.isNewData) {
      this.a++
      if (data.userId == user.userId) {
        //委托单状态: 2 - 已成交 4 - 部分成交已撤 6 - 已撤
        //更新老数据，订单号相同-如果状态条件为：2,4,6 则删除；否则替换到最新的状态
        let deleteStar = '246', dataArr = [];
        data.content.forEach((item) => {
          if (deleteStar.indexOf(item.status) > -1) {
            console.log('delete')
          } else {
            dataArr.push(item)
          }
        })
        dataArr = dataArr.sort(compareSort('createTime'))
        lStore.set('tradingEntrust', dataArr)
        this.setState({
          TradingList: dataArr
        })
      }
      this.isNewData = false
    } else {//更新状态

      let lSData = lStore.get('tradingEntrust'), deleteStar = '246', dataArr = [];
      for (let i = 0; i < data.content.length; i++) {
        let isNew = true;
        for (let j = 0; j < lSData.length; j++) {
          if (data.content[i].orderNo == lSData[j].orderNo) {
            if (deleteStar.indexOf(data.content[i].status) > -1) {
              console.log('delete')
            } else {
              dataArr.push(data.content[i])
            }
            isNew = false;
          } else {
            dataArr.push(lSData[j])
          }
        }
        if (isNew) {
          dataArr.push(data.content[i])
        }
      }
      dataArr = dataArr.sort(compareSort('createTime'))
      lStore.set('tradingEntrust', dataArr)
      this.setState({
        TradingList: dataArr
      })
      // lSData.forEach((item) => {
      //   data.content.forEach((item1) => {
      //     if (item.orderNo == item1.orderNo) {
      //       if (deleteStar.indexOf(item1.status) > -1) {
      //       } else {
      //         dataArr.push(item1)
      //       }
      //     } else {
      //       dataArr.push(item)
      //     }
      //   })
      // })
      
    }

  }

  componentDidMount() {
    this._getTradeInfo()
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

  // cancelOrder(id) {
  //   console.log(id)
  //   let userInfo = lStore.get('userInfo'), req = id
  //   postSingleSz('v1/tradeOrder/cancelOrder', req).then((res) => {
  //     if (res.data.status == 200) {
  //       // var user = lStore.get('userInfo');
  //       // SockMgr.initOrderSocket();
  //       // SockMgr.subscribeOrder(user.userId, user.token);
  //       // SockMgr.on(C_SOCKET_CMDS.order_depth, this.onOrderDepth);
  //     }
  //   })
  // }

  cancel(data) {
    var content = <div style={{ padding: "0px 125px", marginTop: "40px", marginBottom: "60px" }}>
      <div style={{ marginBottom: "20px" }}>
        <div className="line-input">
          <div><span>{I18nFunc("TradingOrderCancelConfirm")}</span></div>
        </div>
      </div>
    </div>

    ModalBox.show({
      title: I18nFunc("second_confirm"), content: content, okText: I18nFunc("sz_confirm"), cancelText: I18nFunc("sz_cancel"), onOk: (okCb) => {
        this.cancelOrder(data);
        if (okCb) okCb(true);
      }
    });
  }
  cancelOrder(data) {
    var newData = { orderNo: data.orderNo, userId: data.userId };
    postSingleSz('v1/tradeOrder/cancelOrder', newData).then((res) => {
      if (res.data.status == 200) {
        message.success('撤销委托单申请成功！')
      } else {
        message.err(res.data)
      }
    }).catch((err) => {
      message.error(err.message)
    })
  }


  //选择币对监听
  coinTradSelectChange(value) {
    this.setState({
      selectCoinCode: value
    })
  }
  render() {
    const { tradList, TradingList, selectCoinCode } = this.state;
    console.log(TradingList)
    return (
      <div className="TradeDetails">
        <h2 className="userCenterav">当前委托</h2>
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
            <li>挂单时间</li>
            <li>交易对</li>
            <li>类型/方向</li>
            <li>委托价/委托量</li>
            <li>委托总额/成交均价</li>
            <li>已成交/成交总额</li>
            <li>状态</li>
            <li>操作</li>
          </ul>
          {
            TradingList && JSON.stringify(TradingList) !== '[]'?
              TradingList.map((item,i) => {
                let timeList = resetTime(item.createTime, 1)
                return (
                  <ul className={"userListWrap-single" + (searchList(selectCoinCode, item.coinCode) ? " hide" : "")} key={i}>
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
                    <li>{entrustStatus(item.status)}</li>
                    {/* onClick={this.cancelOrder.bind(this, item)} */}
                    <li style={{ color: '#BF5546' }} onClick={() => this.cancel(item)} >{I18nFunc("TradingOrderCancel")}</li>
                  </ul>
                )
              }) : <p class="userCenter-list-single notData">暂无数据</p>
          }
        </div>
      </div>
    )
  }
}
