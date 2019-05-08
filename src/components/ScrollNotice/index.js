import React from 'react';
import {autobind} from 'core-decorators';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import './style.less';

@autobind
export default class ScrollNotice extends React.Component{
    static propTypes={
        dataList:PropTypes.array,
        height:PropTypes.string,
        frequency:PropTypes.number,
    }

    static defaultProps={
        dataList:[],//公告数据
        height:'30px',//公告高度（带上单位）
        frequency:3000,//滚动频率
    }

    /*
        <ScrollNotice
            dataList={dataList}
        />
    */

    constructor(props){
        super(props);
        this.state={
            animation:false,
            translateY:0,
        };

        this.noticeList=null;
        this.onOff=true;
        this.timer=null;
        this.timer1=null;
        this.timer2=null;
    }

    componentDidMount(){
        this.startScroll();
    }

    componentDidUpdate(){
        this.startScroll();
    }

    componentWillUnmount(){
        clearInterval(this.timer);
        clearTimeout(this.timer1);
        clearTimeout(this.timer2);
    }

    startScroll(){
        let {dataList,frequency}=this.props;
        if(!dataList||!dataList.length)return;

        if(!this.onOff)return;
        this.onOff=false;

        let iCount=1;
        let iDis=100/(dataList.length+2);
        let tDis=0;

        this.setAnimation(false);
        this.setTranslateY(-iDis);
        clearInterval(this.timer);
        this.timer=setInterval(()=>{
            iCount++;
            if(iCount>dataList.length+1){
                iCount=2;
                this.setAnimation(false);
                this.setTranslateY(-iDis);
            }
            tDis=-iCount*iDis;

            clearTimeout(this.timer2);
            this.timer2=setTimeout(()=>{
                this.setAnimation(true);
                this.setTranslateY(tDis);
            },100);
        },frequency);
    }

    setAnimation(bool){
        this.setState({
            animation:bool,
        });
    }

    setTranslateY(translateY){
        this.setState({
            translateY:translateY+'%',
        });
    }

    render(){
        const {dataList}=this.props;
        const {animation,translateY}=this.state;

        return(
            <div className="ScrollNotice">
                <ol
                    className={animation?' ScrollNoticeAnimation':''}
                    style={{transform:`translate3d(0,${translateY},0)`}}
                    ref={(dom)=>{this.noticeList=dom}}
                >
                    {
                        dataList.length>0&&
                        <OLi
                            parent={this}
                            item={dataList[dataList.length-1]}
                        />
                    }

                    {dataList.map((item,index)=>(
                        <OLi
                            parent={this}
                            item={item}
                            key={index}
                        />
                    ))}

                    {
                        dataList.length>0&&
                        <OLi
                            parent={this}
                            item={dataList[0]}
                        />
                    }
                </ol>
            </div>
        )
    }
}

const OLi=(props)=>{
    const {parent,item}=props;
    const {height}=parent.props;

    return(
        <li
            style={{
                height:height,
                lineHeight:height,
            }}
        >
            {
                item.link&&
                <a target='_blink' href={item.link}></a>
            }
            {item.text}
        </li>
    )
};
