import React, { Component } from 'react';
import { message, Spin } from 'antd';
import { upload } from 'js/http-req';
import './style.less';


// portrait：上传头像，idCard：身份认证，orderAppeal：订单申诉，coinIcon：币种图标，banner：banner图片

let uploadType = {
  portrait: 'portrait',
  idCard: 'idCard',
  orderAppeal: 'idCard',
  coinIcon: 'coinIcon',
  banner: 'banner'
}

export default class Upload extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isExistPreviewImg: false,
      animation: false,
      previewImgArr: [], // 预览图片的数组
    }
  }

  static defaultProps = {
    getPicturePath: () => { },
    uploadTypeField: 'idCard', // 默认以身份证上传方式上传
  }

  _upload(e) {
    let { uploadTypeField } = this.props;
    let file = e.target.files[0];
    if (!file) {
      return false;
    }
    let fileSize = 0;
    fileSize = e.target.files[0].size;
    let size = fileSize / 1024;
    if (size > 2000) {
      message.error("附件不能大于2M");
      return false;   //阻止submit提交
    }
    let name = e.target.value;
    let fileName = name.substring(name.lastIndexOf(".") + 1).toLowerCase();
    if (fileName != "jpg" && fileName != "jpeg" && fileName != "png" && fileName != "bmp") {
      message.error("请选择图片格式文件上传(jpg,png,jpeg)！");
      return false;   //阻止submit提交
    }
    let _FormData = new FormData();
    _FormData.append('file', file);
    _FormData.append('type', uploadType[uploadTypeField]);
    this._readFile(file, _FormData);
  }

  _readFile(file, withFormData) {
    let { getPicturePath } = this.props;
    //检测浏览器是否支持FileReader
    if (typeof (FileReader) === 'undefined') {
      console.log('抱歉您的浏览器不支持预览功能')
    } else {
      this.setState({ animation: true });
      upload(withFormData).then(res => {
        if (res.data.status === 200) {
          let _res = res.data.data;
          console.log(res.data.data)
          getPicturePath(_res)
          this._createUploadPicPreview(file);
        }
      }).catch(err => {
        console.log(err)
      })
    }
  }

  _createUploadPicPreview(file) {
    let self = this;
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      self.setState({ animation: false, isExistPreviewImg: true });
      let base64Code = e.target.result;
      // 把得到的base64赋值到img标签显示
      self.previewImg && self.previewImg.setAttribute('src', base64Code);
    }
  }

  render() {
    let {
      wrapperStyle
    } = this.props;
    let { isExistPreviewImg, animation } = this.state;
    let cross = require('../../images/seniorIdent.jpg');
    return (
      <div className="upload-wrapper" style={wrapperStyle}>
        <div className="upload-cover">
          <input onChange={(e) => this._upload(e)} className="upload-input" type="file" accept="image/png,image/jpeg,image/jpg" />
          {
            animation ?
              <div className="upload-loading-wrapper"><Spin /></div> :
              isExistPreviewImg ?
                <img className="upload-preview-img" ref={ele => this.previewImg = ele} /> :
                <img className="upload-cross-icon" src={cross} />
          }
        </div>
      </div>
    )
  }
}
