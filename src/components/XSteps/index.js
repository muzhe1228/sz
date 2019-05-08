import React from 'react';
import { autobind } from 'core-decorators';
import propTypes from 'prop-types';
import './style.less';
@autobind
export default class XSteps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const {status} = this.props;
    return (
      <div className="x-steps">
        <div>
          <p className='yuandian active'></p>
          <span className={'line' + (status == 0? '' : ' active')}></span>
          <p className='steps-title'>验证身份</p>
        </div>
        <div>
          <p className={'yuandian' + (status >= 1? ' active' : '')}></p>
          <span className={'line' + (status >= 2? ' active' : '')}></span>
          <p className='steps-title'>输入新密码</p>
        </div>
        <div>
          <p className={'yuandian' + (status >= 2? ' active' : '')}></p>
          <p className='steps-title'>重置成功</p>
        </div>
      </div>
    )
  }
}
