import React from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import { coinSplice } from 'js/common';
import { getTodayDividend, getYesterdayDividend, getSingleSz } from 'js/http-req';
import CountUp from 'react-countup';
import { message } from 'antd';
import './style.less';

@autobind
export default class NumbernodeTop extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      nodeAmount: '- -',
      sumNodeDividendBtc: '- -',
      nodeDividendBtcRadioToday: '- -',
      nodeDividendBtcTotalToday: '- -',
      nodeDividendBtcRadioYestoday: '- -',
      nodeDividendBtcTotalYestoday: '- -',
    }
  }
  componentDidMount() {
    this.props.onRefTop(this);
    this._getNodeTop();
  }
  _getNodeTop() {
    getSingleSz('/v1/blend/node_index').then(res => {
      if (res.data.status == 200) {
        this.setState({
          nodeAmount: res.data.data.nodeAmount,//数字节点总量
          sumNodeDividendBtc: res.data.data.sumNodeDividendBtc,//平台节点累计分红
          nodeDividendBtcTotalToday: res.data.data.todayNodeDividendBtcTotal,//今日数字节点待分配分红折合
          nodeDividendBtcRadioToday: res.data.data.todayNodeDividendBtcRadio,//今日每10个节点手续费分红
          nodeDividendBtcTotalYestoday: res.data.data.yesterdayNodeDividendBtcTotal,//昨日数字节点分红收入累计折合
          nodeDividendBtcRadioYestoday: res.data.data.yesterdayNodeDividendBtcRadio,//昨日每10个数字节点待分配分红
        })

      }
    }).catch(err => {
      message.error(err.data.message)
    })
  }

  render() {
    let {
      nodeDividendBtcRadioToday,
      nodeDividendBtcRadioYestoday,
      nodeDividendBtcTotalToday,
      nodeDividendBtcTotalYestoday,
      sumNodeDividendBtc,
      nodeAmount
    } = this.state;

    return (
      <div className="numbernodeTop">
        <p style={{ paddingTop: 63, fontSize: 16, color: '#7D8CA5' }}>平台数字节点总量</p>
        <p style={{ fontSize: 46, color: '#C48F0F' }}>
          {nodeAmount !== '- -' ?
            <CountUp start={0} end={nodeAmount} duration={1} />
            :
            '- -'
          }
        </p>
        <p style={{ fontSize: 12, color: '#C48F0F' }}><a style={{ color: '#C48F0F', textDecoration: 'none' }} target='_blink' href="https://szcom.zendesk.com/hc/zh-cn/articles/360013433532-%E6%95%B0%E5%AD%97%E8%8A%82%E7%82%B9">什么是数字节点？</a></p>
        <div className='applyNumbernode' onClick={this.props.showApply}>申请数字节点</div>
        <div className='numbernodeTotal'>
          <div>
            <div>
              <p>平台数字节点分红累计折合</p>
              <p>
                {sumNodeDividendBtc !== '- -' ?
                  <CountUp start={0} end={sumNodeDividendBtc} duration={1} decimals={18} formattingFn={(num) => coinSplice(num, 8)} />
                  :
                  '- -'
                }
                {' BTC'}
              </p>
            </div>
          </div>
          <div>
            <div>
              <p>今日数字节点待分配分红折合</p>
              <p>
                {nodeDividendBtcTotalToday !== '- -' ?
                  <CountUp start={0} end={nodeDividendBtcTotalToday} duration={1} decimals={18} formattingFn={(num) => coinSplice(num, 8)} />
                  :
                  '- -'
                }
                {' BTC'}
              </p>
              <p>今日每10个数字节点待分配分红：</p>
              <p>
                {nodeDividendBtcRadioToday !== '- -' ?
                  <CountUp start={0} end={nodeDividendBtcRadioToday} duration={1} decimals={18} formattingFn={(num) => coinSplice(num, 8)} />
                  :
                  '- -'
                }
                {' BTC'}
              </p>
            </div>
          </div>
          <div>
            <div>
              <p>昨日数字节点分红收入累计折合</p>
              <p>
                {nodeDividendBtcTotalYestoday !== '- -' ?
                  <CountUp start={0} end={nodeDividendBtcTotalYestoday} duration={1} decimals={18} formattingFn={(num) => coinSplice(num, 8)} />
                  :
                  '- -'
                }
                {' BTC'}
              </p>
              <p>昨日每10个数字节点分配分红：</p>
              <p>
                {nodeDividendBtcRadioYestoday !== '- -' ?
                  <CountUp start={0} end={nodeDividendBtcRadioYestoday} duration={1} decimals={18} formattingFn={(num) => coinSplice(num, 8)} />
                  :
                  '- -'
                }
                {' BTC'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

}
