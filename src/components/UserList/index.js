import React from 'react';
import { autobind } from 'core-decorators';
import PropTypes from 'prop-types';
import ListItem from './ListItem';
import './style.less';

@autobind
export default class UserList extends React.Component {
    static props = {
        url: PropTypes.string.isRequired,
        data: PropTypes.array.isRequired,
        loadingMore: PropTypes.boolean,
        render: PropTypes.func.isRequired,
        params: PropTypes.object
    }
    render() {
        const { data } = this.props;
        return (
            <div className="userList">
                <hgroup className='userList-title'>
                    {
                        data.map((item, index) => {
                            return (
                                <h2 key={index}>{item.label}</h2>
                            )
                        })
                    }
                </hgroup>
                <div className="userList-wrap">
                    <ul className="userList-list">
                        <li></li>
                    </ul>
                </div>

            </div>
        )
    }
}
