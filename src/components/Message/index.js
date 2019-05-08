import React from 'react';
import ReactDOM from 'react-dom';
import IconFont from 'components/IconFont';
import './message.less';

class Message extends React.Component {
    state = {
        queue: [],
    };

    pushQueue(obj) {
        const {queue} = this.state;
        queue.push(obj);
        this.setState({queue}, () => {
            setTimeout(() => {
                this.popQueue(obj);
            }, 3000)
        });
    }

    popQueue(obj) {
        const {queue} = this.state;
        const newQueue = queue.filter((item) => item !== obj);
        this.setState({queue: newQueue});
    }

    render() {
        const {queue} = this.state;
        const iconObj = {
            'success': 'ShapeCopy',
            'info': 'CombinedShapeCopy1',
            'warning': 'CombinedShapeCopy',
            'error': 'ShapeCopy1',
        };
        return <React.Fragment>
            {
                queue.map((obj,key) => {
                    return <div key={key} className={'message-item ' + (obj.type ? 'message-' + obj.type : '')}>
                        <IconFont name={iconObj[obj.type]}/>
                        <div>{obj.msg}</div>
                    </div>
                })
            }
        </React.Fragment>
    }
}

let node = document.getElementById('message-container');
if (!node) {
    node = document.createElement('div');
    node.setAttribute('id', 'message-container');
    document.body.appendChild(node);
}

let messageArray;
ReactDOM.render(<Message ref={(ref) => {
    messageArray = ref
}}/>, document.getElementById('message-container'));

export const success = (msg) => {
    messageArray.pushQueue({msg, type: 'success'});
};
export const info = (msg) => {
    messageArray.pushQueue({msg, type: 'info'});
};
export const warning = (msg) => {
    messageArray.pushQueue({msg, type: 'warning'});
};
export const error = (msg) => {
    messageArray.pushQueue({msg, type: 'error'});
};
