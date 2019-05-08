import React, { Component } from 'react';
import { autobind } from 'core-decorators';
// import PropTypes from 'prop-types';
import { Select, Button ,Pagination} from 'antd';
import './style.less';
const Option = Select.Option;
@autobind
export default class TradeDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

  }
  onChangePage(page, pageSize) {
    console.log(page)
  }
  render() {
    return (
      <div className="TradeDetails">
        <h2 className="my-wallet-nav">交易明细</h2>
        <div className='select-gulp'>
          <div className='select-gulp-single'>
            <p>交易对：</p>
            <Select defaultValue="all" style={{ width: 180 }} onChange={this.coinCodeSelectChange}>
              <Option value="all">全部</Option>
              <Option value="BTC">BTC/BTS</Option>
              <Option value="ETH">ETH/ADA</Option>
              <Option value="USDT">USDT/BTC</Option>
              <Option value="SZ">SZ/PAI</Option>
            </Select>
          </div>
          <Button className='searchBtn'>搜索</Button>
        </div>
        <div className="userListWrap">
          <ul className='userListWrap-title'>
            <li>时间</li>
            <li>币种</li>
            <li>类型</li>
            <li>数量</li>
            <li>余额</li>
          </ul>
          <ul className="userListWrap-single">

          </ul>
        </div>
        <div className='szAll-page'>
          <Pagination size="small" total={500} hideOnSinglePage defaultPageSize={20} onChange={this.onChangePage}
            defaultCurrent={1} />
        </div>
      </div>
    )
  }
}
