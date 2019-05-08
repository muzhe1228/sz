import React, { Component } from 'react'
import {autobind} from 'core-decorators';
import PropTypes from 'prop-types';
import './style.less';

@autobind
export default class TimeButton extends Component{
    constructor(props){
        super(props);
        this.state={
          text: this.props.text? this.props.text : '获取验证码',
          enable: true
        };
    }

    static props = {
      text: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      time: PropTypes.number,
      radius: PropTypes.bool,
      className: PropTypes.string,
      id: PropTypes.string,
    }

    Ok() {
      if(this.props.onClick && this.state.enable) {
        this.props.onClick();
      }
    }

    start() {
      if(!this.state.enable) return;
      this.setState({enable: false});
      let time = this.props.time? this.props.time : 60;
      let timeId = setInterval(()=>{
        if(time == 1 ){
          clearInterval(timeId);
          this.setState({text: this.props.text? this.props.text : '获取验证码'});
          this.setState({enable: true});
        }else{
          time --;
          this.setState({text: time+'s'});
        }
      }, 1000)
    }

    render(){
        const {className, radius, id} = this.props;
        const {text} = this.state;
        return(
            <div id={id} className={'time-button' +(className? ' '+className : '') + (radius? ' time-button-radius': '')} onClick={this.Ok}>
              {text}
            </div>
        )
    }
}
