import React from 'react';
import {autobind} from 'core-decorators';
import SzInput from 'components/SzInput';
import HButton from 'components/HButton';
import {Modal} from 'components/Modal';
import { message} from 'antd';
import './style.less';

@autobind
export default class Transfer extends React.Component{

    constructor(props){
        super(props);
        this.state={
          loginName: '',
          szNumber: '',
          tradePwd: '',
          confirmDel: false
        };
    }

    componentDidMount(){
      
    }

    _inputHandler(name, value) {
      this.setState({
        [name]: value
      })
    }
   
    _confirm() {
      let {tradePwd, loginName, szNumber} = this.state;
      if(!loginName) {
        message.error('请输入账号');
        return false
      }
      if(!szNumber) {
        message.error('请输入转账SZ数量');
        return false
      }
      if(!tradePwd) {
        message.error('请输入交易密码');
        return false
      }
     
      this.setState({
        confirmDel: true
      })

    }

    _closeConfirmDel() {
      this.setState({
        confirmDel: false
      })
    }

    _okToTrans() {
      let req = {
        
      }
    }

    render(){
      let {tradePwd, loginName, szNumber, confirmDel} = this.state;
        return(
            <div className="transfer">
              <h2 className='personalH2'>用户转账</h2>
              <div className='tr-from'>
                <div className='from-one'>
                  <label>手机或邮箱号：</label>
                  <SzInput name='loginName' value={loginName} type='text' onChange={this._inputHandler}/>
                </div>
                <div className='from-one'>
                  <label>转账SZ数量：</label>
                  <SzInput name='szNumber' value={szNumber} type='text' onChange={this._inputHandler} validate='money'/>
                </div>
                <div className='from-one'>
                  <label>交易密码：</label>
                  <SzInput name='tradePwd' value={tradePwd} type='password' onChange={this._inputHandler} validate='yzm'/>
                </div>
                
                <HButton text='确认转账' type='sell' 
                onClick={this._confirm}
                style={{width: 200, height: 46, marginTop: 40, marginLeft: 40}}/>
              </div>

            {
              confirmDel &&
              <Modal isShowButton={false} onClose={this._closeConfirmDel} className='confirmDel'>
                <p>确认向 {loginName} 转账 {szNumber} SZ吗？</p>
                <div className='hasBtn'>
                  <HButton size='middle' type="sell" text="确定" onClick={this._okToTrans} style={{ marginRight: 28, width: 180 }} />
                  <HButton size='middle' text="取消" onClick={this._closeConfirmDel} style={{ width: 180, border: 'solid 1px #993E32', color: '#993E32', fontSize: 14 }} />
                </div>
              </Modal>
            }
            </div>
        )
    }
}
