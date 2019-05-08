## API

```html
<Pagination onChange={onChange} total={50} pageSize={10}/>
```

| 参数 | 说明 | 类型 | 默认值 | 必需 |
| --- | --- | --- | --- | --- |
| pageSize | 每页条数 | number | 10 | 否 |
| current | 当前页数 | number | 1 | 否 |
| total | 数据总数 | number | 0 | 否 |
| hideOnSinglePage | 只有一页时是否隐藏分页器 | boolean | false | 否 |
| showQuickJump | 是否可以快速跳转至某页 | boolean | true | 否 |
| onChange | 页码改变的回调，参数是改变后的每页条数及页码 | Function(pageSize, pageNum) | - | 是 |