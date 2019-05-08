import React from 'react';
import { autobind } from 'core-decorators';
import './style.less';
import PropTypes from "prop-types";
import NumbernodeTop from "components/NumbernodeTop"
import NodeBot from "components/NodeBot"
import NumbernodeMy from "components/NumbernodeMy"
import { Modal } from 'components/Modal';
import HButton from 'components/HButton';
import { getDecimal } from 'js';
import LineInput from 'components/LineInput';
import { getPositionList, applyNode, getNodeUnit, applyUnFreezeNode } from 'js/http-req';
import { message } from 'antd';
import { lStore } from 'js/index';
import { browser } from 'src';


@autobind
export default class Numbernode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nowNode: 0,
      mySz: 0,
      isShowApply: false,
      applyNum: '',
      total: 0,
      isShowtuichu: false,
      freezeNo: '',
      nodeSurplus: '',
      applyUnfreezeAmount: '',
      nodeUnit: '',
      isCifr: false,//点击确定按钮
    };
  }

  _getMySz() {
    let seq = {
      coinCode: 'SZ',
      pageSize: 1000,
      pageNo: 1
    }
    getPositionList(seq).then(res => {
      if (res.data.status == 200) {
        console.log(res.data.data.list, 'res.data.data.list')
        this.setState({
          mySz: res.data.data.list[0].currentAmount
        })
      }
    })
  }

  _getNodeUnit() {
    getNodeUnit().then(res => {
      if (res.data.status == 200) {
        this.setState({
          nodeUnit: res.data.data.keyValue
        })
      }
    })
  }

  _submitApply() {
    let { nodeUnit, mySz } = this.state;
    if (this.state.applyNum == '') {
      message.warning('请输入申请的节点数');
      return false
    }
    if (this.state.applyNum == 0) {
      message.warning('请输入申请的节点数');
      return false
    }
    if (this.state.applyNum * nodeUnit > mySz) {
      message.warning('SZ余额不足');
      return false
    }
    if (this.state.isCifr) {
      let seq = {
        nodeAmount: this.state.applyNum
      }
      applyNode(seq).then(res => {
        if (res.data.status == 200) {
          message.success('申请成功');
          this.child._init();
          this.childTop._getNodeTop();
          this.setState({
            isShowApply: false,
            applyNum: ''
          })
        }
      }).catch(err => {
        message.error(err.data.message);
      })
    }

    this.setState({
      isCifr: true
    })
  }

  _submitTuichu() {
    if (this.state.applyNum == '' || this.state.applyNum == 0) {
      message.warning('请输入申请的节点数');
      return false
    }
    if (this.state.applyNum > (this.state.nodeSurplus - this.state.applyUnfreezeAmount)) {
      message.warning('超过冻结节点数');
      return false
    }
    if (this.state.isCifr) {
      let seq = {
        freezeId: this.state.freezeNo,
        unfreezeNodeAmount: this.state.applyNum
      }
      applyUnFreezeNode(seq).then(res => {
        if (res.data.status == 200) {
          message.success('退出成功');
          this.child._init();
          this.childTop._getNodeTop();
          this.setState({
            isShowtuichu: false,
            freezeNo: '',
            applyNum: ''
          })
        }
      }).catch(err => {
        message.error(err.data.message);
      })
    }

    this.setState({
      isCifr: true
    })
  }

  inputHandler(name, value) {
    this.setState({
      [name]: value
    })
  }

  _showApply() {
    if (lStore.get('token')) {
      this._getNodeUnit();
      this._getMySz();
      this.setState({
        isShowApply: true,
        isCifr: false
      })
    } else {
      browser.push('/login');
    }
  }

  _showtuichu(freeze) {
    this.setState({
      isShowtuichu: true,
      freezeNo: freeze.id,
      nodeSurplus: freeze.nodeSurplus,
      applyUnfreezeAmount: freeze.applyUnfreezeAmount,
      isCifr: false
    })
  }

  _onCloseApply() {
    this.setState({
      applyNum: '',
      isShowApply: false
    })
  }

  _onClosetuichu() {
    this.setState({
      applyNum: '',
      isShowtuichu: false,
      freezeNo: ''
    })
  }

  onRef = (ref) => {
    this.child = ref
  } 

  onRefTop = (ref) => {
    this.childTop = ref
  } 

  render() {
    let { 
      mySz, 
      isShowApply, 
      applyNum, 
      nodeUnit, 
      isCifr ,
      isShowtuichu
    } = this.state;
    return (
      <div className="numbernode container">
        <NumbernodeTop showApply={this._showApply}  onRefTop={this.onRefTop}/>
        <NumbernodeMy onRef={this.onRef} showTuichu={this._showtuichu}/>
        <NodeBot />

        {
          isShowApply &&
          <Modal isShowButton={false} onClose={this._onCloseApply} className={'modal-apply' + (isCifr ? ' small-apply' : '')} title={isCifr ? '' : '输入数字节点'}>
            {isCifr ?
              <div>
                <p className='modal-apply-title'>确认申请<span>{applyNum}</span>个数字节点？</p>
                <HButton text='确认' onClick={this._submitApply} type='shuzi' style={{ width: 380, height: 46, margin: '0 auto', display: 'block', marginTop: 36 }} />
                <p className='color-p bottom-p'><span className='color-p2'>提示：</span>需要冻结{applyNum * 10}万个SZ</p>
              </div>
              : <div>
                <LineInput name='applyNum' onChange={this.inputHandler} value={applyNum} type='text' isCalc={'100000'} validate='number' propsStyle={{ width: 380, margin: '0 auto', marginTop: 50}} />
                <div style={{ textAlign: 'center', margin: '18px 0 20px 0' }}>
                  <p className='color-p'>可用SZ余额</p>
                  <p className='color-p2'>{getDecimal(mySz)}</p>
                </div>
                <HButton text='确认' onClick={this._submitApply} type='shuzi' style={{ width: 380, height: 46, margin: '0 auto', display: 'block', marginTop: 36 }} />
                <p className='color-p2 bottom-p'><span>提示：</span>默认数字节点锁仓1个月，到期自然延期1个月，到期前3天，可以申请解锁</p>
              </div>
            }
          </Modal>
        }

        {
          isShowtuichu &&
          <Modal isShowButton={false} onClose={this._onClosetuichu} className={'modal-tuichu' + (isCifr ? ' small-apply' : '')} title={isCifr ? '' : '输入数字节点'}>
            {isCifr ?
              <div>
                <p className='modal-tuichu-title'>确认退出<span>{applyNum}</span>个数字节点？</p>
                <HButton text='确认' onClick={this._submitTuichu} type='shuzi' style={{ width: 380, height: 46, margin: '0 auto', display: 'block', marginTop: 36 }} />
                <p className='color-p bottom-p'><span className='color-p2'>提示：</span>退出数字节点将会失去相应的权益</p>
              </div>
              : <div>
                <LineInput name='applyNum' onChange={this.inputHandler} value={applyNum} type='text' isCalc={'100000'} validate='number' propsStyle={{ width: 380, margin: '0 auto', marginTop: 50 }} />
                <HButton text='确认' onClick={this._submitTuichu} type='shuzi' style={{ width: 380, height: 46, margin: '0 auto', display: 'block', marginTop: 36 }} />
                <p className='color-p bottom-p'><span className='color-p2'>提示：</span>退出数字节点将会失去相应的权益</p>
              </div>
            }
          </Modal>
        }
      </div>
    )
  }
}
