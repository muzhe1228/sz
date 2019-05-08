import React from 'react';
import {autobind} from 'core-decorators';
import PropTypes from 'prop-types';
import './style.less';

@autobind
export default class LinkText extends React.Component{
    static props = {
      text: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      className: PropTypes.string
    }

    static defaultProps = {
      text: '修改',
    }


    render(){
      const {text, onClick, className} = this.props;
        return(
            <div className={'link-text '+ (className? className : '')} onClick={onClick? onClick : ()=>{}} >
              {text}
            </div>
        )
    }
}
