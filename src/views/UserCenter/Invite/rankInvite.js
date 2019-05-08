import React from 'react';
import {autobind} from 'core-decorators';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
// import {Tabs, TabsItem} from 'components/Tabs';
// import Pagination from 'components/Pagination';
import {Pagination, Tabs} from 'antd';
import {getMonthlist,getHistory} from 'js/http-req';
import {resetDate} from 'js/common'
import './style.less';

import bannerInvite from 'images/invite/invite.jpg';
import rank1 from 'images/invite/rank1.png';
import rank2 from 'images/invite/rank2.png';
import rank3 from 'images/invite/rank3.png';

const TabPane = Tabs.TabPane;
@autobind
export default class Invite extends React.Component {
  constructor(props) {
    super(props);
    let rangeArray = (start, end) => Array(end - start + 1).fill(0).map((v, i) => i + start)
    this.state = {
      rankUrl: [rank1, rank2, rank3],
      rankData: {},
      pageNo:1,
      history:{}
    }
  }

  componentWillMount() {
    this._getMonthlist(1)
    this._getHistory()
  }

  //获取邀请排行榜
  _getMonthlist(pageNo) {
    let req = {pageSize: 20, pageNo: pageNo}, _this = this;
    getMonthlist(req).then((res) => {
      _this.setState({
        rankData: res.data.data,
        pageNo:pageNo
      })
    }).catch((err) => {
      console.log(err)
    })
  }
//用户返佣收益（昨天跟历史）
_getHistory() {
  let req = {}, _this = this;
  getHistory(req).then((res) => {
    console.log(res.data.data)
    _this.setState({
      history: res.data.data
    })
  })
}
  onChangePage(page, pageSize) {
    this._getMonthlist(page)
    window.ScrollTop()
  }

  filterCoin(val) {
    if (val == 'SZ') {
      return 'amountSz'
    } else if (val == 'BTC') {
      return 'amountBtc'
    } else if (val == 'ETH') {
      return 'amountEth'
    } else if (val == 'USDT') {
      return 'amountUsdt'
    }
  }

  render() {
    const {rankUrl, rankData,pageNo,history} = this.state;
    console.log(rankData)
    return (
      <div className='invite'>
        <div className='invite-banner'>
          <img src={bannerInvite} alt=""/>
        </div>
        <div className='invite-top'>
          <div className='invite-nav'>
            <p>{resetDate()}邀请榜单</p>
          </div>
          <div className='invite-top-info'>
            <ul className='top-title'>
              <li>名次</li>
              <li>用户</li>
              <li>返佣折合({history.coinCode})</li>
            </ul>
            {
              rankData.list&&JSON.stringify(rankData.list) !== '[]' ?
              rankData.list.map((item, index) => {
                  return (
                    <ul className={`top-single${((pageNo-1)*20)+index > 2?' notColor':''}`} key={index}>
                      <li>{((pageNo-1)*20)+index > 2 ? <span className='rankNum'>{((pageNo-1)*20)+(index + 1)}</span> :
                        <img src={rankUrl[index]} alt=""/>}</li>
                      <li>{item.loginName ? item.loginName : '未知'}</li>
                      <li>{item[this.filterCoin(item.coinCode)]}</li>
                    </ul>
                  )
                }) 
                : <p className="notData">暂无数据</p>
            }
              <div className='szAll-page'>
                <Pagination size="small" total={rankData.total} hideOnSinglePage defaultPageSize={20} onChange={this.onChangePage}
                            defaultCurrent={1}/>
              </div>
          </div>
        </div>
      </div>
    )
  }
}
