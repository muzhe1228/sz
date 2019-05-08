import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import shadeImg from 'images/newCover.png'
import './style.less';

@autobind
export default class AllShade extends Component {
  render() {
    return (
      <div className="afterShade">
        <img src={shadeImg} alt="SZ币"/>
      </div>
    )
  }

}
