<button onClick={() => Modal.show({
                title: 'Demo',
                content: 'Hello world!',
                okText: '确认登录',
                onClose: () => alert('now close'),
                onOk: () => alert(222),
            })}>click me!</button>
