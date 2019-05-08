import React from 'react';
import {autobind} from 'core-decorators';
import {I18nFunc} from 'components/i18n';

@autobind
export default class PayPwd extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            val: ''
        }
    }

    onChangePayPwd(e){
        e.preventDefault();

        var val = e.target.value;
        if (this.state.val!=val){
            val = val.replace(/[^0-9]/g, '');
            this.setState({val});
            if (this.props.onChange) this.props.onChange(val);
        }
    }

    render(){
        const {val} = this.state;

        return <div style={{padding: "0px 125px", marginTop: "40px", marginBottom: "60px"}}>
            <div style={{marginBottom: "20px"}}>
                <div className="line-input">
                    <div><input name="password" type="password" placeholder={I18nFunc("TradingFormPayPwdTip")} value={val} onChange={this.onChangePayPwd} maxLength="6" /></div>
                </div>
            </div>
        </div>
    }
}
