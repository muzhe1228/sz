import React from 'react';
import { autobind } from 'core-decorators';
import propTypes from 'prop-types';
import { Select } from 'antd';
import ItemList from '../itemList'
const Option = Select.Option;
@autobind
export default class Terrace extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: true,
      url: '/v1/dividend_total/dividend_digging_his',
      isTime: false,
      itemList: []
    }
  }
  subNavClick(bol) {
    this.setState({
      isShow: bol,
      url: '/v1/dividend_total/dividend_digging_his',
      isTime: !bol,
      itemList: [
        { lable: '时间', value: 'tradeDate' },
        { lable: '分红累计折合(BTC)', value: 'dividendAmountBtc', toFix: 8 },
        { lable: '挖矿产出(SZ)', value: 'diggingAmount', toFix: 2 }
      ]
    })
  }
  render() {
    const { isShow, url, itemList, isTime } = this.state;
    return (
      <div className="terrace">
        <div className="terrace-title">
          <p className={`terrace-title-single${isShow ? ' active' : ''}`} onClick={this.subNavClick.bind(this, true)}>待分配分红手续费明细</p>
          <p className={`terrace-title-single${isShow ? '' : ' active'}`} onClick={this.subNavClick.bind(this, false)}>历史分配</p>
        </div>
        {isShow ? <ItemList key='listToday' /> : <ItemList key="diggingHis" url={url} itemList={itemList} isTime={isTime} />}
      </div>
    )
  }
}