## API

```html
<Input name='age' value='1' onChange={onChange}/>
```

| 参数 | 说明 | 类型 | 默认值 | 必需 |
| --- | --- | --- | --- | --- |
| name | 名称 | string | - | 是 |
| value | 值 | string | - | 是 |
| onChange | 内容改变的回调，参数是name和value | Function(name, value) | - | 是 |
| onBlur | 失去焦点的回调，参数是name和value | Function(name, value) | - | 否 |
| disabled | 不可点击状态 | boolean | false | 否 |
| error | 错误信息时的样式 | boolean | false | 否 |
| unit | 单位 | string | '' | 否 |
| type | 类型 | string | 'text' | 否 |
| placeholder | 提示信息 | string | '' | 否 |