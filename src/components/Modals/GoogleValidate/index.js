import React from 'react';
import {autobind} from 'core-decorators';
import {Modal} from 'components/Modal';
import LineInput from 'components/LineInput';

@autobind
export default class GoogleValidate extends React.Component{
    constructor(props){
        super(props);
        this.state={
          isShow: false,
        };
    }

    async _ok(cb) {
      let flag = false;
      flag = await this.props.onOk();
      cb(flag);
    }

    render(){
      let {isShow, onClose} = this.props;
        return(
          <div>
            {
              isShow?
                <Modal title='谷歌验证' okText='确认' next={0} onOk={this._ok} onClose={onClose}>
                  <div style={{ padding: '0 125px', marginTop: 40, marginBottom: 60 }}>
                    <div style={{ marginBottom: 20 }}>
                      <LineInput placeholder='请输入谷歌验证码' type='text' name='googleCode' onChange={this.props.changeGoogle} validate='yzm'/>
                    </div>
                  </div>
                </Modal>
                :
                ''
            }
          </div>
        )
    }
}
