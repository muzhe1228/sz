import React from 'react';
import { autobind } from 'core-decorators';
import ReactSwipe from 'react-swipe';
import { Link } from 'react-router-dom';
import I18n from 'components/i18n';
import HButton from 'components/HButton';
import { TradingTabs, TradingTabsItem } from 'components/TradingTabs';
import TradingList from 'components/TradingList';
import ScrollNotice from 'components/ScrollNotice';
import { Modal } from 'components/Modal';
import RecommentList from "../../components/RecommentList";
import { getBanner, getNotice, getSingleSz, getDiggingRemaining } from 'js/http-req';
import { coinSplice } from 'js/common'
import {lStore} from 'js/index';

import GLOBALBALL from 'images/globalball.png';
import SAFER from 'images/safer.png';
import COMMUNITY from 'images/community.png';
import LAMP from 'images/lamp.png';
import MENMBER from 'images/member.png';
import CODE from 'images/code.png';
import GLOBALBALL_W from 'images/globalball-w.png';
import SAFER_W from 'images/safer-w.png';
import COMMUNITY_W from 'images/community-w.png';
import LAMP_W from 'images/lamp-w.png';
import MENMBER_W from 'images/member-w.png';
import CODE_W from 'images/code-w.png';
import './style.less';
import Progress from '../../images/progress.png';
import Hummer from '../../images/mining.png';
import appDowonload from '../../images/home-pageApp.jpg';
import appDowonloadInfo from '../../images/appDowonload-info.png';

import { Carousel } from 'antd';

@autobind
export default class HomePage extends React.Component {
    state = {
        noticeData: [],
        banners: [],
        bannerIndex: 0,
        isNotice: sessionStorage.getItem('isNotice'),
        hourMaxDiggingAmount: '- -',
        remainingHourAmount: '- -',
        diggingOverTotal: '- -',
        circulationTotal: '- - ',
        diggingYesterdayTotal: '- -',
        poundageAmountBtcTotal: '- -',
        todayPoundageAmountBtcTotal: '- -',
        sumDividendBtc: '- -',
        marketCirculationTotal: '- -',
        nowHour: '- -'
    }
    constructor(props, context) {
        super(props);
    }
    componentDidMount() {
        //banners        
        getBanner({ type: 2 }).then(res => {
            if (res.data.status == 200) {
                this.setState({
                    banners: res.data.data
                })
                console.log(this.state.banners);
            }
        }).catch(err => {
            console.log(err.data.message);
        })
        //公告 Notice
        getNotice().then(res => {
            if (res.data.status == 200) {
                let notice = res.data.data;
                notice = notice.map(item => {
                    return { text: item.title, link: item.url }
                })
                this.setState({
                    noticeData: notice
                })
            }
        }).catch(err => {
            console.log(err.data.message);
        })
        //初始化挖矿数据
        this._getMine();

        getDiggingRemaining().then(res => {
          if(res.data.status == 200) {
            this.setState({
              hourMaxDiggingAmount: res.data.data.hourMaxDiggingAmount,
              remainingHourAmount: res.data.data.remainingHourAmount,
              nowHour: res.data.data.currentHour+':00-'+res.data.data.currentHour+':59'
            })
          }
        }).catch(err => {
          console.log(err.data)
        })

        //每小时挖矿
        this._getDiggingRemaining();
    }
    _getMine() {
        getSingleSz('/v1/blend/digging_index').then((res) => {
            if (res.data.status == 200) {
                this.setState({
                    diggingTotal: res.data.data.diggingTotal,//挖矿总量
                    diggingOverTotal: res.data.data.diggingOverTotal,//已挖矿总量
                    circulationTotal: res.data.data.circulationTotal,//平台流通总量
                    diggingYesterdayTotal: res.data.data.diggingYesterdayTotal,//昨日挖矿产出量
                    sumDividendBtc: res.data.data.sumDividendBtc,//平台累计分红
                    todayPoundageAmountBtcTotal: res.data.data.todayPoundageAmountBtcTotal,//今日待分配收入累计折合
                    poundageAmountBtcTotal: res.data.data.yesterdayPoundageAmountBtcTotal,//昨日分配收入累计折合
                    marketCirculationTotal: res.data.data.marketCirculationTotal,//市场流通总量
                })
            }
        }).catch((err) => {
            console.log(err.data)
        })
    }

