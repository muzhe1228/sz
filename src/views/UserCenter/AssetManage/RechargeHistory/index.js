import React from 'react';
import { autobind } from 'core-decorators';
import { Select, Pagination } from 'antd';
import { getPositionAll, getSingleSz } from 'js/http-req';
import { isColor, coinSplice } from 'js/common';
import { scientificToNumber } from 'js'
const Option = Select.Option;
@autobind
export default class RechargeHistory extends React.Component {
    state = {
        selectCurrency: 'BTC',
        histtoryList: {},
        coinList: [],

    }
    histReq = {
        pageNo: 1,
        pageSize: 20,
        coinCode: '',
        handleType: '10010005,10010010',
    }
    componentWillMount() {
        this._getPositionAll()
        this._getTradeList(this.histReq)
    }
    _getPositionAll() {
        let _this = this
        getPositionAll().then((res) => {
            _this.setState({
                coinList: res.data.data
            })
        })
    }
    _getTradeList(req) {
        let _this = this
        getSingleSz('/v1/trade/detail/drawlist', req).then((res) => {
            if (res.data.status == 200) {
                _this.setState({
                    histtoryList: res.data.data
                })
            }
        })
        // getTradeList(req).then((res) => {
        //     if (res.data.status == 200) {
        //         console.log(res.data.data)
        //         _this.setState({
        //             histtoryList: res.data.data
        //         })
        //     }
        // })
    }
    coinCodeSelectChange(value) {
        this.histReq.coinCode = value == 'all' ? '' : value
        this._getTradeList(this.histReq)
    }
    //分页监听
    onChangePage(page, pageSize) {
        this.histReq.pageNo = page
        this._getTradeList(this.histReq)
        window.ScrollTop()
    }
    render() {
        const { selectCurrency, histtoryList, coinList } = this.state;
        return (
            <div className="recharge-history" style={{ backgroundColor: "#162345" }}>
                <h2 className="userCenterav">充值历史</h2>
                <div className='select-gulp'>
                    <div className='select-gulp-single'>
                        <p>币种：</p>
                        <Select defaultValue="all" style={{ width: 120 }} onChange={this.coinCodeSelectChange}>
                            <Option value="all">全部</Option>
                            {coinList ?
                                coinList.map((item) => {
                                    return (
                                        <Option key={item.coinCode} value={item.coinCode}>{item.coinCode}</Option>
                                    )
                                }) : ''
                            }
                        </Select>
                    </div>
                    <p> <span>类型：</span><span>充值</span></p>
                </div>
                <div className="userCenter-list">
                    <ul className='userCenter-list-title'>
                        <li>时间</li>
                        <li>币种</li>
                        <li>状态</li>
                        <li>数量</li>
                        {/* <li>可用余额</li> */}
                    </ul>

                    {histtoryList.list && JSON.stringify(histtoryList.list) !== '[]' ?
                        histtoryList.list.map((item, index) => {
                            return (
                                <ul key={index} className='userCenter-list-single'>
                                    <li>{item.createTime}</li>
                                    <li>{item.coinCode}</li>
                                    <li>
                                        {/* {handleTypeFilter(item.handleType)} */}
                                        成功
                                    </li>
                                    <li className={isColor(item.amountSign)}>{(item.amountSign ? item.amountSign : '') + (item.handleType == 10010055 ? scientificToNumber(item.amount) : coinSplice(item.amount, 8))}</li>
                                    {/* <li>{coinNumRest(item.aftAmount, item.coinCode, coinList)}</li> */}
                                </ul>
                            )
                        }) : <p className="userCenter-list-single notData">暂无数据</p>

                    }
                </div>
                <div className='szAll-page'>
                    <Pagination size="small" total={histtoryList.total} hideOnSinglePage defaultPageSize={20} onChange={this.onChangePage}
                        defaultCurrent={1} />
                </div>
            </div>
        )
    }
}
