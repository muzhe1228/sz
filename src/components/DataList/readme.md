demo
<DataList
    url = '/coin/all/detail'
    data={[
    {
    label : '币种',
    field : 'coinKind'
    },
    {
    label : '可用',
    field : 'drawMax'
    },
    {
    label : '冻结',
    field : 'isdraw'
    },
    {
    label : 'BTC估值',
    field : 'appraisement'
    },
    {
    label : '操作',
    field : 'operate',
    operateList : ['充值','提币']
    }
    ]}
    render = {(row,index)=>{console.log(row,index)}}
/>
