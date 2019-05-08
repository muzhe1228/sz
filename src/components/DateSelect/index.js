import React from 'react';
import { autobind } from 'core-decorators';
import propTypes from 'prop-types';
import { DatePicker, Radio } from 'antd';
import './style.less';
import moment from 'moment';
import { beforeWeekMonth } from 'js/common'
@autobind
export default class DateSelect extends React.Component {
  static props = {
    startDate: propTypes.string,
    endDate: propTypes.string,
    isGlup: propTypes.bool,
    change: propTypes.func,
    btnChange: propTypes.func,
  }
  static defaultProps = {
    startDate: null,
    endDate: null,
    isGlup: true,
    change: function (time) {
      console.log(time, 'change')
    },
    btnChange: function (time) {
      console.log(time, 'Btnchange')
    }
  }
  state = {
    btnValue: 'all'
  }
  //监听选择框
  onChange(value, e, time) {
    this.props.change(time, value)
  }

  // 确定和点击按钮的操作
  Click(type, isRadio) {
    if (isRadio) {
      this.props.btnChange(this.props.startDate, this.props.endDate)
    } else {
      this.setState({
        btnValue: type.target.value
      })
      console.log(beforeWeekMonth(type.target.value))
      this.props.btnChange(beforeWeekMonth(type.target.value), type.target.value)
    }
  }

  render() {
    const { btnValue } = this.state
    const { isGlup, startDate, endDate } = this.props
    const dateFormat = 'YYYY-MM-DD';
    return (
      <div className="DateWrap">
        {isGlup ?
          <div className="DateWrap-glup">
            <div className='DateSelect'>
              <span>起止时间：&nbsp;&nbsp;&nbsp;从&nbsp;&nbsp;&nbsp;</span>
              <DatePicker
                value={startDate ? moment(startDate, dateFormat) : null}
                format="YYYY-MM-DD"
                placeholder="开始时间"
                className='selectData'
                onChange={this.onChange.bind(this, 'startDate')}
              />
              <span>&nbsp;&nbsp;&nbsp;至&nbsp;&nbsp;&nbsp;</span>
              <DatePicker
                value={endDate ? moment(endDate, dateFormat) : null}
                className='selectData'
                format="YYYY-MM-DD"
                placeholder="结束时间"
                onChange={this.onChange.bind(this, 'endDate')}
              />
              <p onClick={this.Click.bind(this, 'btn', 'notRadio')}>查询</p>
            </div>
            <div className='radio-glup'>
              <Radio.Group value={btnValue} buttonStyle="solid" onChange={this.Click}>
                <Radio.Button value="week">最近七天</Radio.Button>
                <Radio.Button value="month">最近1个月</Radio.Button>
                <Radio.Button value="all">全部时间</Radio.Button>
              </Radio.Group>
            </div>
          </div> :
          <div>
            <div className='DateSelect'>
              <span>选择时间：&nbsp;&nbsp;&nbsp;</span>
              <DatePicker
                value={startDate ? moment(startDate, dateFormat) : null}
                format="YYYY-MM-DD"
                placeholder="开始时间"
                className='selectData'
                onChange={this.onChange.bind(this, 'startDate')}
              />
              <p onClick={this.Click.bind(this, 'btn', 'notRadio')}>查询</p>
            </div>
          </div>
        }
      </div>

    )
  }
}