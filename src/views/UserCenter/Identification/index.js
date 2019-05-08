import React from 'react';
import { autobind } from 'core-decorators';
import I18n from 'components/i18n';
import { Tabs, TabsItem } from 'components/Tabs';
import Select, { CountrySelect } from 'components/Select';
import SzInput from 'components/SzInput';
import HButton from 'components/HButton';
import { realNameAuth, getAuthInfo, seniorRealNameAuth } from 'js/http-req';
import { message } from 'antd';
import Upload from 'components/Upload';
import './style.less';

import allCountry from 'js/country.json';
import idCardBak from 'images/idCardBak.png';
import samp1 from 'images/samp1.png';
import samp2 from 'images/samp2.png';
import samp3 from 'images/samp3.png';
import samp4 from 'images/samp4.png';
import samp5 from 'images/samp5.png';
import samp6 from 'images/samp6.png';


@autobind
export default class Identification extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nav: [
        {
          label: '初级认证',
        },
        {
          label: '高级认证',
        }
      ],
      navCountry: [],
      country: null,
      primaryAuth: {},
      idCard: '',
      personName: '',
      frontPicturePath: '', // 正面图路径
      backPicturePath: '', // 反面图路径
      passport: '', //护照号码
      countryName: '美国', //国家名字
      name: '',//外国验证姓名
    };
  }

  componentDidMount() {
    let arr = allCountry.map((one) => {
      return { label: one.country, value: one.country }
    })
    arr = arr.filter(obj => obj.value !== '中国');
    // let arr = Country.map((one) => {
    //   return { label: one.code + '(' + one.country + ')', value: one.code }
    // })
    this.setState({
      navCountry: arr
    })

    this._getAuthInfo();
  }

  _getAuthInfo() {
    getAuthInfo().then(res => {
      if (res.data.status === 200) {
        console.log(res.data, '国家')
        let _res = res.data.data;  //修改直接可以高级
        this.setState({
          primaryAuth: _res,
          country: _res.primaryAuth ? 1 : _res.seniorAuth == 0 || _res.seniorAuth == 2 ? 0 : 2
        });
      }
    })
  }

  handleUserInput(name, value) {
    this.setState({
      [name]: value
    });
  }

  getPicturePath(type, path) {
    this.setState({
      ...this.state,
      [type]: path
    });
  }

  toIdentifyJunior() { //初级认证
    let { personName, idCard } = this.state;
    if (!personName) {
      message.error('请输入姓名')
      return false;
    }
    if (!idCard) {
      message.error('请输入身份证号')
      return false;
    }
    let req = {
      country: '中国',
      credentialsCode: idCard,
      credentialsType: 0,
      userName: personName
    }
    realNameAuth(req).then(res => {
      if (res.data.status === 200) {
        message.success('初级认证成功');
        this._getAuthInfo();
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
    });
  }

  _supplementDomesticSeniorAuth() {
    let { frontPicturePath, backPicturePath, identityPictureThree } = this.state;
    if (!frontPicturePath.relativePath || !backPicturePath.relativePath || !identityPictureThree) {
      message.error('请添加证件照');
      return false;
    }

    let req = {
      identityPictureOne: frontPicturePath.relativePath,
      identityPictureTwo: backPicturePath.relativePath,
      identityPictureThree: identityPictureThree.relativePath,
      country: '中国',
      credentialsType: 0
    }

    seniorRealNameAuth(req).then(res => {
      if (res.data.status === 200) {
        message.success('提交成功');
        this._getAuthInfo();
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
    });
  }

  _notChinaSeniorAuth() {
    let { frontPicturePath, backPicturePath, identityPictureThree, countryName, passport, name } = this.state;
    if (!name) {
      message.error('请输入姓名');
      return false;
    }
    if (!passport) {
      message.error('请输入护照号');
      return false;
    }
    if (!frontPicturePath.relativePath || !backPicturePath.relativePath || !identityPictureThree) {
      message.error('请添加证件照');
      return false;
    }
    let req = {
      identityPictureOne: frontPicturePath.relativePath,
      identityPictureTwo: backPicturePath.relativePath,
      identityPictureThree: identityPictureThree.relativePath,
      country: countryName,
      credentialsType: 1,
      credentialsCode: passport,
      userName: name
    }

    seniorRealNameAuth(req).then(res => {
      if (res.data.status === 200) {
        message.success('提交成功');
        this._getAuthInfo();
      }
    }).catch(err => {
      let _errMsg = err.data.message;
      message.error(_errMsg);
    });
  }

  _chooseChina() {
    this.setState({
      country: 1
    })
  }

  _chooseOther() {
    this.setState({
      country: 2
    })
  }

  _chooseOtherCountry(name, value) {
    this.setState({
      countryName: value
    })
  }

  _checkSenior() {
    if (!this.state.primaryAuth.primaryAuth) {
      return false;
    }
  }

  render() {
    const { nav, country, primaryAuth, personName, idCard, passport, name, navCountry, countryName } = this.state;
    let juniorDiv = null;
    let seniorDiv = null;
    let notChinaDiv = null;
    let noticeDiv = null;
    if (primaryAuth.primaryAuth) {
      juniorDiv =
        <div className='okIdCard'>
          <img src={idCardBak} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
          <div className='okIdCardContent'>
            <div>
              <label>国籍：</label>
              <p>中国</p>
            </div>
            <div>
              <label>证件类型：</label>
              <p>身份证</p>
            </div>
            <div>
              <label>真实姓名：</label>
              <p>{primaryAuth.userName}</p>
            </div>
            <div>
              <label>身份证号：</label>
              <p>{primaryAuth.credentialsCode}</p>
            </div>
          </div>
        </div>
    } else {
      juniorDiv =
        <div>
          <div className='identify-form-one'>
            <label>证件类型</label>
            <Select
              name="chooseCountry"
              onChange={() => { }}
              value={1}
              config={{
                options: [{
                  label: '身份证',
                  value: 1
                }],
              }}
            />
          </div>
          <div className='identify-form-one'>
            <label>姓名</label>
            <SzInput name='personName' placeholder='请输入真实姓名' value={personName} onChange={this.handleUserInput} type='text' />
          </div>
          <div className='identify-form-one'>
            <label>身份证号</label>
            <SzInput name='idCard' placeholder='请输入本人身份证号码' value={idCard} onChange={this.handleUserInput} type='text' />
          </div>
          <HButton type="sell" text="确认提交" radius={true} onClick={this.toIdentifyJunior} />
        </div>
    }

    if (primaryAuth.seniorAuth !== 0 && primaryAuth.seniorAuth !== 2) {
      seniorDiv =
        <div>
          <span style={{ marginLeft: 40, color: '#485E7E' }}>认证状态：</span>
          {
            primaryAuth.seniorAuth == 1
              ?
              <span style={{ padding: '5px 20px', border: '1px solid #993E32', borderRadius: 100, color: '#993E32', fontSize: 12, marginLeft: 8 }}>
                审核中
          </span>
              :
              <span style={{ padding: '5px 20px', border: '1px solid #206C46', borderRadius: 100, color: '#206C46', fontSize: 12, marginLeft: 8 }}>
                已认证
          </span>
          }
        </div>

    } else {
      if(primaryAuth.seniorAuth == 2) {
        noticeDiv = 
        <div style={{padding: '0 40px'}}>
          <div className='sercurity-warning'>
            <i className='iconfont icon-no' style={{ color: '#993E32', marginLeft: 10, marginRight: 5, fontSize: 12 }}></i>
            <span>当前状态：</span><span style={{color: '#BF5546', marginRight: 20}}>*认证未通过</span><span>(原因：{primaryAuth.remark !== 'null'? primaryAuth.remark : ''})</span>
          </div>
        </div>
      }
      seniorDiv =
      <div>
        {noticeDiv}
        <div className='seniorBak'>
          <div className="uploadGlup">
            <p className='color-red'>*身份证正面像</p>
            <p>请保持照片内容清晰完整。</p>
            <div className="imgGlup">
              <Upload getPicturePath={this.getPicturePath.bind(this, 'frontPicturePath')} />
              <p></p>
              <p className='imgGlup-right'>
                <img src={samp1} alt=""/>
              </p>
            </div>

          </div>
          <div className="uploadGlup">
            <p className='color-red'>*身份证国徽面</p>
            <p>请保持照片内容清晰完整，身份证必须在有效期内。</p>
            <div className="imgGlup">
              <Upload getPicturePath={this.getPicturePath.bind(this, 'backPicturePath')} />
              <p></p>
              <p className='imgGlup-right'>
                <img src={samp2} alt=""/>
              </p>
            </div>

          </div>
          <div className="uploadGlup">
            <p className='color-red'>*手持本人身份证人像面和个人签字</p>
            <p>请上传一张手持身份证正面和个人签字纸的照片，个人签字的内容包含「SZ.COM 和 当前日期」，请确保照片清晰完整。</p>
            <div className="imgGlup">
              <Upload getPicturePath={this.getPicturePath.bind(this, 'identityPictureThree')} />
              <p></p>
              <p className='imgGlup-right'>
                <img src={samp3} alt=""/>
              </p>
            </div>
          </div>
          <p style={{ textAlign: 'center',  color: '#485E7E', marginTop: 31 }}>
            以上材料需用JPG / JPEG / PNG上传，并保证照片清晰，边角完整，亮度均匀，且大小不得超过2M
          </p>

          <HButton type="sell" text="确认提交" radius={true} onClick={this._supplementDomesticSeniorAuth} />
        </div>
      </div>
    }

    if (primaryAuth.seniorAuth !== 0 && primaryAuth.seniorAuth !== 2) {
      notChinaDiv =
        <div>
          <span style={{ marginLeft: 40, color: '#485E7E' }}>认证状态：</span>
          {
            primaryAuth.seniorAuth == 1
              ?
              <span style={{ padding: '5px 20px', border: '1px solid #993E32', borderRadius: 100, color: '#993E32', fontSize: 12, marginLeft: 8 }}>
                审核中
          </span>
              :
              <span style={{ padding: '5px 20px', border: '1px solid #206C46', borderRadius: 100, color: '#206C46', fontSize: 12, marginLeft: 8 }}>
                已认证
          </span>
          }
        </div>

    } else {
      if(primaryAuth.seniorAuth == 2) {
        noticeDiv = 
        <div style={{padding: '0 40px'}}>
          <div className='sercurity-warning'>
            <i className='iconfont icon-no' style={{ color: '#993E32', marginLeft: 10, marginRight: 5, fontSize: 12 }}></i>
            <span>当前状态：</span><span style={{color: '#BF5546', marginRight: 20}}>*认证未通过</span><span>(原因：{primaryAuth.remark !== 'null'? primaryAuth.remark : ''})</span>
          </div>
        </div>
      }
      notChinaDiv =
        <div className='seniorBak'>
        {noticeDiv}
          <div className='identify-form-one'>
            <label>国家选择</label>
            <CountrySelect
              name="chooseCountry"
              onChange={this._chooseOtherCountry}
              value={countryName}
              config={{
                options: navCountry
              }}
            />
          </div>
          <div className='identify-form-one'>
            <label>姓名</label>
            <SzInput name='name' placeholder='请输入真实姓名' value={name} onChange={this.handleUserInput} type='text' />
          </div>
          <div className='identify-form-one'>
            <label>护照号</label>
            <SzInput name='passport' placeholder='请输入本人护照号码' value={passport} onChange={this.handleUserInput} type='text' />
          </div>
          <div className="uploadGlup">
            <p className='color-red'>*护照封面</p>
            <p>请保持照片内容清晰完整。</p>
            <div className="imgGlup">
              <Upload getPicturePath={this.getPicturePath.bind(this, 'frontPicturePath')} />
              <p></p>
              <p className='imgGlup-right'>
                <img src={samp4} alt=""/>
              </p>
            </div>

          </div>
          <div className="uploadGlup">
            <p className='color-red'>*护照个人信息页</p>
            <p>请保持照片内容清晰完整，身份证必须在有效期内。</p>
            <div className="imgGlup">
              <Upload getPicturePath={this.getPicturePath.bind(this, 'backPicturePath')} />
              <p></p>
              <p className='imgGlup-right'>
                <img src={samp5} alt=""/>
              </p>
            </div>

          </div>
          <div className="uploadGlup">
            <p className='color-red'>*手持护照个人信息页和个人签字</p>
            <p>请上传一张手持护照个人信息页和个人签字纸的照片，个人签字的内容包含「SZ.COM 和 当前日期」，请确保照片清晰完整。</p>
            <div className="imgGlup">
              <Upload getPicturePath={this.getPicturePath.bind(this, 'identityPictureThree')} />
              <p></p>
              <p className='imgGlup-right'>
                <img src={samp6} alt=""/>
              </p>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#485E7E', marginTop: 31 }}>
            以上材料需用JPG / JPEG / PNG上传，并保证照片清晰，边角完整，亮度均匀，且大小不得超过2M
          </p>

          <HButton type="sell" text="确认提交" radius={true} onClick={this._notChinaSeniorAuth} />
        </div>
    }


    return (
      <div className="identification">
        <h2 className='personalH2'>个人身份认证</h2>
        <div style={{ padding: '0 40px' }}>
          <div className='sercurity-warning'>
            <i className='iconfont icon-no' style={{ color: '#993E32', marginLeft: 10, marginRight: 5, fontSize: 12 }}></i>
            <span>为了您的资金安全，需验证您的身份才可进行交易；认证信息一经验证不能修改，请务必如实填写。</span>
          </div>
        </div>
        {
          country == 0 ?
            <div className='choose-country'>
              <p style={{ color: '#485E7E', marginBottom: 20 }}>选择国籍:</p>
              <div style={{ display: 'flex' }}>
                <div className='country-one' style={{ marginRight: 30 }} onClick={this._chooseChina}>
                  <span>中国大陆</span>
                </div>
                <div className='country-one' onClick={this._chooseOther}>
                  <span>非大陆</span>
                </div>
              </div>
            </div> :
            ''
        }
        {
          country == 1 ?
            <Tabs labels={nav} tabClick={this._checkSenior}>
              <TabsItem>
                <div className='identify-tab-container' >
                  {juniorDiv}
                </div>
              </TabsItem>
              <TabsItem>
                <div className='identify-tab-container' >
                  {seniorDiv}
                </div>
              </TabsItem>
            </Tabs> :
            ''
        }
        {
          country == 2 ?
            <Tabs labels={[
              {
                label: '高级认证',
              }
            ]} tabClick={this._checkSenior}>
              <TabsItem>
                <div className='identify-tab-container' >
                  {notChinaDiv}
                </div>
              </TabsItem>
              <TabsItem>

              </TabsItem>
            </Tabs> :
            ''
        }
      </div>
    )
  }
}
