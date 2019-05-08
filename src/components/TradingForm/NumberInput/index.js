import React from "react";
import {autobind} from "core-decorators";
import PropTypes from 'prop-types';
import Decimal from 'js/decimal';

@autobind
export default class NumberInput extends React.Component {
    static defaultProps = {

    };

    static propTypes = {
        onChange: PropTypes.func,
        id:PropTypes.string,
        name:PropTypes.string,
        // type: PropTypes.string.isRequired,
        disabled: PropTypes.bool,
        defaultValue: PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
        value: PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
        placeholder: PropTypes.string,
        className: PropTypes.string,
        style: PropTypes.object,
        step: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    };

    constructor(props) {
        super(props);

        this.upDownInterval = 60;
        this.trigInterval = 500;
        this.upDownTimer = 0;
        this.upDownTrigTimer = 0;

        this.isKeyPressUp = false;
        this.isKeyPressDown = false;

        this.onArrowOut = this.onArrowOut.bind(this);

        this.upOrDown = 0;

        this.regExp = null;
        if (this.props.step){
            var step = this.props.step;
            this.changeStep(step);
        }else if(this.props.value){
            this.generateStep(this.props.value);
            this.regExp = this.generateRegExp(String(this.step));
        }

        this.value = this.props.value || this.props.defaultValue || "";
        this.state = {
            value:this.value
        }
    }
    changeStep(step){
        this.regExp = this.generateRegExp(String(step));
        this.step = step;
        if (this.step){
            this.generateInputStep(this.step);
        }
    }

    generateRegExp(num){
        var dnum = Decimal.getDotDigit(num);
        if (dnum > 0){
            this.dnum = dnum;
            return new RegExp("([0-9]+\\.[0-9]{"+dnum+"})[0-9]*", "g");
        }else{
            var tf = String(num).indexOf('e-');
            if (tf!=-1){
                var dnum = parseInt(String(num).split('e-')[1]);
                this.dnum = dnum;
                return new RegExp("([0-9]+\\.[0-9]{"+dnum+"})[0-9]*", "g");
            }
            this.dnum = 0;
            return new RegExp("([0-9]+)\\.[0-9]*", "g");
        }
    }

    calcAddOrSub(type){
        var val = this.state.value;
        if (isNaN(val)){
            val = 0;
        }
        if (!val){
            if (type=='add' && this.props.hasOwnProperty("min")){
                return this.props.min;
            }else if (type=='sub' && this.props.hasOwnProperty("max")){
                return this.props.max;
            }
        }

        if (this.props.hasOwnProperty("max") && type=='add' && Number(val)>=Number(this.props.max)){
            return val;
        }
        if (this.props.hasOwnProperty("min") && type=='sub' && Number(val)<=Number(this.props.min)){
            return val;
        }

        var step = this.step;
        return type=='add' ? String(Decimal.accAdd(val||0, step)) : String(Decimal.accSubtr(val||0, step));
    }

    calcArrow(type){
        var val = this.calcAddOrSub(type);
        this.onChange(val, this.props);
    }
    trigLoop(type){
        this.releaseTimer();
        this.upDownTimer = setInterval(()=>{
            this.calcArrow(type);
        }, this.upDownInterval);
    }
    timeoutTrigger(type){
        this.releaseTimer();
        this.upDownTrigTimer = setTimeout(()=>{
            this.trigLoop(type);
        }, this.trigInterval);
    }
    releaseTimer(){
        if (this.upDownTrigTimer){
            clearTimeout(this.upDownTrigTimer);
            this.upDownTrigTimer = 0;
        }

        if (this.upDownTimer){
            clearInterval(this.upDownTimer);
            this.upDownTimer = 0;
        }
    }
    onArrowUp(e){
        if (e){
            e.preventDefault();
            e.stopPropagation();
        }

        if (this.props.disabled || !this.step) return;

        this.upOrDown = 1;
        this.timeoutTrigger('add');
    }
    onArrowUpOut(e){
        if (e){
            e.preventDefault();
            e.stopPropagation();
        }

        if (this.props.disabled || !this.step) return;

        this.upOrDown = 0;
        this.releaseTimer();
        this.calcArrow('add');
    }

    onArrowDown(e){
        if (e){
            e.preventDefault();
            e.stopPropagation();
        }

        if (this.props.disabled || !this.step) return;

        this.upOrDown = 2;
        this.timeoutTrigger('sub');
    }

    onArrowDownOut(e){
        if (e){
            e.preventDefault();
            e.stopPropagation();
        }

        if (this.props.disabled || !this.step) return;

        this.upOrDown = 0;
        this.releaseTimer();
        this.calcArrow('sub');
    }

    onArrowOut(e){
        if (this.upOrDown==1){
            this.onArrowUpOut(e);
        }else if(this.upOrDown==2){
            this.onArrowDownOut(e);
        }
    }