    _getDiggingRemaining() {
      let self = this;
      this.intervalId = setInterval(() => {
        getDiggingRemaining().then(res => {
          if(res.data.status == 200) {
            self.setState({
              hourMaxDiggingAmount: res.data.data.hourMaxDiggingAmount,
              remainingHourAmount: res.data.data.remainingHourAmount,
              nowHour: res.data.data.currentHour+':00-'+res.data.data.currentHour+':59'
            })
          }
        }).catch(err => {
          console.log(err.data)
        })
      }, 1000*60*5);
    }

    change(index){        
        window.open(this.state.banners[index].url);
    }

    closeModeNotice() {
        sessionStorage.setItem('isNotice', true)
        this.setState({
            isNotice: true
        })
    }
    showBannerPos(index) {
        let { banners } = this.state;
        this.setState({
            bannerIndex: index >= banners.length ? index - banners.length : index
        })        
    }

    componentWillUnmount() {
      clearInterval(this.intervalId);
    }
    
    render() {
        const { noticeData, banners, isNotice, remainingHourAmount,nowHour,
          hourMaxDiggingAmount, circulationTotal, diggingYesterdayTotal,
            poundageAmountBtcTotal, todayPoundageAmountBtcTotal, sumDividendBtc, marketCirculationTotal } = this.state;
        
        return (
            <div className={"home-page " + (lStore.get('theme') == 'fff'? 'theme-white' : '')}>
                <div className="banner">
                {
                  banners.length > 0 &&
                  <Carousel autoplay ref="swipeBigPic" pauseOnDotsHover="true"
                  easing="false"
                  >
                    {
                      banners.map((banner, index) => {
                        return <div key={banner.id}>
                          <h3>
                            <img src={banner.picPath} onClick={this.change.bind(this, index)} className="ant-carousel slick-slide" />
                          </h3>
                        </div>
                      })
                    }
                  </Carousel>
                }
                </div>
                <div className="page-center">
                    <div className="notice">
                        <div className="container">
                            <i className="iconfont icon-laba"></i>
                            <ScrollNotice
                                dataList={noticeData}
                            />
                        </div>
                    </div>
                    <div className="trader-mining">
                        <div className="container">
                            <h2><I18n message={'TRADINGISMINING'} /></h2>
                            <div className="explain"><I18n message={'RetrSZp'} /></div>
                            <p className="look-over">
                                【<a target='_blink' href="https://szcom.zendesk.com/hc/zh-cn/articles/360015314271-%E4%BA%A4%E6%98%93%E6%8C%96%E7%9F%BF%E8%A7%84%E5%88%99">&nbsp;查看交易挖矿规则&nbsp;</a>】
                                【<a target='_blink' href="https://szcom.zendesk.com/hc/zh-cn/articles/360016533111-%E5%88%86%E7%BA%A2%E5%A5%96%E5%8A%B1%E8%A7%84%E5%88%99">&nbsp;查看收入分红规则&nbsp;</a>】
                            </p>
                            <div className="progress">
                                <span className="progress-label">
                                  <I18n message={'MiningProgress'} />
                                  <br/>
                                  <span>{nowHour}</span>
                                </span>
                                <div className="progress-wrap">
                                    <p className='Mined'>已挖矿  {coinSplice((hourMaxDiggingAmount - remainingHourAmount), 2)} SZ</p>
                                    <p className='Remaining'>剩余挖矿  {coinSplice(remainingHourAmount, 2)} SZ</p>
                                    <img src={Hummer} alt="" className='hummer' />
                                    <div className='animate-box'>
                                        <img src={Progress} alt="" className='progress-line' />
                                        <b className='shan'></b>
                                    </div>
                                </div>
                                <Link to='/mining'>
                                    <HButton text='挖矿资产' type='default' size='middle' />
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="recently-income">
                        <div className="container">

                            <div className="income-item">
                                <dl className='income'>
                                    <dt>今日待分配收入累计折合(BTC)</dt>
                                    <dd>{coinSplice(todayPoundageAmountBtcTotal, 8)}</dd>
                                </dl>
                                <dl>
                                    <dt>历史分红累计折合(BTC)</dt>
                                    <dd>{coinSplice(sumDividendBtc, 8)}</dd>
                                </dl>
                            </div>
                            <div className="income-item">
                                <dl className="income">
                                    <dt>昨日分配收入累计折合(BTC)</dt>
                                    <dd>{coinSplice(poundageAmountBtcTotal, 8)}</dd>
                                </dl>
                                <dl>
                                    <dt>昨日挖矿产出(SZ)</dt>
                                    <dd>{coinSplice(diggingYesterdayTotal, 2)}</dd>
                                </dl>
                            </div>
                            <div className="income-item">
                                <dl className='income'>
                                    <dt>平台流通总量(SZ)</dt>
                                    <dd>{coinSplice(circulationTotal, 2)}</dd>
                                </dl>
                                <dl>
                                    <dt>市场流通总量(SZ)</dt>
                                    <dd>{coinSplice(marketCirculationTotal, 2)}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="currency-market">
                    <RecommentList />
                </div>
                <div className="market-list">
                    <div className="container">
                        <TradingTabs page="home">
                            <TradingList />
                        </TradingTabs>
                    </div>
                </div>
                <div className="condition">
                    <div className="container">
                        <div className="server-type">
                            <div className="server-img"><img src={lStore.get('theme')=='fff'? GLOBALBALL_W : GLOBALBALL} alt="" /></div>
                            <dl>
                                <dt>全球化数字资产流动</dt>
                                <dd>遍布全球的项目拓展及运营管理体系，在德国、新加坡、日本等多个国家设有本地服务交易中心，快捷支撑数字资产的全球化流动。</dd>
                            </dl>
                        </div>
                        <div className="server-type">
                            <div className="server-img"><img src={lStore.get('theme')=='fff'? SAFER_W : SAFER} alt="" /></div>
                            <dl>
                                <dt>多维度安全保障</dt>
                                <dd>采用多维度的安全管理体系，支持Google验证器、手机短信等二次验证方式，数字资产采用冷钱包+多重签名等策略，全方位保护用户资产安全。</dd>
                            </dl>
                        </div>
                        <div className="server-type" style={{ padding: "0" }}>
                            <div className="server-img"><img src={lStore.get('theme')=='fff'? COMMUNITY_W : COMMUNITY} alt="" /></div>
                            <dl>
                                <dt>高度社区自治体系</dt>
                                <dd>设置了数字节点和超级节点的运营方式，充分运用社区选举制度，实行社区的高度自治，让中小散户和超级大户都有相应权利参与到交易所的运营和决策中。</dd>
                            </dl>
                        </div>
                    </div>
                    <div className="container">
                        <div className="server-type">
                            <div className="server-img"><img src={lStore.get('theme')=='fff'? LAMP_W : LAMP} alt="" /></div>
                            <dl>
                                <dt>透明公正交易规则</dt>
                                <dd>所有交易公正透明，建立实时的资产与交易数据查询验证机制，将每天的交易收入数据和分红数据对所有用户实时播报。</dd>
                            </dl>
                        </div>
                        <div className="server-type">
                            <div className="server-img"><img src={lStore.get('theme')=='fff'? MENMBER_W : MENMBER} alt="" /></div>
                            <dl>
                                <dt>所有手续费会员分红</dt>
                                <dd>交易所将每天的所有交易产生的会员手续费全部按照平台挖矿、持币的规则返回给用户，最大化保障平台用户利益。</dd>
                            </dl>
                        </div>
                        <div className="server-type" style={{ padding: "0" }}>
                            <div className="server-img"><img src={lStore.get('theme')=='fff'? CODE_W : CODE} alt="" /></div>
                            <dl>
                                <dt>顶级专业技术护航</dt>
                                <dd>团队来自全球顶级的金融和科技公司，将传统成熟的交易技术和运营模式带入交易所，为用户的交易保驾护航。</dd>
                            </dl>
                        </div>
                    </div>
                </div>
                <div className='home-page-appDownload'>
                    <img className='appDownload-bg' src={appDowonload} alt="" />
                    <Link to='/app_download' className='appDownload-wrap'>
                        <img src={appDowonloadInfo} alt="" />
                    </Link>
                </div>
                {
                    !isNotice ?
                        <div onClick={this.closeModeNotice}>
                            <Modal title={'通知'} className='nottice' okText={'我知道了'}>SZ.COM目前不支持来自
                    下列国家或地区的客户：<br />中国大陆、美国、伊朗、克里米亚、叙利亚。
                    </Modal>
                        </div>
                        : ''
                }
            </div >
        )
    }
}
