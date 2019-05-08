import React from 'react';
import { autobind } from 'core-decorators';
import propTypes from 'prop-types';
import './style.less';
import MiningNav from "components/MiningNav"
import Terrace from "./Terrace"
import Earnings from "./Earnings"
@autobind
export default class MiningBot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: 0
    }
  }

  navHandle(index) {
    this.setState({
      isShow: index
    })
  }
  render() {
    const { isShow } = this.state;
    const titleArr = [
      { name: '平台数字节点分红' },
      { name: '个人数字节点分红' }
    ]
    return (
      <div className="miningBot">
        <MiningNav titleArr={titleArr} onChange={this.navHandle} />
        {!isShow ?
          <Terrace /> :
          <Earnings />
        }

      </div>
    )
  }
}