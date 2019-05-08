import React, {Component} from 'react';
import PropTypes from 'prop-types';
import API from 'js/api';
import { autobind } from 'core-decorators';
import {scientificToNumber} from 'js';

@autobind
export default class ListItem extends Component {
  static props = {
    url : PropTypes.string.isRequired,
    data : PropTypes.array.isRequired,
    loadingMore : PropTypes.boolean,
    operateList : PropTypes.array,
    params : PropTypes.object,
    render : PropTypes.func,
    hasNextPage : PropTypes.func,
  }
  static defaultProps = {
    url : ''
  }
  state = {
    arr: [],
    operateList : [],
    noData : false,
    dataList : [
      {
          coinKind : 'USDT',
          drawMax : 1000,
          isdraw : 20,
          appraisement : '--',
      },
      {
          coinKind : 'ETH',
          drawMax : 36000,
          isdraw : 20,
          appraisement : '--',
      }
    ]
  }
  componentWillReceiveProps(newProps){
      if(newProps.params!=this.props.params) {
          this.getData(newProps.params);
      }
  }
  componentDidMount() {
    let arr = [];
    this.props.data.map((item,index)=>{
      arr.push(item);
      this.setState({
        operateList : item.operateList
      });
      return arr;
    })
    this.setState({
      arr
    });
    const {params} = this.props;
    this.getData(params);
  }
  getData(params) {
    const {url,hasNextPage} = this.props;
    API.CustomApi(url,params,(res)=>{
        const {list} = res.data;
        if(list.length>0 && res.data!=undefined){
            this.setState({
                dataList : list,
            });
            hasNextPage && hasNextPage(res.data.hasNextPage);
        }else {
            this.setState({
                noData : true
            });
        }

    },'get');
  }
  rescind(item) {
    alert(item.id)
  }
  render() {
    const {dataList , arr ,noData,operateList} = this.state;
    const {render} = this.props;
    return (
      <ul className="list-item">
      {
        noData
        ?
        <li style={{justifyContent:"center"}}>
          无数据
        </li>
        :
        dataList.map((row,index)=>{
          return (
                <li key={index}>
                  {
                    arr.map((item,indexing)=>{
                       return (
                         <span key={indexing}>
                         {
                           item.field ==='operate'
                           ?
                              operateList.map((operate,keyIndex)=>{
                                return (
                                  <button className="operate-btn" key={keyIndex} onClick={()=>{render&&render(row,index,operate)}}>
                                  <span>{operate}</span></button>
                                )
                              })
                           :
                           item.field === 'amount'
                           ?
                              scientificToNumber(row[item.field])
                           :
                           row[item.field]
                        }
                         </span>
                       )
                    })
                  }
                </li>
          )
        })
      }

      </ul>
    )
  }
}
