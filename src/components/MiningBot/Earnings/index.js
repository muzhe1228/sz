import React from 'react';
import { autobind } from 'core-decorators';
import { connect } from "react-redux";
import propTypes from 'prop-types';
import DateSelect from 'components/DateSelect'
import MinNotLogin from 'components/MinNotLogin';
import ItemList from '../itemList'
@autobind
class Earnings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: true,
      isPage: true,
      url: '/v1/dividend_detail/userDividendlist',
      req: { pageNo: 1, pageSize: 10 },
      isTime: true,
      itemList: [
        { lable: '时间', value: 'tradeDate' },
        { lable: '交易分红(BTC)', value: 'commonDividendProfitSumBtc', toFix: 8 },
        { lable: '数字节点分红(BTC)', value: 'nodeDividendProfitSumBtc', toFix: 8 },
        { lable: '累计分红(BTC)', value: 'dividendProfitSumBtc', toFix: 8 }
      ]
    }
  }

  subNavClick(bol) {
    if (bol) {
      this.setState({
        isShow: bol,
        url: '/v1/dividend_detail/userDividendlist',
        itemList: [
          { lable: '时间', value: 'tradeDate' },
          { lable: '交易分红(BTC)', value: 'commonDividendProfitSumBtc', toFix: 8 },
          { lable: '数字节点分红(BTC)', value: 'nodeDividendProfitSumBtc', toFix: 8 },
          { lable: '累计分红(BTC)', value: 'dividendProfitSumBtc', toFix: 8 }
        ]
      })
    } else {
      this.setState({
        url: '/v1/digging_user/list',
        isShow: bol,
        itemList: [
          { lable: '开始时间', value: 'tradeDate' },
          { lable: '截止时间', value: 'tradeDate' },
          { lable: '挖矿产出(SZ)', value: 'diggingAmount', toFix: 2 }
        ]
      })
    }

  }
  render() {
    console.log(this.props.userMsg)
    const { isShow, isPage, url, itemList, isTime } = this.state;
    return (
      <div className="terrace">
        {this.props.userMsg ?

          <div>
            <div className="terrace-title">
              <p className={`terrace-title-single${isShow ? ' active' : ''}`} onClick={this.subNavClick.bind(this, true)}>分红明细</p>
              <p className={`terrace-title-single${isShow ? '' : ' active'}`} onClick={this.subNavClick.bind(this, false)}>交易挖矿明细</p>
            </div>
            {isShow ?
              <ItemList isSocket={true} url={url} isPage={isPage} key="detail" isTime={isTime} itemList={itemList} />
              : <ItemList key="list" url={url} isPage={isPage} itemList={itemList} isTime={isTime} />}
          </div> :
          <MinNotLogin text='个人收益分配'/>}
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