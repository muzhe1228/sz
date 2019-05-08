import React from 'react';
import {autobind} from 'core-decorators';
import Modal from 'components/Modal';
import LinkText from 'components/LinkText';
import LineInput from 'components/LineInput';
import PropTypes from 'prop-types';

@autobind
export default class ModifyTradePassword extends React.Component{
    constructor(props){
        super(props);
        this.state={

        };
    }

    show() {
      let div = 
      <div style={{padding: '0 125px', marginTop: 40, marginBottom: 60}}>
        <div style={{marginBottom: 20}}>
          <LineInput placeholder='新密码' type='password'/>
        </div>
        <div style={{marginBottom: 20}}>
          <LineInput placeholder='确认密码' type='password'/>
        </div>
        <div style={{marginBottom: 20}}>
          <LineInput placeholder='请输入谷歌验证码' type='text'/>
        </div>
      </div>
      Modal.show({
        title: '修改支付密码',
        content: div,
        okText: '确认修改',
        onOk: (cb) => {
          let flag = false;
          flag = true;
          alert('success!')
          cb(flag)
        },
        next: 0
      })
    }

    render(){
        return(
            <LinkText className='linkTextpos' text='修改' onClick={this.show}/>
        )
    }
}
