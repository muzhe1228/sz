import React, { Component } from 'react';

import './style.less'

import downloadBg from 'images/newDownload-bg.jpg'
import downloadPhone from 'images/newDownload-phone.jpg'
import downloadCode from 'images/newDownload-code.jpg'
import downloadBg1 from 'images/newDownload-bg1.png'
import btnDown from 'images/btnDown.png'


class AppDownload extends Component {
  render() {
    return (
      <div className='newDownload'>
        <img className='newDownload-bg' src={downloadBg} alt="" />
        <div className='newDownload-wrap container'>
          <div className='newDownload-wrap-left'>
            <img src={downloadPhone} alt="" />
          </div>
          <div className='newDownload-wrap-right'>
            <h2>随时随地 轻松交易</h2>
            <img src={downloadCode} alt="" />
            <p>扫码下载IOS、Android客户端App</p>
            <p className='newDownload-wrap-right-btn'>
            <img src={btnDown} alt=""/>
            <a className='right-btnSize' href="https://fir.im/41h3" target='_blank'>立即下载</a>
            </p>
            
            {/* <button className='newDownload-wrap-right-btn'>立即下载</button> */}
          </div>
          <img className='newDownload-wrap-bg' src={downloadBg1} alt=""/>
        </div>
      </div>
    )
  }
}
export default AppDownload;