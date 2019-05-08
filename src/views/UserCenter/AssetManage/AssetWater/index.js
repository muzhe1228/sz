import React from 'react';
import { autobind } from 'core-decorators';
import { DatePicker, Pagination, Select, Button, message } from 'antd';
import moment from 'moment'
import { getTradeList, getPositionAll } from 'js/http-req';
import { handleTypeFilter, isColor, coinSplice } from 'js/common'
import { scientificToNumber } from 'js'
import './style.less';
import Item from 'antd/lib/list/Item';
const Option = Select.Option;
@autobind
export default class AssetWater extends React.Component {
    state = {
        waterList: {},
        coinList: [],
        pageKeys: 'all'
    }
    histReq = {
        pageNo: 1,
        pageSize: 20,
        coinCode: '',
        handleType: '',
        startDate: '',
        endDate: ''
    }
    // req = { pageNo: page, pageSize: 20,
    //      coinCode: coinCode == 'all' ? '' : coinCode, handleType: handleType == 'all' ? '' : handleType }
    // coinCodeSelect = 'all'
    // handleTypeSelect = 'all'
    // historyPage = 1
    componentWillMount() {
        this._getTradeList(this.histReq)
        this._getPositionAll()
    }
    _getTradeList(req) {
        let _this = this
        getTradeList(req).then((res) => {
            if (res.data.status == 200) {
                _this.setState({
                    waterList: res.data.data
                })
            }
        })
    }
    _getPositionAll() {
        let _this = this
        getPositionAll().then((res) => {
            _this.setState({
                coinList: res.data.data
            })
        })
    }
    coinCodeSelectChange(value) {
        this.histReq.coinCode = value == 'all' ? '' : value
        this._getTradeList(this.histReq)
        this.setState({
            pageKeys: value
        })
    }
    handleTypeSelectChange(value) {
        this.histReq.handleType = value == 'all' ? '' : value
        this._getTradeList(this.histReq)
        this.setState({
            pageKeys: value
        })
    }

    //分页监听
    onChangePage(page, pageSize) {
        this.histReq.pageNo = page
        this._getTradeList(this.histReq)
        window.ScrollTop()
    }
    onStartChange(value, time) {
        if (time) {
            this.histReq.startDate = time
        } else {
            this.histReq.pageNo = 1
            this.histReq.startDate = ''
            this.histReq.endDate = ''
            this._getTradeList(this.histReq)
        }
    }

    onEndChange(value, time) {
        if (time) {
            this.histReq.endDate = time
        } else {
            this.histReq.pageNo = 1
            this.histReq.startDate = ''
            this.histReq.endDate = ''
            this._getTradeList(this.histReq)
        }
    }
    serachDate() {
        if (this.histReq.endDate && this.histReq.startDate) {
            this.histReq.pageNo = 1
            this.setState({
                pageKeys: 'srarch'
            })
            this._getTradeList(this.histReq)
        } else {
            message.warning('请选择正确的时间区间！')
        }
    }
    setTimeVal() {
        this.setState({
            val: moment('2015/01/01', "YYYY-MM-DD")
        })
    }

    render() {
        const { coinList, waterList, pageKeys } = this.state;
        return (
            <div className="asset-water" style={{ backgroundColor: "#162345" }}>
                <h2 className="userCenterav">资产流水</h2>
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
                    <div className='select-gulp-single'>
                        <p>类型：</p>
                        <Select defaultValue="all" style={{ width: 120 }} onChange={this.handleTypeSelectChange}>
                            <Option value="all">全部</Option>
                            <Option value="10010005">平台转入</Option>
                            <Option value="10010010">网络转入</Option>
                            <Option value="10010015">平台转出</Option>
                            <Option value="10010020">网络转出</Option>
                            <Option value="10010045">交易买入</Option>
                            <Option value="10010050">交易卖出</Option>
                            <Option value="10010055">交易手续费</Option>
                            <Option value="10010060">提现手续费</Option>
                            <Option value="10010075">交易挖矿</Option>
                            <Option value="10010080">注册与返佣</Option>
                            <Option value="10010085">分红</Option>
                            <Option value="20090001">交易分红</Option>
                            <Option value="20090002">节点分红</Option>
                            <Option value="20090003">活动奖励</Option>
                            <Option value="20090004">挂单挖矿</Option>
                            <Option value="10010086">基石投资</Option>
                            <Option value="10010100">提现冻结</Option>
                            <Option value="30000001">锁仓冻结</Option>
                            <Option value="30000002">节点冻结</Option>
                            <Option value="10010105">提现解冻</Option>
                            <Option value="40000001">锁仓解冻</Option>
                            <Option value="40000002">节点解冻</Option>
                        </Select>
                    </div>
                </div>

                <div className="condition-search">
                    {/* <Button onClick={this.setTimeVal}>一月</Button> */}
                    <div className='date-mode-info'>
                        <span>起止时间：&nbsp;&nbsp;从&nbsp;&nbsp;</span>
                        <DatePicker
                            format="YYYY-MM-DD"
                            placeholder="开始时间"
                            showToday={false}
                            onChange={this.onStartChange}
                        />
                        <span>&nbsp;&nbsp;到&nbsp;&nbsp;</span>
                        <DatePicker
                            format="YYYY-MM-DD"
                            placeholder="结束时间"
                            showToday={false}
                            onChange={this.onEndChange}
                        />
                        <Button className="btn" onClick={this.serachDate}>搜索</Button>
                    </div>
                </div>
                <div className='userCenter-list'>
                    <ul className='userCenter-list-title'>
                        <li>时间</li>
                        <li>币种</li>
                        <li>类型</li>
                        <li>数量</li>
                        {/* <li>可用余额</li> */}
                    </ul>
                    {waterList.list && JSON.stringify(waterList.list) !== '[]' ?
                        waterList.list.map((item, index) => {
                            return (
                                <ul key={index} className='userCenter-list-single'>
                                    <li>{item.createTime}</li>
                                    <li>{item.coinCode}</li>
                                    <li>{handleTypeFilter(item.handleType)}</li>
                                    <li className={isColor(item.amountSign)}>
                                        {/* 手续费和邀请返佣的显示全部   不按照精度显示 */}
                                        {(item.amountSign ? item.amountSign : '') +
                                            (item.handleType == 10010055 || item.handleType == 10010080
                                                ? scientificToNumber(item.amount)
                                                : coinSplice(item.amount,8))}
                                    </li>
                                    {/* <li>{coinNumRest(item.aftAmount, item.coinCode, coinList)}</li> */}
                                </ul>
                            )
                        }) : <p class="userCenter-list-single notData">暂无数据</p>

                    }

                </div>
                <div className='szAll-page' key={pageKeys}>
                    <Pagination size="small" total={waterList.total} hideOnSinglePage defaultPageSize={20} onChange={this.onChangePage}
                        defaultCurrent={1} />
                </div>
            </div>
        )
    }
}
