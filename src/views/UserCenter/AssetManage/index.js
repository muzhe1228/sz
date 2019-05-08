import React from 'react';
import {autobind} from 'core-decorators';
import {Route} from 'react-router-dom';
import MyWallet from './MyWallet';
import RechargeHistory from './RechargeHistory';
import WithdrawHistory from './WithdrawHistory';
import AssetWater from './AssetWater';
import WithdrawAddr from './WithdrawAddr';
import Transfer from './Transfer';
import './style.less';

@autobind
export default class AssetManage extends React.Component{
    render(){
        return(
            <div className="asset-manage" style={{flex:"1"}}>
                <Route exact path="/user_center/asset_manage/my_wallet" component={MyWallet} />
                <Route  path="/user_center/asset_manage/recharge_history" component={RechargeHistory} />
                <Route  path="/user_center/asset_manage/withdraw_history" component={WithdrawHistory} />
                <Route  path="/user_center/asset_manage/asset_water" component={AssetWater} />
                <Route  path="/user_center/asset_manage/withdraw_addr" component={WithdrawAddr} />
                {/* <Route  path="/user_center/asset_manage/transfer" component={Transfer} /> */}
            </div>
        )
    }
}