    handleKeyPress(event){
        if (this.props.disabled) return;

        var e = event || window.event || arguments.callee.caller.arguments[0];
        if(e && (e.keyCode==38 || e.keyCode==33)) { // up
            if (!this.isKeyPressUp){
                this.isKeyPressUp = true;
                this.onArrowUp();
            }
            e.preventDefault();
        }else if(e && (e.keyCode==40 || e.keyCode==34)){ // down
            if (!this.isKeyPressDown){
                this.isKeyPressDown = true
                this.onArrowDown();
            }
            e.preventDefault();
        }

        return false;
    }
    handleKeyRelease(event){
        if (this.props.disabled) return;

        var e = event || window.event || arguments.callee.caller.arguments[0];
        if(e && (e.keyCode==38 || e.keyCode==33)) { // up
            this.onArrowUpOut();
            this.isKeyPressUp = false;
            e.preventDefault();
        }else if(e && (e.keyCode==40 || e.keyCode==34)){ // down
            this.onArrowDownOut();
            this.isKeyPressDown = false;
            e.preventDefault();
        }

        return false;
    }

    componentWillReceiveProps(nextProps){
        var val = nextProps.value;
        var oldval = val;
        if (nextProps.step && nextProps.step!=this.props.step){
            this.changeStep(nextProps.step);
        }
        if (val!=this.value){
            val = isNaN(val) ? '' : val;
            if (val){
                if (this.regExp){
                    if (Decimal.getDotDigit(val)>this.dnum){
                        val = String(val).replace(this.regExp, "$1");

                        if (oldval!=val){
                            if (this.props.onChange){
                                this.props.onChange(val);
                            }
                        }
                    }
                }else{
                    this.regExp = this.generateRegExp(String(val));

                    this.generateStep(val);
                }
            }

            if (val && this.step){
                val = this.limitValue(val, this.step);
            }

            this.onChange(val);
        }
    }

    limitValue(val, step){
        if (Math.abs(Number(val)) < Number(step)){
            if (this.props.hasOwnProperty("min") && Number(val)<=Number(this.props.min)) return String(this.props.min);
            return String(step);
        }
        else{
            var newVal = String(Decimal.accMul(Decimal.round(Decimal.accDiv(val, step)), step));
            return Number(newVal)==Number(val) ? val : newVal;
        }
    }

    generateStep(val){
        if (!this.step){
            //最小位数为步长
            var findex = String(val).indexOf('.');
            this.step = findex!=-1 ? 1/Math.pow(10, String(val).length - (findex+1)) : 1;
            this.generateInputStep(this.step);
        }
    }

    //输入时的限制，比如step为5，但输入的限制不能为5，只能为1
    generateInputStep(step){
        var stepStr = String(step);
        var pointIndex = stepStr.indexOf('.');
        if (pointIndex==-1) this.inputStep = 1;
        else{
            var len = stepStr.length;
            this.inputStep = Decimal.accDiv(1, Math.pow(10, len-1-pointIndex));
        }
    }

    changeNumberInput(e){
        e.preventDefault();

        var val = e.target.value;
        val = val.replace(/[^0-9.]/g, '');
        if (!isNaN(val)){
            if (this.regExp && Decimal.getDotDigit(val)>this.dnum){
                val = val.replace(this.regExp, "$1");
            }

            var inputStep = Number(this.inputStep);
            if ((inputStep>=1 || inputStep<1 && Decimal.getDotDigit(val)>=this.dnum) && val && this.inputStep){
                val = this.limitValue(val, this.inputStep);
            }

            this.onChange(val);
        }
    }

    onChange(val){
        if (this.state.value!=val){
            if (this.props.hasOwnProperty("max") && Number(val)>this.props.max) { //最大值不对，用回之前的值
                // return;
                val = this.props.max;
            }
            this.value = val;
            this.setState({value: val});

            if (this.props.onChange){
                this.props.onChange(val);
            }
        }
    }

    componentDidMount() {
        window.addEventListener("mouseup", this.onArrowOut);
    }

    componentWillUnmount() {
        window.removeEventListener("mouseup", this.onArrowOut);
        this.releaseTimer();
    }

    render() {
        const {id, name, disabled, placeholder, className, style} = this.props;
        const {value} = this.state;
        const self = this;

        return (
            <div className="form-input">
                <input type="text" id={id} name={name} value={value} style={style} placeholder={placeholder} disabled={disabled} className={className+(disabled?" disable":"")} onChange={this.changeNumberInput.bind(self)} onKeyDown={this.handleKeyPress.bind(this)} onKeyUp={this.handleKeyRelease.bind(this)}/>
                <div className="input-btn">
                    <i className="iconfont icon-numUp" onMouseDown={(e)=>{if (!disabled)this.onArrowUp(e)}}></i>
                    <i className="iconfont icon-numDown"  onMouseDown={(e)=>{if (!disabled)this.onArrowDown(e)}}></i></div>
            </div>
        )
    }

}
