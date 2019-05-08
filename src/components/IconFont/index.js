import React from 'react';
import PropTypes from 'prop-types';

export default class IconFont extends React.Component {
    static props = {
        name:PropTypes.string.isRequired,
        className:PropTypes.string,
        onClick: PropTypes.func,
    };
    render() {
        const { name,onClick,className,...props } = this.props;
        return <i className={`iconfont icon-${name} `+(className?className:'')} {...props} onClick={ ()=> { onClick && onClick() } }/>;
    }
}