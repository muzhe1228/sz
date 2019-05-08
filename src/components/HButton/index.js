import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import './style.less';

@autobind
export default class HButton extends Component {
  static props = {
      text:PropTypes.string.isRequired,
      size : PropTypes.string.isRequired,
      type : PropTypes.string.isRequired,
      onClick : PropTypes.func.isRequired,
      light : PropTypes.boolean,
      radius : PropTypes.boolean,
      dim : PropTypes.boolean,
      id : PropTypes.string,
      disable: PropTypes.boolean,
      style: PropTypes.object
  };
  static defaultProps = {
    text : '按钮',
    size : 'small',
    type : 'default',
    radius : true,
    dim : false,
  };
  render() {
    const { text , size , type ,radius,onClick,dim, id, disable, style} = this.props;
    return (
      <div className={"btn"}>
          <button style={style} id={id} className={"btn-"+size+" btn-"+type+(radius?' radius' : '')+(dim?' dim':'')+(disable?' disable':'')} onClick={()=>(!dim && type!='disabled') && onClick && onClick()}><span>{text}</span></button>
      </div>
    )
  }

}
