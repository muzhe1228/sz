import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import './style.less';

@autobind
export default class Input extends Component {
  static props = {
      name:PropTypes.string.isRequired,
      changeVal : PropTypes.func.isRequired,
      value:PropTypes.string,
      placeholder:PropTypes.string,
      type: PropTypes.string,
      icon : PropTypes.string,
      eyeToggle : PropTypes.func,
      append : PropTypes.string,
      disabled : PropTypes.bool,
      errorHint : PropTypes.bool,
      onFocus : PropTypes.func,
      maxlength : PropTypes.string,
      autofocus : PropTypes.string,
  };
  static defaultProps = {
      placeholder:'',
      type:'text',
      append : '',
      value : '',
      icon : '',
      disabled : false,
      errorHint : false,
      autofocus : false
  };
  state = {
    hideClose : false,
  }
  getVal(e) {
    this.props.changeVal(this.props.name,e.target.value);
  }
  render() {
    const { value , placeholder , eyeToggle , append , type , icon , disabled ,clearVal,errorHint,onFocus,maxlength,autofocus} = this.props;
    return (
      <div className="form-input">
      {
        append === 'B-Copy'
        ?
        <input type="password" maxLength={maxlength} className={(errorHint?'error-hint ':'')+ (icon!=''?'left-icon' : '')} autoFocus={autofocus} placeholder={placeholder} value={value || ""} disabled={disabled} onChange={this.getVal} onFocus={onFocus&&onFocus()} />
        :
        append === 'B-Copy1'
        ?
        <input type={'text'} maxLength={maxlength} className={(errorHint?'error-hint ':'') + (icon!=''?'left-icon' : '')} autoFocus={autofocus} placeholder={placeholder} value={value || ""} disabled={disabled} onChange={this.getVal} onFocus={onFocus&&onFocus()} />
        :
        <input type={type} maxLength={maxlength} className={(errorHint?'error-hint ':'') + (icon!=''?'left-icon' : '')} autoFocus={autofocus} placeholder={placeholder} value={value || ""} disabled={disabled} onChange={this.getVal} onFocus={onFocus&&onFocus()} />

      }
        {
            icon === '+86'
            ?
              <div className="icon-wrap">{icon}</div>
            :
            icon != '+86' && icon != ''
            ?
              <div className="icon-wrap"><div className={"icon iconfont icon-" + icon}></div></div>
            :
            ""
        }
        <div className="icon-right">
            {
                clearVal && value.length != 0
                    ?
                    <i onClick={_=>clearVal&&clearVal()} className="iconfont icon-B-Copy6"></i>
                    :
                    ""
            }
            {
                append
                    ?
                    <i onClick={_=>eyeToggle&&eyeToggle()} className={"iconfont icon-" + append}></i>
                    :

                    ''
            }
        </div>



      </div>
    )
  }
}
