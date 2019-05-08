import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { Route } from 'react-router-dom';
import SubMenu from 'components/SubMenu';
import I18n from 'components/i18n';
import UserIndex from './UserIndex';
import AssetManage from './AssetManage';
import AdminApi from './AdminApi';
import TradeOrder from './TradeOrder';
import AccountSecurity from './AccountSecurity';
import BindGoogle from './BindGoogle';
import Identification from './Identification';
import Invite from './Invite';
import DigitalNode from './DigitalNode';
import rankInvite from './Invite/rankInvite';
import { connect } from 'react-redux';
import { lStore } from 'js/index';
import { message, Spin } from 'antd';

import { basicInfo, upload, portraitIntoDataBase, getjishi } from 'js/http-req';

import './style.less';

let uploadType = {
  portrait: 'portrait',
  idCard: 'idCard',
  orderAppeal: 'idCard',
  coinIcon: 'coinIcon',
  banner: 'banner'
}

@autobind
class UserCenter extends React.Component {
  state = {
    previewImg: {},
    animation: false,
    status: 0,
    language: '',
    isJishi: false
  }

  static contextTypes = {
    lang: PropTypes.string,
    getLanguage: PropTypes.func,
  };

  componentDidMount() {
    this.state.language = this.context.getLanguage();
    this._getUserInfo();

    getjishi().then(res => {
      if (res.data.status == 200) {
        this.setState({
          isJishi: res.data.data
        })
      }
    }).catch(err => {
      console.log(err.data);
    })
  }

