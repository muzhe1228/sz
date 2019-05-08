import React from 'react';
import { autobind } from 'core-decorators';
import propTypes from 'prop-types';
import './style.less';

@autobind
export default class MiningNav extends React.Component {
  static props = {
    onChange: propTypes.func,
    titleArr: propTypes.array
  }
  state = {
    navIndex: 0
  }
  navHandle(index) {
    this.setState({
      navIndex: index
    })
    if (this.props.onChange) {
      this.props.onChange(index)
    }
  }
  render() {
    const { navIndex } = this.state;
    const { titleArr } = this.props;
    return (
      <div className="miningBot-nav">
        {
          titleArr.map((item, index) => {
            return (
              <p key={index} className={navIndex == index ? 'active' : ''} onClick={this.navHandle.bind(this, index)}>{item.name}</p>
            )
          })
        }
      </div>
    )
  }

}