import React,{Component} from 'react';
import propTypes from 'prop-types';
import { autobind } from 'core-decorators';
import '../select.less'

@autobind
class InputSelect extends Component{

    static props = {
        name:propTypes.string,
        label:propTypes.string,
        value:propTypes.string,
        onChange:propTypes.func.require,
        placeholder:propTypes.string,
        config:propTypes.object.require
    };
    state = {
        dropDown:true,
        dropOptions:[],
        selectVal:''
    }
    static defaultProps = {
        placeholder:'请输入选项',
        config:{}
    }
    changeItem(name,value){
        const {onChange} = this.props;
        onChange(name,value);
    }
    selectClick(){
        this.state.dropDown && this.setState({dropDown:false})
    }
    componentDidMount(){
        this.setState({dropOptions:this.props.config.options});
        document.addEventListener('click',this.eventListener);
        document.addEventListener('keyup',this.dealKeyEvent)
    }
    dealKeyEvent(ev){

    }
    eventListener(ev){
        if(this.selectContainer && !this.selectContainer.contains(ev.target)){
            !this.state.dropDown && this.setState({dropDown:true})
        }
        this.pureSelectResuld();
    }
    pureSelectResuld(){
        const {dropOptions,selectVal} = this.state;
        selectVal == '' && dropOptions.filter((item)=>{
            return item.active = false;
        })
        this.setState({dropOptions:dropOptions});
    }
    searchSelect(ev){
        const {config} = this.props;
        let res = ev.target.value;
        let newArr = config.options.filter((item,idx)=>{
            return item.label.includes(res);
        });
        this.state.dropDown ? this.setState({dropDown:false,selectVal:res}): this.setState({selectVal:res})
        newArr = this.autoResult(res,newArr);
        this.setState({dropOptions:newArr});
    }
    autoResult(res,arr){
        arr.length > 0 && res!='' ? (arr[0].active = true) :
            (arr.filter((item)=>{return item.active = false}));
        return arr;
    }
    mouseLi(idx){
        let {dropOptions} = this.state;
        dropOptions.filter((item,idx)=>{
            return item.active = false;
        });
        dropOptions[idx].active = true;
        this.setState({dropOptions:dropOptions})
        //this.setState({dropOptions:arr});
        // dropOptions[idx].active = true;
    }
    componentWillUnmount(){
        document.removeEventListener('click',this.eventListener);
        document.removeEventListener('keyup',this.dealKeyEvent);
    }
    render(){
        const {name,value,placeholder} = this.props;
        const {dropDown,dropOptions} = this.state;
        const borderCls = dropDown ? '' : 'blueBorder';
        return(
            <div className={"select-comp "+borderCls} onClick={()=>this.selectClick()}
                 ref={(container)=>{this.selectContainer=container}}
            >
                {
                    value ?
                        dropOptions && dropOptions.map((item,idx)=>{
                            if(value == item.value){
                                return <input key={idx} defaultValue={item.label}
                                              placeholder={placeholder}
                                              onChange={this.searchSelect}
                                />
                            }
                            return '';
                        })
                        : <input placeholder={placeholder} onChange={this.searchSelect}/>

                }
                <ul>
                    {
                        dropOptions && dropOptions.map((item,idx)=>{
                            return <li key={idx}
                                       onMouseEnter ={()=>this.mouseLi(idx)}
                                       onClick={()=>this.changeItem(name,item.value)}
                                       className={item.active ? 'active' : ''}
                            >{item.label}</li>
                        })
                    }
                </ul>
            </div>
        )
    }
}

export default InputSelect;