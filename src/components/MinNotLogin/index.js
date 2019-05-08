import React from 'react';
import { autobind } from 'core-decorators';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';
@autobind
export default class MinNotLogin extends React.Component {
  render() {
    return (
      <div className='no-login'>
        <Link to='/login'><span>登录</span></Link>或<Link to='/register'><span>注册</span></Link>
        查看{this.props.text?this.props.text:'我的收益'}
       </div>
    )
  }
}