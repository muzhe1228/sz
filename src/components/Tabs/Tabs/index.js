import React from 'react';
import PropTypes from 'prop-types';
import {autobind} from 'core-decorators';
import './style.less';

@autobind
export default class TradingTabs extends React.Component {
    static props = {
        labels: PropTypes.array.isRequired,
        tabClick: PropTypes.func,
        tabIndex : PropTypes.number,
    };
    static defaultProps = {
        tabIndex: 0,
    };

    constructor(props) {
        super(props);

        this.state = {
            index : this.props.tabIndex
        };
    }

    setIndex(index) {
        this.setState({index})
    }
    render() {
        const {labels,tabClick} = this.props;
        const {index} = this.state;
        return (
            <div className='tabs'>
                <ul className="tab-nav">
                    {
                        labels.map((item, idx) => <li
                            onClick={_ => {
                                let flag = true;
                                if(tabClick) {
                                  let tabFlag = tabClick(idx);
                                  if(typeof tabFlag == 'boolean') flag =tabFlag;
                                  if(!flag) return false
                                }
                                this.setIndex(idx);
                            }}
                            className={"tab-nav-item " + (idx === index ? "active" : "")}
                            key={idx}>{item.icon?<span className={"icon iconfont icon-"+item.icon}></span> : ''}{item.label}</li>)
                    }
                </ul>
                <div className="tab-content">
                    {
                        this.props.children[index]
                    }
                </div>
            </div>
        )
    }
}
