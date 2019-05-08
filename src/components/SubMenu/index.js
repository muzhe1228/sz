import React from 'react';
import {autobind} from 'core-decorators';
import {NavLink} from 'react-router-dom';
import {lStore} from 'js';
import propTypes from 'prop-types';
import './style.less';

@autobind
export default class SubMenu extends React.Component {
  static props = {
    dataList: propTypes.array,
  }
  state = {
    showIndexList: -1
  }
  static defaultProps = {
    dataList: [
      {
        title: '个人中心',
        icon: '',
        menuList: [
          {
            label: '我的钱包',
            url: '/liuhsd'
          },
          {
            label: '充值历史',
            url: '/liuhsd'
          },
          {
            label: '提现历史',
            url: '/liuhsd'
          },
          {
            label: '资产流水',
            url: '/liuhsd'
          }
        ]
      },
      {
        title: '资产管理',
        icon: '',
        menuList: [
          {
            label: '我的钱包',
            url: '/user_center/asset_manage/my_wallet'
          },
          {
            label: '充值历史',
            url: '/user_center/asset_manage/recharge_history'
          },
          {
            label: '提现历史',
            url: '/acctone'
          },
          {
            label: '资产流水',
            url: '/acctone'
          },
          {
            label: '提币',
            url: '/acctone'
          }
        ]
      }
    ]
  }

  componentWillMount() {
    this.showList(lStore.get('userTab'))
  }

  showList(index) {
    this.setState({
      showIndexList: index
    });
    lStore.set('userTab', index)
    const {showIndexList} = this.state;
    if (showIndexList === index) {
      this.setState({
        showIndexList: -1
      });
    }
  }

  render() {
    const {dataList} = this.props;
    const {showIndexList} = this.state;
    return (
      <div className="sub-menu">
        {
          dataList.map((item, index) => {
            return (
              <div key={index} className='sub-menu-wrap'>
                <h2 onClick={() => this.showList(index)}>
                                <span>
                                <i className={'iconfont ' + item.icon}></i>
                                  {item.title}
                                </span>
                  <em className='arrow'
                      style={{transform: showIndexList === index ? "rotate(135deg)" : "rotate(-45deg)"}}></em>
                </h2>
                {
                  showIndexList === index
                    ?
                    <div className="list">
                      {
                        item.menuList.map((row, idx) => {
                          return (
                            <NavLink activeClassName="active" key={idx} to={row.url ? row.url : '/'}>
                              <span>{row.label}</span>
                            </NavLink>
                          )
                        })
                      }
                    </div>
                    :
                    ''
                }
              </div>

            )
          })
        }
      </div>
    )
  }
}
