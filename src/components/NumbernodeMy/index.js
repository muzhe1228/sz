import React from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import { message, Button, Tooltip } from 'antd';
import { getMyNode, getNodeList, getPositionList, getSingleSz } from 'js/http-req';
import { showTimeNeed, showNum } from 'js/common';
import { lStore } from 'js/index';
import { browser } from 'src';
import './style.less';

@autobind
class MiningMy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nowNode: 0,
      nodeList: [],
      isShowApply: false,
      isShowtuichu: false,
      applyNum: '',
      mySz: '',
      lockUnit: '',
      lockAllNum: {},
      isCifr: false,//点击确定按钮
      toolTipText: '',//倒计时
      MyEarnings: ''
    };
  }

  componentDidMount() {
    this.props.onRef(this);
    if (this.props.userMsg) {
      this._init();
      this._getMyEarnings();
    }
  }

  _init() {
    this._getMyNode();
  }

  //我的收益
  _getMyEarnings() {
    getSingleSz('/user_profit/get_profit_total').then((res) => {
      this.setState({
        MyEarnings: res.data.data.nodeDividendProfitSumBtc
      })
    })
  }

  _getMyNode() {
    getMyNode().then(res => {
      if (res.data.data && res.data.status == 200) {
        this.setState({
          nowNode: res.data.data.nodeAmount
        })
      }
      this._getNodeList();
    }).catch(err => {
      this._getNodeList();
      console.log(err.data);
    })
  }

  _getNodeList() {
    let req = {
      pageNo: 1,
      pageSize: 8
    }
    getNodeList(req).then(res => {
      if (res.data.status == 200) {
        this.setState({
          nodeList: res.data.data,
        })
      }
    }).catch(err => {
      console.log(err.data);
    })
  }

  //监听input输入框
  inputHandler(name, value, params) {
    console.log(value)
    this.setState({
      applyNum: value
    })
  }

  //倒计时间
  _showTimeNeed(end) {
    this.setState({
      toolTipText: showTimeNeed(end,'申请退出')
    })
  }

  _goNode() {
    lStore.set('userTab', 4);
    browser.push('/user_center/digital_node');
  }

  render() {
    const { toolTipText, nowNode, nodeList, MyEarnings } = this.state;
    let now = new Date();
    return (
      <div className="node-my">
        {
          !this.props.userMsg &&
          <div className='no-login'>
            <Link to='/login'><span>登录</span></Link>或<Link to='/register'><span>注册</span></Link>查看我的数字节点
          </div>
        }

        {
          this.props.userMsg &&
          <div className="myDiff">
            <ul className="myDiff-left">
              <li>当前数字节点</li>
              <li style={{ fontSize: 38, color: '#D89A05' }}>{nowNode}</li>
              <li style={{ fontSize: 12, color: ' #485E7E' }}>我的分红累计折合：<span style={{ color: '#7D8CA5', fontSize: 16 }}>{showNum(MyEarnings) + ' BTC'}</span></li>
            </ul>
            <div className="myDiff-right">
              <ul className="myDiff-right-title">
                <li>申请时间</li>
                <li>节点数量</li>
                <li>申请退出数量</li>
                <li>操作</li>
              </ul>

              {nodeList.total ?
                nodeList.list.map((item) => {
                  return (<ul className="myDiff-right-single" key={item.id}>
                    <li>{item.freezeTime}</li>
                    <li>{item.nodeSurplus}</li>
                    <li>{item.applyUnfreezeAmount}</li>
                    <li>{
                      new Date(item.allowApplyUnfreezeTime.replace(/\-/g,'-')).getTime() <= now.getTime() ?
                        <p className="lockHandle" onClick={this.props.showTuichu.bind(this, item)}>申请退出</p>
                        :
                        <p className="lockHover">
                          <Tooltip placement="leftBottom" mouseEnterDelay={0.1} mouseLeaveDelay={0.1} trigger='hover' title={toolTipText}>
                            <span onMouseEnter={this._showTimeNeed.bind(this, item.allowApplyUnfreezeTime,'申请退出')}>查看</span>
                          </Tooltip>
                        </p>
                    }
                    </li>
                  </ul>)
                }) : <p className="notData">暂无数据</p>}
              {nodeList.total >= 3 ? <a onClick={this._goNode} className="showMore">查看更多></a> : <a onClick={this._goNode} className="showMore">查看历史></a>}
            </div>
          </div>
        }

      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    userMsg: state.userMsg.userMsg
  }
}

export default connect(mapStateToProps)(MiningMy);

