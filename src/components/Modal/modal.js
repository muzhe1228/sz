import React, { Component } from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import HButton from 'components/HButton';
import './style.less';

@autobind
export default class Modal extends Component {

  constructor(props) {
      super(props);
      this.state = {
        next: this.props.next
      }
  }
  
  // 点击确认回调函数
  onOkClick() {
    if(this.state.next !== 0) {
      this.props.events[this.state.next-1](
        (flag) => {
          flag && this.setState({next: this.state.next-1});
        }
      );
    }else{
      this.props.onOk(
        (flag) => {
          flag && this.props.onClose();
        }
      );
    }
  }

  static props = {
    title: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.array]).isRequired,
    next: PropTypes.number.isRequired,
    className: PropTypes.string,
    maskClosable: PropTypes.bool,
    onOk: PropTypes.func,
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    isShowButton: PropTypes.bool
  }

  static defaultProps = {
    className: '',
    maskClosable: false,
    onOk: () => {},
    okText: 'OK',
    next: 0,
    isShowButton: true
  }

  render() {
    const {
      title,
      children,
      className,
      okText,
      cancelText,
      onClose,
      maskClosable,
      next,
      isShowButton
    } = this.props;
    return (
      <div className="modal" onClick={maskClosable ? onClose : () => {}}>
        <div className={"modal-content " + className}>
          <i className='iconfont icon-guanbi' onClick={onClose} style={{color: '#485E7E', fontSize: 16}}></i>
          <h2 className='modal-title'>{title}</h2>
          <div >
            {next != 0 ?children[this.state.next] : children}
          </div>
          {
            isShowButton?
            <div className={!cancelText ? 'modal-footer' : 'modal-footer2'}>
              <HButton type="sell" size="middle" onClick={this.onOkClick} text={this.state.next == 0 ? okText : '下一步'} />
                {cancelText && <HButton type="sell" size="middle" onClick={onClose} text={cancelText} />}
            </div>
            : ''
          }
          
        </div>
      </div>
    )
  }
}
