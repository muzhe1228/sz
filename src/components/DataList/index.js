import React from 'react';
import {autobind} from 'core-decorators';
import PropTypes from 'prop-types';
import ListItem from './ListItem';
import './style.less';

@autobind
export default class DataList extends React.Component{
    static props = {
      url : PropTypes.string.isRequired,
      data : PropTypes.array.isRequired,
      loadingMore : PropTypes.boolean,
      render : PropTypes.func.isRequired,
      params : PropTypes.object
    }
    render(){
      const {data} = this.props;
        return(
            <div className="data-list">
                <hgroup className='table-title'>
                    {
                        data.map((item,index)=>{
                            return (
                              <h2 key={index}>{item.label}</h2>
                            )
                        })
                    }
                </hgroup>
                <ListItem {...this.props}></ListItem>
            </div>
        )
    }
}
