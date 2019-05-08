HInput组件用法

<HInput type="text" icon='B-3' append={eye} value={val} changeVal={(name,val)=>this.setState({val})} eyeToggle={this.eyeToggle} clearVal={()=>this.setState({val:''})} />


HInput Attributes

参数           说明                  类型               可选值                 默认值

type          类型                  string           text/password/tel       text

value         绑定值                string            -                       ''

icon          左边的字体或图标        string            B-3/+86/A-3             ''

append        右边的眼睛             {}                B-Copy/B-Copy1          ''

disabled      禁用输入框             boolean           true/false              false

placeholder   初始化value           string             -                       -

HInput Methods

方法名         说明                  参数                 使用

changeVal     获取value            name,val             changeVal={(name,val)=>this.setState({val})}

eyeToggle     控制密码显示           -                   eyeToggle(){if(this.state.eye === 'B-Copy'){this.setState({eye:'B-Copy1'})}else {this.setState({eye : 'B-Copy'})}}

clearVal      清空输入框             -                   clearVal={()=>this.setState({val:''})}



可选址注解

B-3 是用户名图标class属性名
A-3 是密码图标class属性名
+86 是手机输入框text
