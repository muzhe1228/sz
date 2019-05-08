import React from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import I18n from 'components/i18n';
import FOOTERLOGO from 'images/logoDI.png';
import { lStore } from 'js/index';
import { browser } from 'src';
import './style.less';

import webchatCode from '../../images/wechatCode.jpg'
import { getBanner } from '../../js/http-req';
import { BaseNode } from 'sprite-core';

import ceshi from '../../images/6dappf fund  copy.png'
@autobind
export default class Footer extends React.Component {
    static props = {
        bg: PropTypes.string
    }
    static defaultProps = {
        bg: "#08112C"
    }

    state = {
        FoootPic: [],
        YouLianJieA:[]
    }

    componentDidMount(){
        //banners        
        getBanner({ type: 3 }).then(res => {
            if (res.data.status == 200) {
                this.setState({
                    FoootPic: res.data.data
                }) 
            }
        }).catch(err => {
            console.log(err.data.message);
        })
    }

    _goWallet() {
        if (lStore.get('token')) {
            lStore.set('userTab', 1);
            browser.push('/user_center/asset_manage/my_wallet');
        } else {
            browser.push('/login');
        }
    }

    FootIndex(index) {
        window.open(this.state.FoootPic[index].url);
    }

    render() {
        var pathname = window.location.pathname;

        const { bg } = this.props;
    
        return (
            <div className={"footer " + (pathname == '/trading' ? 'maxFooter' : '')} style={{ backgroundColor: bg }}>
                <div className="container">
                    <div className="XiaHuaXian">
                        <div className="other-terrace">
                            <div className="terrace">
                                <h2><img src={FOOTERLOGO} alt="logo" /></h2>
                                <p>全球化创新型数字资产交易平台</p>
                                <ul className="share">
                                    <li><a target='_blank' href='https://www.instagram.com/szexchange/'><i className="iconfont icon-ins"></i></a></li>
                                    <li><a target='_blank' href='https://twitter.com/SZ91880429'><i className="iconfont icon-twitter"></i></a></li>
                                    <li>
                                        <i className="iconfont icon-weixin"></i>
                                        <img src={webchatCode} alt="" className='wechatCode' />
                                    </li>
                                    <li><a target='_blank' href='https://t.me/SZChina'><i className="iconfont icon-t"></i></a></li>
                                </ul>
                            </div>
                            <div className="other-list">
                                <dl>
                                    <dt><I18n message={'Services'} /></dt>
                                    <dd><Link to='/trading'><I18n message={'TokenTrading'} /></Link></dd>
                                    <dd><a onClick={this._goWallet}><I18n message={'Assets'} /></a></dd>
                                    <dd><a target='_blank' href='https://szcom.zendesk.com/hc/zh-cn/articles/360013433532-%E6%95%B0%E5%AD%97%E8%8A%82%E7%82%B9'><I18n message={'sz_numbernode'} /></a></dd>

                                </dl>
                                <dl>
                                    <dt><I18n message={'About'} /></dt>
                                    <dd><a target='_blank' href='https://szcom.zendesk.com/hc/zh-cn/articles/360013645011-%E5%85%B3%E4%BA%8E%E6%88%91%E4%BB%AC'><I18n message={'AboutUs'} /></a></dd>
                                    <dd><a target='_blank' href='https://szcom.zendesk.com/hc/zh-cn/articles/360013433692-%E5%85%B3%E4%BA%8ESZ'><I18n message={'AboutSZ'} /></a></dd>
                                    <dd><a target='_blank' href='https://szcom.zendesk.com/hc/zh-cn/sections/360001990371-%E5%85%AC%E5%91%8A'><I18n message={'Announcement'} /></a></dd>
                                </dl>
                                <dl>
                                    <dt><I18n message={'Agreements'} /></dt>
                                    <dd><a target='_blank' href='https://szcom.zendesk.com/hc/zh-cn/articles/360013645291-%E6%B3%A8%E5%86%8C%E5%8D%8F%E8%AE%AE'><I18n message={'TermsofService'} /></a></dd>
                                    <dd><a target='_blank' href='https://szcom.zendesk.com/hc/zh-cn/articles/360013645371-%E9%9A%90%E7%A7%81%E5%8D%8F%E8%AE%AE'><I18n message={'PrivacyPolicy'} /></a></dd>
                                    <dd><a target='_blank' href='https://szcom.zendesk.com/hc/zh-cn/articles/360013434112-%E8%B4%B9%E7%8E%87'><I18n message={'Fees'} /></a></dd>
                                </dl>


                                <dl>
                                    <dt><I18n message={'Support'} /></dt>
                                    <dd><a target='_blank' href='https://szcom.zendesk.com/hc/zh-cn/categories/360000785331-%E5%B8%AE%E5%8A%A9%E4%B8%AD%E5%BF%83'><I18n message={'FAQ'} /></a></dd>
                                    <dd><a target='_blank' href='https://szcom.zendesk.com/hc/zh-cn/articles/360013645471-API%E6%96%87%E6%A1%A3'><I18n message={'API'} /></a></dd>
                                    <dd><a target='_blank' href='https://www.btcmage.com/register?uid=bGw4RjlEaG9QOUpuLy9HZnU5YXV5dz09'>挖矿机器人</a></dd>
                                </dl>
                            </div>

                        </div>
                        {
                            pathname == "/" ?<div>
                                <div className="FootIndex">
                                    {
                                        this.state.FoootPic.length > 0 &&
                                        this.state.FoootPic.map((Banner, Index) => {
                                            
                                            return <div className="FootIndexTop">
                                                <img style={{width:"158px"}} src={Banner.picPath} onClick={this.FootIndex.bind(this, Index)} alt="" />
                                            </div>
                                        })
                                    }
                                </div>
                                <div className="YouLianJie">
                                    {
                                        this.state.FoootPic.length > 0 &&
                                        this.state.FoootPic.map((Banner, Index) => {
                                            return <div className="FootFont">
                                                <a classNameo="YouLianJieA"  href={Banner.url}  target="_blank" style={{color:"#485E7E"}}>{Banner.name}</a>
                                                <span className="shuGang" style={{color:"#485E7E"}}>|</span>
                                            </div>
                                        })
                                    }
                                </div>
                            </div> :
                                ""
                        }
                    </div>
                    <div className="copyright">Copyright &copy; 2018 SZ.COM</div>
                </div>
            </div>
        )
    }
}
