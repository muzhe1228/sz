import React, { Fragment } from 'react';
import { autobind } from 'core-decorators';
import propTypes from 'prop-types';
import { connect } from "react-redux";
import './style.less';
import { getSingleSz } from 'js/http-req';
import { coinSplice, showNum } from 'js/common';
import MinNotLogin from 'components/MinNotLogin';
import { message } from 'antd';
@autobind
class Mining extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myOrderMining: {},//我的挂单挖矿
    }
  }

  componentDidMount() {
    if (this.props.userMsg) {
      this._getOrderMining()
    }
  }
  //我的挂单挖矿
  _getOrderMining() {
    getSingleSz('/v1/digging_entrust/my_info').then((res) => {
      if (res.data.status == 200) {
        this.setState(() => ({
          myOrderMining: res.data.data
        }))
      } else {
        message.error(res.data.message)
      }
    }).catch((err) => {
      console.log(err)
    })
  }
  render() {
    const { myOrderMining } = this.state;
    return (
      <Fragment>
        {this.props.userMsg?
          <ul className="mining-order">
          <li>
            <p className='mining-order-title'>今日排名</p>
            <p className='mining-order-text'>{showNum(myOrderMining.rank)}</p>
            <p className='mining-order-title'>今日累计积分</p>
            <p className='mining-order-text'>{showNum(myOrderMining.point)}</p>
          </li>
          <li>
            <p className='mining-order-title'>昨日排名</p>
            <p className='mining-order-text'>{showNum(myOrderMining.yesterdayRank)}</p>
            <p className='mining-order-title'>昨日获得奖励(SZ)</p>
            <p className='mining-order-text'>{coinSplice(myOrderMining.yesterdayDiggingAmount, 2)}</p>
          </li>
          <li>
            <p className='mining-order-title'>历史奖励累计(SZ)</p>
            <p className='mining-order-text'>{coinSplice(myOrderMining.diggingAmountTotal, 2)}</p>
          </li>
        </ul>:
        <MinNotLogin text='我的挂单挖矿' />
        }
        
      </Fragment>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    userMsg: state.userMsg.userMsg
  }
}

export default connect(mapStateToProps)(Mining);