import React from 'react';
import PropTypes from 'prop-types';
import {autobind} from 'core-decorators';
import I18n,{I18nFunc} from 'components/i18n';
import './style.less';
import Trade from 'js/trade';
import {customEvent} from "js/index";
// import {lStore} from 'js/index';


@autobind
export default class Tabs extends React.Component {
    static props = {
        tabClick: PropTypes.func,
        tabIndex: PropTypes.number,
        favoriteIndex: PropTypes.number,
        page: PropTypes.string,
    };
    static defaultProps = {
        tabIndex: 1,
        favoriteIndex: 0,
    };
    static contextTypes = {
        tradeInfo: PropTypes.object
    };
    constructor(props, context){
        super(props, context);

        this.mounted = true;

        // var favs = Trade.getFavorites();
        var tIndex = Trade.getTabIndex();
        this.state = {
            index: tIndex===null ? this.props.tabIndex : tIndex,
            favorites: [],
            search: ''
        }
    }
    componentWillMount() {
        customEvent.on('TradeFav', this.onChangeFavorites);
    }

    componentDidMount() {
        this.loadFavorites();
    }

    loadFavorites(){
        Trade.loadFavorites(list=>{
            if (this.mounted){
                this.setState({favorites:list});

                customEvent.emit('TradeFav', {favorites:list});
            }
        });
    }

    componentWillUnmount() {
        this.mounted = false;

        customEvent.remove('TradeFav', this.onChangeFavorites);
    }

    onChangeFavorites(data){
        if (this.state.favorites.length!=data.favorites.length){
            this.setState({favorites:data.favorites});
        }
    }

    setIndex(index) {
        this.setState({index})
        Trade.setTabIndex(index);
    }

    onFavorites(action, code){
        var favorites = this.state.favorites;
        if (action=='add'){
            if (favorites.indexOf(code)==-1){
                Trade.addFavorites(code, (data)=>{
                    if (data.status==200){
                    }
                });
                favorites.unshift(code);
                this.setState({favorites});

                customEvent.emit('TradeFav', {favorites});
            }
        }else{
            var index = favorites.indexOf(code);
            if (index!=-1){
                Trade.removeFavorties(code, (data)=>{
                    if (data.status==200){
                    }
                })
                favorites.splice(index, 1);
                this.setState({favorites});

                customEvent.emit('TradeFav', {favorites});
            }
        }

    }
    onChangeSearch(e){
        var val = e.target.value;
        if (val!=this.state.search){
            this.setState({search: val});
        }
    }

    render() {
        const {tabClick, children, favoriteIndex,page} = this.props;
        const {index, favorites, search} = this.state;
        const {tradeInfo} = this.context;
        const allTradeInfo = tradeInfo.allTradeInfo;
        const allCoins = tradeInfo.allCoins;

        var child = React.Children.only(children);

        var dataList = [], market;
        //生成列表
        if (index!=favoriteIndex){
            var tabTradeInfo = allTradeInfo[index-1];
            if (tabTradeInfo) {
                for (var k in tabTradeInfo){
                    var tInfo = tabTradeInfo[k];
                    dataList = tInfo;
                    market = k;
                    break;
                }
            }
        }else{
            var flen = favorites.length;
            if (flen > 0) allTradeInfo.forEach((tabTradeInfo, i)=>{
                if (tabTradeInfo) {
                    var dlen = 0;
                    for (var k in tabTradeInfo){
                        var tInfo = tabTradeInfo[k];
                        tInfo.forEach((tv)=>{
                            if (favorites.indexOf(tv.tradeCode)!=-1){
                                dlen = dataList.push(tv);
                                if (dlen==flen) return;
                            }
                        });
                        if (dlen==flen) break;
                    }
                }
            });
        }
        var filter = this.props.filter ? this.props.filter : search;

        var newChild = React.cloneElement(child, {tab: index, dataList, market, onFavorites:this.onFavorites.bind(this), favorites, page, filter, allCoins});

        return page=='home' ?
            (<div className='trading-tabs'>
                <ul className="trading-nav">
                    {favoriteIndex===0 && <li onClick={_ => {
                        this.setIndex(0);
                        tabClick && tabClick(0);
                    }} key={0} className={"trading-nav-item " + (0 === index ? "active" : "")}><I18n message="Favorites"/></li>}
                    {
                        allTradeInfo.map((item, idx) => {
                            var tab = idx + 1;
                            var keys = Object.keys(item);
                            return <li
                                onClick={_ => {
                                    this.setIndex(tab);
                                    tabClick && tabClick(tab);
                                }}
                                className={"trading-nav-item " + (tab == index ? "active" : "")}
                                key={tab}>{item.icon ?
                                <span className={"icon iconfont icon-" + item.icon}></span> : ''}<I18n message="TradeMarket" params={[keys[0]]}/></li>
                        })
                    }
                    <div className="trading-nav-input"><input type="text" value={search} onChange={this.onChangeSearch} placeholder={I18nFunc("TradingPairSearch")} /></div>
                </ul>
                <div className="trading-content">
                    {newChild}
                </div>
            </div>)
            :
            (<div className='tabs'>
                    <ul className="tab-nav">
                        {
                            allTradeInfo.map((item, idx) => {
                                if (idx < 4) {
                                    var tab = idx + 1;
                                    var keys = Object.keys(item);
                                    var code = keys[0];
                                    return <li onClick={_ => {this.setIndex(tab);}} className={"tab-nav-item " + (tab == index ? "active" : "")} key={tab}>{code}</li>
                                }
                            })
                        }
                        <li onClick={_ => {this.setIndex(0);}} className={"tab-nav-item " + (0 == index ? "active" : "")} key={0}><I18n message="Favorites"/></li>
                    </ul>
                    <div className="tab-content">
                        {newChild}
                    </div>
                </div>)

    }
}
