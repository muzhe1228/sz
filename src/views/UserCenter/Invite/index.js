import React from 'react';
import { autobind } from 'core-decorators';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Pagination, Tabs, Button, DatePicker, Icon, message } from 'antd';
import { getCodeImg, getMonthlist, getRecommendLink, getInviteList, getHistory, getChildList } from 'js/http-req';
import { resetDate } from 'js/common';
import html2canvas from 'html2canvas';
import './style.less';

import bannerInvite from 'images/invite/invite.jpg';
import rank1 from 'images/invite/rank1.png';
import rank2 from 'images/invite/rank2.png';
import rank3 from 'images/invite/rank3.png';
import webchatCode from 'images/wechatCode.jpg';
import posterImg from 'images/invite/poster.png';
const TabPane = Tabs.TabPane;
const QRCode = require('qrcode.react');
@autobind
export default class Invite extends React.Component {
  constructor(props) {
    super(props);
    let rangeArray = (start, end) => Array(end - start + 1).fill(0).map((v, i) => i + start)
    this.state = {
      index: 1,
      isShowMode: false,
      rankUrl: [rank1, rank2, rank3],
      title: ['被邀请人账号', '时间'],
      rankData: [],
      RecommendLink: {},
      InviteList: {},
      InviteList1: {},
      history: {},
      startValue: null,
      endValue: null,
      endOpen: false,
      dowImg: '',
      isShowPoster: false,
    }
  }

  componentWillMount() {
    this._getMonthlist()
    this._getRecommendLink()
    this._getChildList()
    this._getInviteList()
    this._getHistory()
  }
  closePosterMode() {
    this.setState({
      isShowPoster: false
    })
  }
  //tab函数
  tabHandle(key) {
    this.setState({
      index: key
    })
    if (key == 1) {
      this.setState({
        isShowMode: false,
      })
    }
  }
  _getCodeImg(data) {
    let _this = this;
    getCodeImg(data).then((res) => {
      // _this.setState({
      //   rankData: res.data.data.list
      // })
    }).catch((err) => {
      console.log(err)
    })
  }
  //获取邀请排行榜
  _getMonthlist() {
    let req = { pageSize: 3, pageNo: 0 }, _this = this;
    getMonthlist(req).then((res) => {
      _this.setState({
        rankData: res.data.data.list
      })
    }).catch((err) => {
      console.log(err)
    })
  }

  //获取用户邀请码跟邀请链接
  _getRecommendLink() {
    let req = {}, _this = this;
    getRecommendLink(req).then((res) => {
      // _this._getCodeImg({text:res.data.data.recommendLink})
      _this.setState({
        RecommendLink: res.data.data,
        testImg: 'http://qr.liantu.com/api.php?text=' + res.data.data.recommendLink
      })
    })
  }

  //分页查询用户返佣明细列表
  _getInviteList(page) {
    let req = { pageSize: 20, pageNo: page || 1 }, _this = this;
    getInviteList(req).then((res) => {
      if (res.data.status = 200) {
        _this.setState({
          InviteList1: res.data.data
        })
      }
    })
  }

  //分页查询推荐用户列表
  _getChildList(page) {
    let req = { pageSize: 20, pageNo: page || 1 }, _this = this;
    getChildList(req).then((res) => {
      _this.setState({
        InviteList: res.data.data
      })
    })
  }

  //用户返佣收益（昨天跟历史）
  _getHistory() {
    let req = {}, _this = this;
    getHistory(req).then((res) => {
      _this.setState({
        history: res.data.data
      })
    })
  }

  onChangePage(page, pageSize) {
    if (this.state.index == 1) {
      this._getChildList(page)
    } else if (this.state.index == 2) {
      this._getInviteList(page)
    }
    window.ScrollTop()
  }

  //点击导出
  _isShowMode() {
    if (this.state.isShowMode) {
      this.setState({
        isShowMode: false
      })
    } else {
      this.setState({
        isShowMode: true
      })
    }
  }

  //选择海报
  checkPoster() {
    let _this = this
    html2canvas(this.poster).then(function (canvas) {
      let image = canvas.toDataURL("image/jpeg");
      _this.setState({
        dowImg: image,
        isShowPoster: true
      })
    });
  }

  onChange(field, value) {
    this.setState({
      [field]: value,
    });
  }

  onStartChange(value, time) {
    this.onChange('startValue', time);
  }

  onEndChange(value, time) {
    this.onChange('endValue', time);
  }

