import React from 'react';
import propTypes from 'prop-types';
import { autobind } from 'core-decorators';
import './style.less';

@autobind
export default class SzInput extends React.Component {
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
    validate: propTypes.string
  };
  static defaultProps = {
    disabled: false,
    error: false,
    unit: '',
    type: 'text',
    placeholder: '',
  };

  inputChange(e) {
    const { name, onChange, validate, type } = this.props;
    if(validate == 'number') {
      e.target.value = e.target.value.replace(/[^\d]/g,'');
    }
    if(validate == 'money') {
      e.target.value = e.target.value.replace(/[^\d.]/g,'');
    }
    if(validate == 'yzm') {
      e.target.value = e.target.value.replace(/[^\d]/g,'');
      e.target.value.length > 6? e.target.value = e.target.value.substring(0, 6) : e.target.value = e.target.value;
    }
    if(type == 'password') {
      e.target.value.length > 20? e.target.value = e.target.value.substring(0, 20) : e.target.value = e.target.value;
    }
    if(validate == 'iCode') {
      e.target.value = e.target.value.replace(/[^^[0-9a-zA-Z]+$/g,'');
    }
    onChange && onChange(name, e.target.value);
  }
  inputBlur(e) {
    const { name, onBlur } = this.props;
    onBlur && onBlur(name, e.target.value);
  }

  clearInputValue = () => {
    if (this.inputRef) {
      this.inputRef.value = '';
    }
  }


  render() {
    const { name, value, disabled, error, unit, type, placeholder, inputStyle } = this.props;
    return (
      <div className={'sz-input' + (error ? ' input-error' : '')}>
        <div>
          <input 
            ref={el => this.inputRef = el}
            name={name}
            value={value}
            type={type}
            style={inputStyle}
            onChange={this.inputChange}
            onBlur={this.inputBlur}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete='off'
          />
          {unit && <span className='unit' ref={(val) => this.unitNode = val}>{unit}</span>}
        </div>
      </div>
    )
  }
}
