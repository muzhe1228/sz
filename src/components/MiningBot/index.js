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
      navIndex: 0
    }
  }

  navHandle(index) {
    console.log(index)
    this.setState({
      navIndex: index
    })
  }
  render() {
    const { navIndex } = this.state;
    const titleArr = [
      { name: '平台收益分配' },
      { name: '个人收益分配' },
    ]
    return (
      <div className="miningBot">
        <MiningNav titleArr={titleArr} onChange={this.navHandle} />
        {navIndex == 0 &&
          <Terrace /> 
        }
        {navIndex == 1 &&
          <Earnings /> 
        }
      </div>
    )
  }
}