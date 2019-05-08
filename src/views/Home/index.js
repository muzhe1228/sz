import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Header from 'components/Header';
import Footer from 'components/Footer';
import Page404 from 'views/Page404';
import Login from 'views/Login';
import Register from 'views/Register';
import UserCenter from 'views/UserCenter';
import HomePage from 'views/HomePage';
import Trading from 'views/Trading';
import Mining from 'views/Mining';
import Numbernode from 'views/Numbernode';
import MyLock from 'views/Mining/MyLock';
import MyDiff from 'views/Mining/MyDiff';
import AppDownload from 'views/AppDownload';
import { lStore } from 'js';
import PropTypes from 'prop-types';
import postDowonloadImg from 'images/allPoster.jpg'
import './style.less';

export default class Home extends React.Component {
    getChildContext() {
        return {
            getGeet: this.getGeet.bind(this)
        }
    }
    state = {
        pageRouter: [
            {
                url: '/trading',
                component: Trading
            },
            {
                url: '/mining',
                component: Mining
            },
            {
                url: '/numbernode',
                component: Numbernode
            },

            {
                url: '/my_lock',
                component: MyLock
            },
            {
                url: '/my_diff',
                component: MyDiff
            },
            {
                url: '/user_center',
                component: UserCenter
            },
            {
                url: '/login',
                component: Login
            },
            {
                url: '/register',
                component: Register
            },
            {
                url: '/app_download',
                component: AppDownload
            },
            {
                url: '**',
                component: Page404
            },
        ],
        show:""
    }
    getGeet() {
        this.Geet.getgeet();
    }
    render() {
        const { pageRouter } = this.state;
        return (
            <div className={"home " + (lStore.get('theme') == 'fff'? 'theme-white' :  '')}>
                <Header />
                <Switch>
                    <Route exact path='/' component={HomePage} />
                    {
                        pageRouter.map((item, index) => {
                            return (
                                <Route key={index} path={item.url} component={item.component} />
                            )
                        })
                    }
                </Switch>
                <Footer bg="#08112C" />
                
                {/* <div className="modeAllShade">
                    <img src={postDowonloadImg} alt=""/>
                </div>
                <div className="modeAllShade1"></div> */}
            </div>
        )
    }
}
Home.childContextTypes = {
    getGeet: PropTypes.func
}
