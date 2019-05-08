import React,{Component} from 'react';
import propTypes from 'prop-types';
import { autobind } from 'core-decorators';
import '../select.less'

@autobind
class Select extends Component{
    static props = {
        name:propTypes.string,
        label:propTypes.string,
        value:propTypes.string,
        onChange:propTypes.func.require,
        config:propTypes.object.require
    };
    state = {
        dropDown:true
    }
    static defalutProps = {

    }
    changeItem(name,value){
        const {onChange} = this.props;
        onChange(name,value);
    }
    selectClick(){
        let {dropDown} = this.state;
        this.setState({dropDown:!dropDown})
    }
    componentDidMount(){
        document.addEventListener('click',this.eventListener);
    }
    eventListener(ev){
        if(this.selectContainer && !this.selectContainer.contains(ev.target)){
            !this.state.dropDown && this.setState({dropDown:true})
        }
    }
    componentWillUnmount(){
        document.removeEventListener('click',this.eventListener);
    }
    render(){
        const {name,config,value} = this.props;
        const {dropDown} = this.state;
        const borderCls = dropDown ? '' : 'blueBorder';
        return(
            <div className={"select-comp "+borderCls} onClick={()=>this.selectClick()} ref={(container)=>{this.selectContainer=container}}>
                {
                    // value ?
                    //     config.options && config.options.map((item,idx)=>{
                    //         if(value == item.value){
                               <span>{value}<i className="arrow"></i></span>
                        //     }
                        //     return '';
                        // })
                        // : (config.placeholder ? <span>{config.placeholder}</span> : '')

                }
                <ul>
                    {
                        config && config.options && config.options.map((item,idx)=>{
                            return <li key={idx} onClick={()=>this.changeItem(name,item.value)}>{item.label}</li>
                        })
                    }
                </ul>
            </div>
        )
    }
}

export default Select;
