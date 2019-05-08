import React from 'react';
import ReactDOM from 'react-dom';
import Modal from './modal';

const show = (props) => {
    let component = null;
    const div = document.createElement('div');
    document.body.appendChild(div);

    const onClose = () => {
        console.log("onClose");
        ReactDOM.unmountComponentAtNode(div);
        document.body.removeChild(div);

        if(typeof props.onClose === 'function') {
            props.onClose();
        }

    }

    ReactDOM.render(
        <Modal
            {...props}
            onClose={onClose}
            ref={c => component = c}
        >{props.content}</Modal>,
        div
    );
} 

const ModalBox = {};
ModalBox.show = (props) => show({
    ...props
});
export default ModalBox;
export {Modal};
