import React from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import { coinSplice } from 'js/common';
import { getSingleSz } from 'js/http-req';
import CountUp from 'react-countup';
import './style.less';

import miningImg from 'images/mining/mining.jpg'
import orderImg from 'images/mining/order.jpg'


@autobind
export default class MiningTop extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      topAllData: null,
    }

  }
  componentDidMount() {
    this.getAllTop()
  }
  getAllTop() {
    getSingleSz('/v1/blend/digging_index').then((res) => {
      if (res.data.status == 200) {
        console.log(res.data.data)
        this.setState({
          topAllData: res.data.data
        })
      }
    }).catch((err) => {
      console.log(err.data)
    })
  }
  render() {
    const { topAllData } = this.state;
    return (
      <div className="miningTop clear-f">
        <div className='right-top f-r'>
          <p>
            {topAllData ?
              <CountUp start={0} end={topAllData.diggingOverTotal} decimals={3} formattingFn={(num) => coinSplice(num, 2)} duration={1} />
              :
              '- -'
            }
            {' SZ'}
            <span className='image-span'>已挖矿</span></p>
          <p>可挖矿总量
            <span>
              {topAllData ?
                <CountUp start={0} end={topAllData.diggingTotal} duration={1} decimals={2} separator=',' />
                :
                '- -'
              }
              {' SZ'}
            </span>
          </p>
          <p>
            【<a target='_blink' href="https://szcom.zendesk.com/hc/zh-cn/articles/360015314271-%E4%BA%A4%E6%98%93%E6%8C%96%E7%9F%BF%E8%A7%84%E5%88%99">&nbsp;查看交易挖矿规则&nbsp;</a>】
            【<a target='_blink' href="https://szcom.zendesk.com/hc/zh-cn/articles/360016533111-%E5%88%86%E7%BA%A2%E5%A5%96%E5%8A%B1%E8%A7%84%E5%88%99">&nbsp;查看收入分红规则&nbsp;</a>】
          </p>
        </div>

        <div className='pos-bottom'>
          <div className='nav-img'>
            <img src={miningImg} style={{ width: 104 }} />
          </div>
          <div className='bottom-one'>
            <p>今日待分配收入累计折合</p>
            <p>
              {topAllData ?
                <CountUp start={0} end={topAllData.todayPoundageAmountBtcTotal} duration={1} decimals={18} formattingFn={(num) => coinSplice(num, 8)} />
                :
                '- -'
              }
              {' BTC'}
            </p>
            <p>历史分红累计折合</p>
            <p>
              {topAllData ?
                <CountUp start={0} end={topAllData.sumDividendBtc} duration={1} decimals={18} formattingFn={(num) => coinSplice(num, 8)} />
                :
                '- -'
              }
              {' BTC'}
            </p>
          </div>

          <div className='bottom-one'>
            <p>昨日分配收入累计折合</p>
            <p>
              {topAllData ?
                <CountUp start={0} end={topAllData.yesterdayPoundageAmountBtcTotal} duration={1} decimals={18} formattingFn={(num) => coinSplice(num, 8)} />
                :
                '- -'
              }
              {' BTC'}
            </p>
            <p>昨日挖矿产出</p>
            <p>
              {topAllData ?
                <CountUp start={0} end={topAllData.diggingYesterdayTotal} duration={1} decimals={18} formattingFn={(num) => coinSplice(num, 2)} />
                :
                '- -'
              }
              {' SZ'}
            </p>

          </div>
          <div className='bottom-one'>
            <p>平台流通总量</p>
            <p>
              {topAllData ?
                <CountUp start={0} end={topAllData.circulationTotal} duration={1} decimals={18} formattingFn={(num) => coinSplice(num, 2)} />
                :
                '- -'
              }
              {' SZ'}
            </p>
            <p>市场流通总量</p>
            <p>
              {topAllData ?
                <CountUp start={0} end={topAllData.marketCirculationTotal} duration={1} decimals={18} formattingFn={(num) => coinSplice(num, 2)} />
                :
                '- -'
              }
              {' SZ'}
            </p>
          </div>
        </div>
        <div className='boder-div'><p></p></div>
        <div className='pos-bottom1'>

          <div className='nav-img'>
            <img src={orderImg} style={{ width: 104 }} />
          </div>
          <div className='bottom-one'>
            <p>今日总积分</p>
            <p>
              {topAllData ?
                <CountUp start={0} end={topAllData.totalPoint} duration={1} />
                :
                '- -'
              }
            </p>
          </div>

          <div className='bottom-one'>
            <p>昨日挂单挖矿产出</p>
            <p>
              {topAllData ?
                <CountUp start={0} end={topAllData.diggingEntrustOverTotal} duration={1} decimals={18} formattingFn={(num) => coinSplice(num, 2)} />
                :
                '- -'
              }
              {' SZ'}
            </p>
          </div>
          <div className='bottom-one'>
            <p>历史挂单挖矿产出累计</p>
            <p>
              {topAllData ?
                <CountUp start={0} end={topAllData.diggingEntrustYesterdayTotal} duration={1} decimals={18} formattingFn={(num) => coinSplice(num, 2)} />
                :
                '- -'
              }
              {' SZ'}
            </p>
          </div>
        </div>
      </div>
    )
  }

}
