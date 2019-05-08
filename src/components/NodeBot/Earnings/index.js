import React from 'react';
import { autobind } from 'core-decorators';
import { connect } from "react-redux";
import propTypes from 'prop-types';
import DateSelect from 'components/DateSelect'
import MinNotLogin from 'components/MinNotLogin';
import ItemList from 'components/MiningBot/itemList'
@autobind
class Earnings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: true,
      isPage: true,
      url: '/v1/dividend_detail/userDividendlist',
      isTime: true,
      itemList: [
        { lable: '时间', value: 'tradeDate' },
        { lable: '数字节点分红(BTC)', value: 'nodeDividendProfitSumBtc', toFix: 8 },
      ]
    }
  }

  render() {
    console.log(this.props.userMsg)
    const { isPage, url, req, itemList, isTime } = this.state;
    return (
      <div className="terrace">
        {this.props.userMsg ?
          <div>
            <ItemList isSocket={true} url={url} isPage={isPage} key="detail" isTime={isTime} itemList={itemList} />
          </div> :
          <MinNotLogin />}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    userMsg: state.userMsg.userMsg
  }
}

export default connect(mapStateToProps)(Earnings);