import React from 'react';
import {autobind} from "core-decorators";

import {I18nFunc} from 'components/i18n';
import {TradingTabs} from "../TradingTabs";
import TradingList from "../TradingList";

@autobind
export default class TradingPairList extends React.Component{ //交易界面左上角 币对列表
    constructor(props, context){
        super(props, context);

        this.state = {
            search: ''
        }
    }

    onChangeSearch(e){
        var val = e.target.value;
        if (val!=this.state.search){
            this.setState({search: val});
        }
    }



    render(){
        const {search} = this.state;
        const {item} = this.props;

        return <div className="search-currency">
            <div className="search">
                <div className="form-input">
                    <div className="search-left iconfont icon-sousuo"></div>
                    <input type="text" className="" placeholder={I18nFunc("TradingPairSearch")} value={search} onChange={this.onChangeSearch} />
                </div>
            </div>
            <TradingTabs page="trading" filter={search} item={item}>
                <TradingList />
            </TradingTabs>
        </div>
    }
}
