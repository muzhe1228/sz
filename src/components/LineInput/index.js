import React from 'react';
import { autobind } from 'core-decorators';
import propTypes from 'prop-types';
import { message, Icon } from 'antd';
import './style.less';

@autobind
export default class LineInput extends React.Component {

  static props = {
    name: propTypes.string.isRequired,
    value: propTypes.string.isRequired,
    onChange: propTypes.func.isRequired,
    onBlur: propTypes.func,
    disabled: propTypes.bool,
    error: propTypes.bool,
    unit: propTypes.string,
    type: propTypes.string,
    placeholder: propTypes.string,
    propsStyle: propTypes.object,
    validate: propTypes.string,
    isCalc: propTypes.string
  };

  static defaultProps = {
    disabled: false,
    error: false,
    unit: '',
    type: 'text',
    placeholder: '',
    isCalc: ''
  };
  inputChange(e) {
    const { name, onChange, validate, type, params, isCalc } = this.props;
    //纯数字
    if (validate == 'number') {
      let obj = e.target, reg = /^[1-9][0-9]?/g, isTrue = reg.test(obj.value);
      if (!isTrue) {
        console.log(obj.value)
        if (obj.value && obj.value !== 0){
          message.warning('请输入非零正整数！')
        }
          
      }
      obj.value = obj.value.replace(/[^\d]$/g, '').replace(/^[^1-9]/, '');
    }
    //数字和小数
    if (validate == 'numbers') {
      let obj = e.target, reg = /^[0-9]{1,}\.?[0-9]{0,}$/g, isTrue = reg.test(obj.value);
      if (!isTrue) {
        if (obj.value && obj.value !== 0){
          message.warning('请输入数字或小数！')
        }
        
      }
      obj.value = obj.value.replace(/^\./, '').replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/[^\d\.?]/, '');
    }
    if (validate == 'money') {
      let obj = e.target, reg = /^[0-9]{1,}\.?[0-9]{0,}$/g, isTrue = reg.test(obj.value);
      if (!isTrue) {
        if (obj.value && obj.value !== 0){
          message.warning('请输入数字或小数！')
        }
      }
      obj.value = obj.value.replace(/^\./, '').replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/[^\d\.?]/, '');
    }
    if (validate == 'yzm') {
      e.target.value = e.target.value.replace(/[^\d]/g, '');
      e.target.value.length > 6 ? e.target.value = e.target.value.substring(0, 6) : e.target.value = e.target.value;
    }
    if (type == 'password') {
      e.target.value.length > 20 ? e.target.value = e.target.value.substring(0, 20) : e.target.value = e.target.value;
    }
    onChange && onChange(name, e.target.value, params);
  }

  inputBlur(e) {
    const { name, onBlur } = this.props;
    onBlur && onBlur(name, e.target.value);
  }
  inputFocus(e) {
    const { name, onFocus } = this.props;
    onFocus && onFocus(name, e.target.value);
  }
  componentDidMount() {

  }
  render() {
    const { name, value, disabled, error, type, placeholder, propsStyle, isCalc } = this.props;
    return (
      <div className={'line-input' + (error ? ' input-error' : '')} style={propsStyle}>
        <div>
          <input name={name}
            value={value}
            type={type}
            onChange={this.inputChange}
            onBlur={this.inputBlur}
            onFocus={this.inputFocus}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete='off'
          />
          {isCalc &&
            <p className='calcNum'><Icon type="close" />{isCalc}</p>
          }

        </div>
      </div>
    )
  }
}
