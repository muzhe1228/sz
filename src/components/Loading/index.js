import React from 'react';
import PropTypes from 'prop-types';
import {autobind} from 'core-decorators';
import './style.less';

@autobind
export default class Loading extends React.Component{
    static propTypes={
        show:PropTypes.bool,
    }

    static defaultProps={
        show:false,//控制loading显示
    }

    render(){
        return(
            <div className={'Loading'+(this.props.show?' active':'')}>

            </div>
        )
    }
}