  onCopy(text, result) {
    if (result) {
      message.success('复制成功');
    } else {
      message.error('复制失败!请使用高版本浏览器');
    }
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
    const { isShowPoster, dowImg, index, isShowMode, InviteList, InviteList1, rankUrl, rankData, RecommendLink, history } = this.state;

    return (
      <div className='invite'>
        <div className='invite-banner'>
          <img src={bannerInvite} alt="" />
        </div>
        <div className='invite-top'>
          <div className='invite-nav'>
            <p>{resetDate()}邀请榜单</p>
            <p><Link to="/user_center/rank_invite">查看完整榜单 &gt;</Link></p>
          </div>
          <div className='invite-top-info'>
            <ul className='top-title'>
              <li>名次</li>
              <li>用户</li>
              <li>返佣折合({history.coinCode})</li>
            </ul>
            {rankData && JSON.stringify(rankData) !== '[]' ?
              rankData.map((item, index) => {
                return (
                  <ul className='top-single' key={index}>
                    <li><img src={rankUrl[index]} alt="" /></li>
                    <li>{item.loginName ? item.loginName : '未知'}</li>
                    <li>{item[this.filterCoin(item.coinCode)]}</li>
                  </ul>
                )
              })
              : <p className="notData">暂无数据</p>
            }
          </div>

        </div>
        <div className='invite-info'>
          <div className='invite-nav'>
            <p>我的邀请</p>
          </div>
          <div className='info-wrap clear-f'>
            <ul className='info-wrap-title'>
              <li>
                <p>邀请人数：</p>
                <p>{InviteList.total}</p>
              </li>
              <li>
                <p>获得返佣：</p>
                <p>{history.coinCode} {history.historyAmount}</p>
              </li>
              <li>
                <p>返佣比例：</p>
                <p>20%</p>
              </li>
            </ul>
            <ul className='info-wrap-cont'>
              <li>
                <p>专属邀请码</p>
                <p className='big-size'>{RecommendLink.userCode}</p>
                <p>
                  <CopyToClipboard text={RecommendLink.userCode}
                    onCopy={this.onCopy}>
                    <Button className='invite-btn'>复制</Button>
                  </CopyToClipboard>

                </p>
              </li>
              <li>
                <p>分享链接</p>
                <p>{RecommendLink.recommendLink}</p>
                <p>
                  <CopyToClipboard text={RecommendLink.recommendLink}
                    onCopy={this.onCopy}>
                    <Button className='invite-btn'>复制</Button>
                  </CopyToClipboard>
                </p>
              </li>
              <li>
                <p>专属海报</p>
                <p></p>
                <p>
                  <Button className='invite-btn  bg-btn' onClick={this.checkPoster}>选择海报</Button>
                </p>
              </li>
            </ul>
            <div className='info-wrap-bot f-r'>
              {/* <p>分享至：</p>
              <ul className="share"> */}
              {/* <li>
                  <CopyToClipboard text={RecommendLink.recommendLink}
                      onCopy={this.onCopy}>
                      <i className="iconfont icon-ins"></i>
                    </CopyToClipboard>
                    </li>
                  <li>
                  <CopyToClipboard text={RecommendLink.recommendLink}
                      onCopy={this.onCopy}>
                       <i className="iconfont icon-weibo"></i>
                    </CopyToClipboard>
                   </li>
                  <li>
                  <CopyToClipboard text={RecommendLink.recommendLink}
                      onCopy={this.onCopy}>
                      <i className="iconfont icon-twitter"></i>
                    </CopyToClipboard>
                    </li>
                  <li>
                    <i className="iconfont icon-weixin"></i>
                    <img src={`http://qr.liantu.com/api.php?text=${RecommendLink.recommendLink}`} alt="" className='wechatCode'/>
                  </li>
                  <li>
                    <CopyToClipboard text={RecommendLink.recommendLink}
                      onCopy={this.onCopy}>
                      <i className="iconfont icon-t"></i>
                    </CopyToClipboard>
                  </li> */}
              {/* <li><a target='_blank' href='https://www.instagram.com/szexchange/'><i className="iconfont icon-ins"></i></a></li>
                                <li><a target='_blank' href='https://weibo.com/u/6625066008'><i className="iconfont icon-weibo"></i></a></li>
                                <li><a target='_blank' href='https://twitter.com/SZ91880429'><i className="iconfont icon-twitter"></i></a></li>
                                <li>
                                  <i className="iconfont icon-weixin"></i>
                                  <img src={webchatCode} alt="" className='wechatCode'/>
                                </li>
                                <li><a target='_blank' href='https://t.me/SZChina'><i className="iconfont icon-t"></i></a></li>
              </ul> */}
            </div>
          </div>
          <div className='info-list'>
            <Tabs defaultActiveKey="1" onChange={this.tabHandle}>
              <TabPane tab="邀请记录" key="1">
                <ul className='info-list-cont'>
                  <li className='info-list-cont-title'>
                    <p>被邀请人账号</p>
                    <p>时间</p>
                  </li>
                  {InviteList.total ?
                    InviteList.list.map((item) => {
                      return (
                        <li key={item.id} className='info-list-cont-single'>
                          <p>{item.loginName}</p>
                          <p>{item.regTime}</p>
                        </li>
                      )
                    }) : <li className='not-data'>暂无数据</li>
                  }
                </ul>

                <div className='invite-page'>
                  <Pagination size="small" key='1' total={InviteList.total} hideOnSinglePage defaultPageSize={20}
                    onChange={this.onChangePage}
                    defaultCurrent={1} />
                </div>
              </TabPane>
              <TabPane tab="返佣记录" key="2">
                <ul className='info-list-cont'>
                  <li className='info-list-cont-title'>
                    <p>金额</p>
                    <p>发放时间</p>
                  </li>
                  {InviteList1.total ?
                    InviteList1.list.map((item) => {
                      return (
                        <li key={item.id} className='info-list-cont-single'>
                          <p>{item.coinCode ? item[this.filterCoin(item.coinCode)] : ''}（{item.coinCode}）</p>
                          <p>{item.commissionDate}</p>
                        </li>
                      )
                    }) : <li className='not-data'>暂无数据</li>
                  }
                </ul>
                <div className='invite-page'>
                  <Pagination size="small" key='2' total={InviteList1.total} hideOnSinglePage defaultPageSize={20} onChange={this.onChangePage}
                    defaultCurrent={1} />
                </div>
              </TabPane>
            </Tabs>
            <div className='date-modeWrap'>
              {index == 2 ? <Button className='importBtn' onClick={this._isShowMode}>导出</Button> : ''}
              {isShowMode ? <div className='date-mode'>
                <span className='topJiao'></span>
                <div className='date-mode-title'>
                  <p>请选择导出时间</p>
                  <p><Icon type="close" onClick={this._isShowMode} className='close-date' /></p>
                </div>
                <div className='date-mode-info'>
                  <DatePicker
                    format="YYYY-MM-DD"
                    placeholder="开始时间"
                    onChange={this.onStartChange}
                  />
                  <span className='hengGang'></span>
                  <DatePicker
                    format="YYYY-MM-DD"
                    placeholder="结束时间"
                    onChange={this.onEndChange}
                  />
                </div>
                <Button className='date-mode-btn'>导出</Button>
              </div> : ''}

            </div>
          </div>
        </div>
        <div className='invite-bot'>
          <div className='invite-nav'>
            <p>活动规则：</p>
          </div>
          <ul className='invite-bot-list'>
            <li>1.成功邀请好友注册完成实名认证并进行交易的用户，即可享受好友每一笔交易手续费的20%返佣。</li>
            <li>2.佣金按每小时（整点）的汇率结算成SZ并统计，次日14点前发放到账。</li>
            <li>3.每个被邀请人每天参与返佣的手续费上限为折合50USDT。</li>
            <li>4.返佣有效期为平台上线后3个月内，即2018年9月1日至12月1日，初期邀请返佣截止后，平台将推新的数字节点经纪人佣金模式，具体细则将由平台公告公布。</li>
            <li>5.每天14点更新前一天邀请返佣排行榜数据。</li>
            <li>6.SZ.COM保留最终解释权。</li>
          </ul>
        </div>

        <div className={"posterShade " + (isShowPoster ? "active" : "")} onClick={this.closePosterMode}>
          <div className="poster">
            <p className="poster-title">下载海报，分享给好友</p>
            <div className="poster-wrap">
              <img className="poster-img" src={posterImg} alt="" />
              <p>
                <img ref={ele => this.codeImgUrl = ele} className="poster-code" src={`http://qr.liantu.com/api.php?text=${RecommendLink.recommendLink}`} alt="" />
              </p>
            </div>
            <a href={dowImg} download className="poster-btn">下载到桌面</a>
          </div>
        </div>
        <div className="downloadPoster" ref={ele => this.poster = ele}>
          <img className="downloadPoster-img" src={posterImg} alt="" />
          <p>
            {/* <img className="downloadPoster-code" src={`http://qr.liantu.com/api.php?text=${RecommendLink.recommendLink}`} alt="" /> */}
            <QRCode className="downloadPoster-code" size={150} value={`${RecommendLink.recommendLink}`} />
          </p>
        </div>
      </div>
    )
  }
}
