import React from 'react';
import propTypes from 'prop-types';
import {autobind} from 'core-decorators';
import './input.less';

@autobind
export default class Input extends React.Component {
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
    };
    static defaultProps = {
        disabled: false,
        error: false,
        unit: '',
        type: 'text',
        placeholder: '',
    };
    inputChange(e){
        const {name,onChange} = this.props;
        onChange(name,e.target.value);
    }
    inputBlur(e){
        const {name,onBlur} = this.props;
        onBlur && onBlur(name,e.target.value);
    }
    componentDidMount(){

    }
    render() {
        const {name, value, disabled, error, unit, type, placeholder} = this.props;
        return <div className={'input-component'+(error?' input-error':'')}>
            <div>
                <input name={name}
                       value={value}
                       type={type}
                       onChange={this.inputChange}
                       onBlur={this.inputBlur}
                       disabled={disabled}
                       placeholder={placeholder}
                />
                { unit && <span className='unit' ref={(val)=>this.unitNode = val}>{unit}</span>}
            </div>
        </div>
    }
}