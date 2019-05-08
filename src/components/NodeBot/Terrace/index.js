import React from 'react';
import { autobind } from 'core-decorators';
import propTypes from 'prop-types';
import { Select } from 'antd';
import ItemList from 'components/MiningBot/itemList'
const Option = Select.Option;
@autobind
export default class Terrace extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: '/v1/dividend_total/get_dividend_list',
      isTime: true,
      itemList: [
        { lable: '时间', value: 'tradeDate' },
        { lable: '累计分红(BTC)', value: 'nodeDividendBtcAmount', toFix: 8 },
      ]
    }
  }
  render() {
    const { isShow, url, itemList, isTime } = this.state;
    return (
      <div className="terrace">
        {/* <div className="terrace-title">
          <p className={`terrace-title-single${isShow ? ' active' : ''}`} onClick={this.subNavClick.bind(this, true)}>待分配分红手续费明细</p>
          <p className={`terrace-title-single${isShow ? '' : ' active'}`} onClick={this.subNavClick.bind(this, false)}>历史分配</p>
        </div> */}
        <ItemList key='listToday' url={url} itemList={itemList} isTime={isTime} />
      </div>
    )
  }
}