demo :

dataList : [
  {
    title : '个人中心',
    icon : '',
    menuList : [
      {
        label : '我的钱包',
        url : '/liuhsd'
      },
      {
        label : '充值历史',
        url : '/liuhsd'
      },
      {
        label : '提现历史',
        url : '/liuhsd'
      },
      {
        label : '资产流水',
        url : '/liuhsd'
      }
    ]
  },
  {
    title : '资产管理',
    icon : '',
    menuList : [
      {
        label : '我的钱包',
        url : '/acctone'
      },
      {
        label : '充值历史',
        url : '/acctone'
      },
      {
        label : '提现历史',
        url : '/acctone'
      },
      {
        label : '资产流水',
        url : '/acctone'
      }
    ]
  }
]

<SubMenu dataList={dataList}></SubMenu>
