import React from 'react';
import propTypes from 'prop-types';
import Input from '../Input';
import IconFont from '../IconFont';
import {autobind} from 'core-decorators';
import './style.less';

@autobind
export default class Pagination extends React.Component {
    static props = {
        pageSize: propTypes.number,//每页显示条数
        total: propTypes.number,//数据总条数
        current: propTypes.number,//当前页码
        hideOnSinglePage: propTypes.bool,//只有一页时是否隐藏分页器
        onChange: propTypes.func,//页码改变的回调
        config: propTypes.object,//相关文字信息，首页，上一页，尾页，下一页，跳转至
        showQuickJump: propTypes.bool,//是否显示快速跳转至多少页
    };
    static defaultProps = {
        pageSize: 10,
        total: 0,
        current: 1,
        config: {},
        showQuickJump: true,
        hideOnSinglePage: false,
    };
    state = {
        jumpValue: '',
        jumpTo : '',
        paginationNum :[1,2,3],
        currentIndex : 0,
        pages : [],
    };
    pageNum = 0;
    prePage() {
        const {currentIndex} = this.state;
        if(currentIndex>0){
            this.setState({
                currentIndex:currentIndex-1,
                preDisabed : false
            });
        }else {
          this.setState({
              currentIndex:0,
              preDisabed : true
          });
        }
    }
    nextPage() {
      const {currentIndex,pages} = this.state;
      console.log(currentIndex,pages.length-1)
      if(currentIndex==pages.length-1){
        this.setState({
            currentIndex: pages.length-1
        });
          return;
      }
      this.setState({
          currentIndex:currentIndex+1
      });
    }
    componentWillMount() {
      const {total,pageSize} = this.props;
      this.pageNum = Math.ceil(total / pageSize);
      if(this.pageNum<10){
        for(var i=0;i<this.pageNum;i++) {
            this.state.pages.push(i)
        }
      }else {
          for(var i=0;i<10;i++) {
              this.state.pages.push(i)
          }
      }
    }
    render() {
        const {paginationNum,currentIndex,pages,preDisabed} = this.state;
        const {onChange} = this.props;
        return (
            <div className="pagination">
                <i className={currentIndex==0?"pre disabled":"pre"} onClick={this.prePage}></i>
                <ul>
                  {
                      pages.map((item,index)=>{
                          return(
                              <li key={index} className={currentIndex===index?'active':''} onClick={()=>{this.setState({currentIndex : index});onChange&&onChange()}}>{index+1}</li>
                          )
                      })
                  }
                </ul>
                {
                  this.pageNum>10
                  ?
                    <ul>
                        <li>...</li>
                        <li>{this.pageNum}</li>
                    </ul>
                  :
                    ''
                }
                <i  className={currentIndex==pages.length-1?"next disabled":"next"} onClick={this.nextPage}></i>
            </div>
        )
    }
}
