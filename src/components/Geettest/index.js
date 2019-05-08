import React from 'react';
import {autobind} from 'core-decorators';
import PropTypes from 'prop-types';
import API from 'js/api';

const initGeetest = window.initGeetest;
@autobind
export default class Geet extends React.Component{
    state = {
        geetestId : '',
        clientType: '',
        captchaObj : {},

    }

    getgeet() {
        const that = this;
        const {geetestId,clientType} = this.state;
        API.geetest({
          geetestId,
          clientType
        },(res)=>{
            this.setState({
                gt,
                challenge
            });
            const {gt,challenge,success,new_captcha} = res;
            initGeetest({
              gt,
              challenge,
              offline: !success,
              new_captcha: new_captcha?new_captcha:'',
              product: "bind", // 产品形式，包括：float，popup
              width: "300px"
          },(captchaObj)=> {
              this.setState({
                captchaObj
              })
              // 这里可以调用验证实例 captchaObj 的实例方法
          });
        },'get');
    }

}
