import React from 'react';
import {autobind} from 'core-decorators';
import {Modal} from 'components/Modal';
import LinkText from 'components/LinkText';
import LineInput from 'components/LineInput';
import PropTypes from 'prop-types';

@autobind
export default class ModifyNikeName extends React.Component{
    constructor(props){
        super(props);
        this.state={
          nickName:this.props.value,
          isShow: false
        };
    }

    change(name, value) {
      if(value.length>17) {value = value.substring(0, 17)};
      this.setState({
        nickName: value
      })
    }

    show() {
      this.setState({
        isShow : true
      })
    }

    _close() {
      this.setState({
        isShow : false
      })
    }

    ok(cb) {
      let flag = false;
      flag = true;
      alert('success!')
      cb(flag)
    }

    render(){
      let {isShow, nickName} = this.state;
      let div = 
      <div style={{padding: '0 125px', marginTop: 40, marginBottom: 60}}>
        <div style={{marginBottom: 20}}>
          <LineInput placeholder='请输入新昵称' type='text' value={nickName} onChange={this.change}/>
        </div>
      </div>

        return(
          <div style={{display: 'inline'}}>
            {
              isShow?
              <Modal title='修改昵称' children={div} okText='确认修改' onOK={this._ok} next={0} onClose={this._close}/>
              : ''
            }
            <i className='iconfont icon-xiugai' onClick={this.show}></i>
          </div>
        )
    }
}
