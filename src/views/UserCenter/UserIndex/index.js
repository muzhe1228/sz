import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import LinkText from 'components/LinkText';
import { Modal } from 'components/Modal';
import { ModifyPassword, BindEmail, ModifyMobile, BindPhone } from 'components/Modals';
import LineInput from 'components/LineInput';
import * as actionsUser from 'store/action/userMsg';
import { basicInfo, updateNickName, getjishi, getshifang } from 'js/http-req.js';
import { message } from 'antd';
import { lStore } from 'js';
import './style.less';
import { connect } from "react-redux";
import { browser } from 'src';

import shifangbiao from 'images/shifangbiao1.png'

@autobind
class UserIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      nickName: '',
      changeNick: '',
      uid: '',
      email: '',
      mobile: '',
      primaryAuth: false,
      seniorAuth: 0,
      isMobileBind: false,
      isEmailBind: false,
      isGoogleBind: false,
      isOpenGoogle: false,
      isShowNickModal: false,
      isShowModalPassword: false,
      isShowModalBindEmail: false,
      isShowModifyMobile: false,
      isShowBindPhone: false,
      language: '',
      isJishi: false,
      activeAmount: 0,
      waitAmount: 0
    }
  }

  static contextTypes = {
    lang: PropTypes.string,
    getLanguage: PropTypes.func,
    _geetest: PropTypes.func
  };

  componentDidMount() {
    this.state.language = this.context.getLanguage();
    this._init();

    getjishi().then(res => {
      if (res.data.status == 200) {
        if (res.data.data) {
          this._getshifang();
        }

        this.setState({
          isJishi: res.data.data
        })
      }
    }).catch(err => {
      console.log(err.data);
    })
  }

  _getshifang() {
    getshifang().then(res => {
      if (res.data.status == 200) {
        this.setState({
          activeAmount: parseFloat(res.data.data.activeAmount),
          waitAmount: parseFloat(res.data.data.waitAmount)
        })
      }
    }).catch(err => {
      console.log(err.data);
    })
  }

  _init() {
    basicInfo().then(res => {
      if (res.data.status == 200) {
        let data = res.data.data;
        const { dispatch } = this.props;
        dispatch(actionsUser.getUserMsg(data));
        lStore.set('userInfo', data);
        this.setState({
          userInfo: data,
          nickName: data.nickName,
          changeNick: data.nickName,
          uid: data.userId,
          email: data.email,
          mobile: data.mobile,
          primaryAuth: data.primaryAuth,
          seniorAuth: data.seniorAuth,
          isMobileBind: data.isMobileBind,
          isEmailBind: data.isEmailBind,
          isGoogleBind: data.isGoogleBind,
          isOpenGoogle: data.isOpenGoogle,
        })
      }
    })
  }

  changeNick(name, value) {
    if (value.length > 16) { value = value.substring(0, 16) };
    this.setState({
      changeNick: value
    })
  }

  showModalNick() {
    this.setState({
      isShowNickModal: true
    })
  }

  _closeNick() {
    this.setState({
      isShowNickModal: false,
      changeNick: this.state.nickName
    })
  }

  _closePassword() {
    this.setState({
      isShowModalPassword: false
    })
  }

  _closeBindEmail() {
    this.setState({
      isShowModalBindEmail: false
    })
  }

  _bindEmailSuccess() {
    this._init();
  }

  _showModalModifyMobile() {

    this.setState({
      isShowModifyMobile: true
    })
  }

  _closeModifyMobile() {
    this.setState({
      isShowModifyMobile: false
    })
  }

  _modifyMobileSuccess() {
    this._init();
  }

  _showModalBindPhone() {

    this.setState({
      isShowBindPhone: true
    })
  }

  _closeBindPhone() {

    this.setState({
      isShowBindPhone: false
    })
  }

  _bindPhoneSuccess() {
    this._init();
  }

  _okNick(cb) {
    if (this.state.changeNick.length < 2 || this.state.changeNick.length > 16) {
      message.error('昵称长度为2-16位');
      return false;
    }
    let seq = {
      nickName: this.state.changeNick
    }
    updateNickName(seq).then(res => {
      if (res.data.status == 200) {
        message.success('修改成功');
        this._init();
        cb(true);
      }
    }).catch(res => {
      message.error(res.data.message);
    })
  }

  _showModalPwd() {
    this.setState({
      isShowModalPassword: true
    })
  }

  _showModalBindEmail() {

    this.setState({
      isShowModalBindEmail: true
    })
  }

  _goIdentifyAuth() {
    browser.push('/user_center/identification');
  }

  render() {
    let {
      userInfo,
      nickName,
      changeNick,
      uid,
      email,
      mobile,
      primaryAuth,
      seniorAuth,
      isMobileBind,
      isEmailBind,
      isShowNickModal,
      isShowModalPassword,
      isShowModalBindEmail,
      isShowModifyMobile,
      isShowBindPhone,
      activeAmount,
      waitAmount
    } = this.state;

    let ele = null;
    if (seniorAuth == 0) {
      primaryAuth ? ele = <p className='linkTextpos'>已认证</p> : <LinkText className='linkTextpos' text='认证' />
    } else if (seniorAuth == 1) {
      ele = <LinkText className='linkTextpos' text='认证' />
    } else if (seniorAuth == 2) {
      ele = <LinkText className='linkTextpos' text='认证' />
    }
    return (
      <div className='userIndex-cotainer'>
        <div className="user-index" style={{ backgroundColor: '#162345' }}>
          <h2 className='personalH2'>基本资料</h2>
          <div style={{
            paddingLeft: 40,
            paddingBottom: 25,
            borderBottom: 'solid 1px rgba(30,47,91,0.4)',
            position: 'relative'
          }}>
            <div className='data-list-one'>
              <span className='user-title'>昵称:</span><span>{nickName}</span>
              {this.state.isJishi ? <i className='iconfont icon-huangguan' style={{ color: '#F5CC34', padding: '2px 8px', border: 'solid 1px #F5CC34', borderRadius: 10 }}> 基石投资人</i> : ''}
              <i className='iconfont icon-xiugai' onClick={this.showModalNick}></i>
            </div>
            <div className='data-list-one'>
              <span className='user-title'>登录密码:</span><span>*********</span>
              <LinkText className='linkTextpos' text='修改' onClick={this._showModalPwd} />
            </div>
          </div>
          <div style={{ paddingLeft: 30 }}>
            <div className='data-list-one2'>
              {
                isEmailBind ? <i className='iconfont icon-yes i-yes'></i> : <i className='iconfont icon-no i-no'></i>
              }
              <span className='user-title'>绑定邮箱：</span>
              <span className='fontSize12'>邮箱用于登录、提币及安全设置时使用，激活后不可修改</span>
              {
                isEmailBind ? <p className='linkTextpos'>已绑定</p> :
                  <LinkText className='linkTextpos' text='绑定' onClick={this._showModalBindEmail} />
              }
              <span className='user-conent-text'>{email}</span>
            </div>
            <div className='data-list-one2'>
              {
                isMobileBind ? <i className='iconfont icon-yes i-yes'></i> : <i className='iconfont icon-no i-no'></i>
              }
              <span className='user-title'>绑定手机：</span>
              <span className='fontSize12'>提现、修改密码、及安全设置时用以收取验证码短信</span>
              {
                isMobileBind ? <LinkText className='linkTextpos' text='修改' onClick={this._showModalModifyMobile} /> :
                  <LinkText className='linkTextpos' text='绑定' onClick={this._showModalBindPhone} />
              }
              <span className='user-conent-text'>{mobile}</span>
            </div>
            <div className='data-list-one2'>
              {
                (primaryAuth || seniorAuth == 3) ? <i className='iconfont icon-yes i-yes'></i> :
                  <i className='iconfont icon-no i-no'></i>
              }
              <span className='user-title'>身份认证：</span>
              <span className='fontSize12'>为了您的资金安全，需验证您的身份才可进行交易；认证信息一经验证不可修改</span>
              <LinkText className='linkTextpos' text='认证' onClick={this._goIdentifyAuth} />
              <span className='user-conent-text'>
                {
                  (primaryAuth || seniorAuth !== 0) ? (seniorAuth == 1 ? '待审核' : (seniorAuth == 2 ? '未通过' : '已认证')) : '未认证'
                }
              </span>
            </div>
          </div>
        </div>

        {
          this.state.isJishi ?
            <div className="jishi-table" style={{ backgroundColor: '#162345' }}>
              <p>额度释放时间表</p>
              <div className='release'>
                <span>已释放：{activeAmount}</span>
                <span>未释放：{waitAmount}</span>
              </div>
              <img src={shifangbiao} alt="" />
            </div>
            :
            ''
        }


        {/* <div className='login-list' style={{ backgroundColor: '#162345' }}>
          <DataList
            url='/coin/all/detail'
            data={[
              {
                label: '登录时间',
                field: 'coinKind'
              },
              {
                label: '登录方式',
                field: 'drawMax'
              },
              {
                label: 'IP地址',
                field: 'isdraw'
              }
            ]}
            render={(row, index) => { console.log(row, index) }}
          />
        </div> */}

        {
          isShowNickModal ?
            <Modal title='修改昵称' okText='确认修改' onOk={this._okNick} next={0} onClose={this._closeNick}>
              <div style={{ padding: '0 125px', marginTop: 40, marginBottom: 60 }}>
                <div style={{ marginBottom: 20 }}>
                  <LineInput placeholder='请输入新昵称' type='text' value={changeNick} onChange={this.changeNick} />
                </div>
              </div>
            </Modal>
            : ''
        }

        <ModifyPassword isShow={isShowModalPassword} onClose={this._closePassword} userInfo={userInfo} />

        <BindEmail isShow={isShowModalBindEmail} onClose={this._closeBindEmail} userInfo={userInfo}
          success={this._bindEmailSuccess} />

        <ModifyMobile isShow={isShowModifyMobile} onClose={this._closeModifyMobile} userInfo={userInfo}
          success={this._modifyMobileSuccess} />

        <BindPhone isShow={isShowBindPhone} onClose={this._closeBindPhone} userInfo={userInfo}
          success={this._bindPhoneSuccess} />

      </div>
    )
  }
}

export default connect()(UserIndex);