  _uploadPortrait(e) { // 上传头像
    let file = e.target.files[0];
    let _FormData = new FormData();
    if (!file) {
      return false;
    }
    let fileSize = 0;
    fileSize = e.target.files[0].size;
    let size = fileSize / 1024;
    if (size > 1000) {
      message.error("附件不能大于1M");
      return false;   //阻止submit提交
    }
    let name = e.target.value;
    let fileName = name.substring(name.lastIndexOf(".") + 1).toLowerCase();
    if (fileName != "jpg" && fileName != "jpeg" && fileName != "png" && fileName != "bmp") {
      message.error("请选择图片格式文件上传(jpg,png,jpeg,bmp)！");
      return false;   //阻止submit提交
    }
    _FormData.append('file', file);
    _FormData.append('type', uploadType.portrait);

    this.setState({ animation: true })
    upload(_FormData).then(res => {
      if (res.data.status === 200) {
        let _res = res.data.data;
        this.setState({ previewImg: _res }, () => {
          this._portraitIntoDataBase(_res.relativePath);
          this.setState({ animation: false })
        });
        console.log(res.data.data)
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
    })
  }

  _portraitIntoDataBase(path) { // 头像入库
    let req = { portrait: path };
    portraitIntoDataBase(req).then(res => {
      console.log(res);
      if (res.data.status === 200) {
        this._getUserInfo(); // 头像入库更新用户信息
        console.log(res)
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
    })
  }

  _getUserInfo() {
    basicInfo().then(res => {
      if (res.data.status === 200) {
        let _res = res.data.data;
        lStore.set('userInfo', _res); // 用户信息加入缓存

      }
    });
  }

  render() {
    let dataList = [
      {
        title: <I18n message='Personalcenter' />,
        icon: 'icon-gerenzhongxinicon',
        menuList: [
          {
            label: '基本资料',
            url: '/user_center/user_index'
          },
          {
            label: '账号安全',
            url: '/user_center/account_security'
          },
          {
            label: '身份认证',
            url: '/user_center/identification'
          },
          {
            label: 'API管理',
            url: '/user_center/admin_api'
          }
        ]
      },
      {
        title: '资产管理',
        icon: 'icon-zichanguanli',
        menuList: [
          {
            label: '我的钱包',
            url: '/user_center/asset_manage/my_wallet'
          },
          {
            label: '充值历史',
            url: '/user_center/asset_manage/recharge_history'
          },
          {
            label: '提现历史',
            url: '/user_center/asset_manage/withdraw_history'
          },
          {
            label: '资产流水',
            url: '/user_center/asset_manage/asset_water'
          },
          {
            label: '提币地址',
            url: '/user_center/asset_manage/withdraw_addr'
          },
          // {
          //   label: '用户转账',
          //   url: '/user_center/asset_manage/transfer'
          // }
        ]
      },
      {
        title: '交易订单',
        icon: 'icon-jiaoyidingdan',
        menuList: [
          // {
          //   label: '交易明细',
          //   url: '/user_center/trade_order/trade_details'
          // },
          {
            label: '历史委托',
            url: '/user_center/trade_order/history_entrust'
          },
          {
            label: '当前委托',
            url: '/user_center/trade_order/trading_entrust'
          }
        ]
      },
      {
        title: '邀请返佣',
        icon: 'icon-yaoqingfanyong',
        menuList: [
          {
            label: '邀请返佣',
            url: '/user_center/invite'
          },
          {
            label: '邀请榜单',
            url: '/user_center/rank_invite'
          }
        ]
      },
      {
        title: '数字节点',
        icon: 'icon-shuzijiedian',
        menuList: [
          {
            label: '数字节点',
            url: '/user_center/digital_node'
          },
        ]
      }
    ];
    const { previewImg, animation } = this.state;
    const personalInfo = this.props.userMsg;
    let defaultImg = require('../../images/touxiang.png');
    return (
      <div style={{ width: '100%', backgroundColor: '#101A37' }}>
        <div className="container" >
          <div className="user-center" style={{ display: 'flex', paddingTop: 120, paddingBottom: 60 }}>
            <div style={{ width: "280px", minHeight: 830, marginRight: 10, backgroundColor: '#162345', borderRadius: 3 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 48, marginBottom: 40 }}>
                <div style={{ width: 106, height: 106, position: 'relative', borderRadius: 100, border: 'solid 1px #D7DEE9' }}>
                  {
                    JSON.stringify(previewImg) !== '{}' ?
                      <img style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                        src={previewImg.absolutePath} /> :

                      animation ?
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}><Spin /></div> :

                        personalInfo && personalInfo.portrait && !animation ? <img
                          style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                          src={personalInfo.portrait} /> :

                          <img
                            style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                            src={defaultImg} />
                  }
                  <input
                    onChange={e => this._uploadPortrait(e)}
                    className="portrait-upload-input"
                    type="file"
                    title=' '
                    accept="image/png,image/jpeg,image/jpg,image/gif" />
                  <div style={{ position: 'absolute', right: 0, bottom: 0, width: 30, height: 30, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#D8D8D8', borderRadius: 100 }}>
                    <i className='iconfont icon-shezhi' style={{ fontSize: 20, color: '#993E32' }}></i>
                  </div>
                </div>
                <p style={{ marginTop: 14, fontSize: 16, marginBottom: 10 }}>
                  {this.state.isJishi ? <i className='iconfont icon-huangguan' style={{ color: '#F5CC34', marginRight: 7 }}></i> : ''}
                  <span>{personalInfo && personalInfo.nickName}</span>
                </p>
                <p style={{ color: '#7D8CA5' }}>上次登录时间：<span>{personalInfo && personalInfo.lastLoginTime}</span></p>
                {/* <p style={{ color: '#7D8CA5', marginTop: 5 }} >上次登录IP：<span>{personalInfo && personalInfo.lastIpAddress}</span></p> */}
              </div>
              <SubMenu dataList={dataList}></SubMenu>
            </div>
            <Route path="/user_center/user_index" component={UserIndex} />
            <Route path="/user_center/account_security" component={AccountSecurity} />
            <Route path="/user_center/bind_google" component={BindGoogle} />
            <Route path="/user_center/admin_api" component={AdminApi} />
            <Route path="/user_center/identification" component={Identification} />
            <Route path="/user_center/asset_manage" component={AssetManage} />
            <Route path="/user_center/trade_order" component={TradeOrder} />
            <Route path="/user_center/invite" component={Invite} />
            <Route path="/user_center/rank_invite" component={rankInvite} />
            <Route path="/user_center/digital_node" component={DigitalNode} />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    userMsg: state.userMsg.userMsg,
  }
}
export default connect(mapStateToProps)(UserCenter);
