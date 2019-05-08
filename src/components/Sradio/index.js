import React, { Component } from 'react'
import { autobind } from 'core-decorators'
import propTypes from 'prop-types';
import './style.less';



@autobind
export default class Sradio extends Component {

  static props = {
    list: propTypes.array,
    onChange: propTypes.func,
    theme: propTypes.string
  }

  static defaultProps = {
    list : [
      {
        label: '黑色',
        value: '000'
      },
      {
        label: '白色',
        value: 'fff'
      }
    ],

    theme: '000'
  }

  _changeIndex(item) {
    this.props.onChange(item)
  }

  render() {
    let {list, theme} = this.props
    return (
      <div className="Sradio">
        {
          list.map((item) => {
            return (
              <div>
                <span className={'box ' + (theme == item.value ? 'active' : '')} onClick={this._changeIndex.bind(this, item)}></span>
                <span>{item.label}</span>
              </div>
            )
          }) 
        }
      </div>
    )
  }
}
