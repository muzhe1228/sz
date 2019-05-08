import React from 'react';
import { autobind } from 'core-decorators';
import propTypes from 'prop-types';
import './style.less';
import MiningNav from "components/MiningNav"
import Order from "./Order"
import Mining from "./Mining"
@autobind
export default class MiningCont extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navIndex: 0,
    }
  }

  navHandle(index) {
    console.log(index)
    this.setState({
      navIndex: index
    })
  }
  
  render() {
    const { navIndex,myOrderMining } = this.state;
    const titleArr = [
      { name: '挂单挖矿' },
      { name: '我的挂单挖矿' }
    ]
    return (
      <div className="miningBot">
        <MiningNav titleArr={titleArr} onChange={this.navHandle} />
        {navIndex == 0 &&
          <Order />
        }
        {navIndex == 1 &&
         <Mining />
        }
      </div>
    )
  }
}