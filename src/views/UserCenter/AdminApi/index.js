import React, { Component } from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import I18n from 'components/i18n';
import { Link } from 'react-router-dom';
import { lStore } from 'js';
import Modal from 'components/Modal';
import { browser } from 'src';
import { message } from 'antd'
import { getSingleSz, postSingleSz } from 'js/http-req'
import validateUtils from 'js/validateUtils';
import SzInput from 'components/SzInput';
import HButton from 'components/HButton';
import { patch } from 'js/common'
import './style.less'
@autobind
class AdminApi extends Component {
  constructor(props) {
    super(props)
    this.state = {
      emailError: false,
      applyIpError: false,
      errorMsg: '',
      email: '',
      applyIP: '',
      ApiList: [1],
      userInfo: lStore.get('userInfo')
    }
  }
  componentDidMount() {
    if (this.state.userInfo.seniorAuth !== 3) {
      Modal.show({
        title: '提示',
        content: <div style={{ fontSize: 14, textAlign: 'center', padding: 65 }}>请先完成<span className='color-red'>高级实名认证</span>，才可操作API管理！</div>,
        okText: '去认证',
        onOk: (cb) => { browser.push('/user_center/identification'); cb(true) },
      })
    } else {
      this._getApiList()
    }
    console.log(this.state.userInfo)
  }

  _getApiList() {
    getSingleSz('/api/getAppliedKey').then(res => {
      console.log(res.data)
      if (res.data.status == 200) {
        this.setState({
          ApiList: res.data.data
        })
      }
    })
  }
  _created() {
    if (this.state.userInfo.seniorAuth !==3) return message.warning('请先完成高级认证')
    const { email, applyIP } = this.state;
    let regIp = /^[\d.,]+$/
    if (!email || email === 0) {
      message.warning('邮箱号不能为空')
      this.setState({
        errorMsg: '邮箱号不能为空',
        emailError: true
      })
      return
    } else if (!validateUtils.testEmail(this.state.email)) {
      message.warning('请输入正确的邮箱号')
      // return false;
      this.setState({
        errorMsg: '请输入正确的邮箱号',
        emailError: true
      })
      return
    } else {
      this.setState({
        errorMsg: '',
        emailError: false
      })
    }
    if (!applyIP || applyIP === 0) {
      message.warning('IP地址不能为空')
      this.setState({
        errorMsg: 'IP地址不能为空',
        applyIpError: true
      })
      return
    } else if (!regIp.test(applyIP)) {
      message.warning('请输入正确的IP地址')
      this.setState({
        errorMsg: '请输入正确的IP地址',
        applyIpError: true
      })
      return
    } else if (patch(',', applyIP) >= 4 && applyIP.charAt(applyIP.length - 1) !== ',') {
      message.warning('每个API Key最多绑定4个IP')
      this.setState({
        errorMsg: '每个API Key最多绑定4个IP',
        applyIpError: true
      })
      return
    } else {
      this.setState({
        errorMsg: '',
        applyIpError: false
      })
    }
    let req = {
      email: email,
      applyIP: applyIP
    }
    getSingleSz('/api/apply', req).then((res) => {
      if (res.data.status == '200') {
        message.success('创建API成功')
        this.setState({
          email: '',
          applyIP: ''
        });
        this._getApiList()
      } else {
        message.error(res.data.message)
      }
    }).catch(err => {
      message.error(err.data.message ? err.data.message : err.data)
    })
  }
  handleUserInput(name, value) {
    this.setState({
      [name]: value,
    });
  }
  render() {
    const { email, applyIP, emailError, applyIpError, errorMsg, ApiList, userInfo } = this.state;
    return (
      <div className='adminApi'>
        <div className='adminApi-top'>
          <h2 className="userCenterav">API管理</h2>
          <h3 className='adminApi-top-subNav'>创建新API Key</h3>
          <div className='adminApi-top-wrap'>
            <div className='from-l'>
              <div className='posrela'>
                {emailError ? <span className='errorTip'>{errorMsg}</span> : ''}
                <label key='email'>邮箱（<span className='color-red'> *必填 </span>）</label>
                <SzInput name='email' type='text' value={email} onChange={this.handleUserInput} error={emailError} />
              </div>
              <div className='posrela'>
                {applyIpError ? <span className='errorTip'>{errorMsg}</span> : ''}
                <label key='email'>绑定IP地址（<span className='color-red'> *必填 </span>）</label>
                <SzInput name='applyIP' type='text' value={applyIP} onChange={this.handleUserInput} />
              </div>
              <HButton type="sell" text='创建' radius={true} onClick={this._created} />

            </div>
            <ul className='intor-r'>
              <li>提示：</li>
              <li>SZ为您提供了强大的API，您可以通过 API 使用行情查询、自动交易等服务。通过 <a className='color-red' href="https://szcom.zendesk.com/hc/zh-cn/articles/360013645471-API%E6%96%87%E6%A1%A3"> API 文档 </a>查看如何使用。</li>
              <li>每个用户最多创建5组 API Key。</li>
              <li><span>请不要泄露您的 API Key，以免造成资产损失。</span>出于安全考虑，建议为API Key绑定IP，每个API Key最多绑定4个IP。单个地址直接填写，多个IP地址用半角逗号分隔，如：192.168.1.1,192.168.1.2,192.168.1.3。</li>
            </ul>
          </div>
        </div>
        <div className='adminApi-bot'>
          <h3 className='adminApi-bot-nav'>我的API Key</h3>
          <div className='userCenter-list'>
            <ul className='userCenter-list-title'>
              <li>邮箱</li>
              <li>API Key</li>
              <li>API Secret Key</li>
              <li>绑定IP</li>
              <li>状态</li>
            </ul>
            {userInfo.seniorAuth == 3 ? (
              ApiList && JSON.stringify(ApiList) !== '[]' ?
                ApiList.map((item, index) => {
                  return (
                    <ul className='userCenter-list-single' key={index}>
                      <li>{item.email}</li>
                      <li>{item.apiKey}</li>
                      <li>******</li>
                      <li>{item.ip}</li>
                      <li>{item.status ? '已启用' : '未启用'}</li>
                    </ul>
                  )
                }) : <p class="userCenter-list-single notData">暂无数据</p>) :
                <div className='ApiNotData'>请先完成<Link to='/user_center/identification' className='color-red'>高级实名认证</Link>，才可操作API管理！</div>
              
            }


          </div>
        </div>
      </div>
    )
  }
}
export default AdminApi;