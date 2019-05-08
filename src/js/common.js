import { scientificToNumber } from 'js'
import Decimal from "js/decimal";
export function currencySymbol(currency) {
  var cs = {
    'CNY': '￥',
    'USD': '$'
  };
  return cs[currency];
}

export function langCurrency(lang) {
  var langCr = {
    'zh': 'CNY',
    'en': 'USD'
  };
  return langCr[lang];
}
//某个字符出现的次数
export function patch(re, s) {
  re = eval("/" + re + "/ig")
  return s.match(re) ? s.match(re).length : 0;
}
//数组分成多个数组
export function sliceArr(arr, start, end) {
  let resultArr = []
  if (end) {
    resultArr = arr.slice(start, end)
  } else {
    resultArr = arr.slice(start)
  }
  return resultArr;
}

//
export function ScrollTop() {
  let scrollToptimer = setInterval(function () {
    let top = document.body.scrollTop || document.documentElement.scrollTop;
    let speed = top / 4;
    if (document.body.scrollTop !== 0) {
      document.body.scrollTop -= speed;
    } else {
      document.documentElement.scrollTop -= speed;
    }
    if (top === 0) {
      clearInterval(scrollToptimer);
    }
  }, 30);
}




// 其他：0
// 平台转入：10010005
// 网络转入：10010010
// 平台转出：10010015
// 网络转出：10010020
// 资金冻结：10010035
// 资金解冻：10010040
// 交易买入：10010045
// 交易卖出：10010050
// 交易手续费：10010055
// 交易挖矿：10010075
// 注册与返佣：10010080
// 分红：10010085
// 基石投资：10010086
// 提现冻结：10010100
// 提现解冻：10010105

// 提现冻结：10010100
// 提现解冻：10010105
// 提现冻结：10010100
// 提现解冻：10010105
// 提现冻结：10010100
// 提现解冻：10010105
// 交易分红：20090001
// 节点分红：20090002
// 活动奖励：20090003
// 挂单挖矿：20090004
// 锁仓冻结：30000001
// 节点冻结：30000002
// 锁仓解冻：40000001
// 节点解冻：40000002
export function handleTypeFilter(input) {
  if (input == 10010005) {
    return '平台转入'
  } else if (input == 10010010) {
    return '网络转入'
  } else if (input == 10010015) {
    return '平台转出'
  } else if (input == 10010020) {
    return '网络转出'
  } else if (input == 10010045) {
    return '交易买入'
  } else if (input == 10010050) {
    return '交易卖出'
  } else if (input == 10010055) {
    return '交易手续费'
  } else if (input == 10010060) {
    return '提现手续费'
  } else if (input == 10010075) {
    return '交易挖矿'
  } else if (input == 10010080) {
    return '注册与返佣'
  } else if (input == 10010085) {
    return '分红'
  } else if (input == 10010086) {
    return '基石投资'
  } else if (input == 10010100) {
    return '提现冻结'
  } else if (input == 10010105) {
    return '提现解冻'
  } else if (input == 20090001) {
    return '交易分红'
  } else if (input == 20090002) {
    return '节点分红'
  } else if (input == 20090003) {
    return '活动奖励'
  } else if (input == 20090004) {
    return '挂单挖矿'
  } else if (input == 30000001) {
    return '锁仓冻结'
  } else if (input == 30000002) {
    return '节点冻结'
  } else if (input == 40000001) {
    return '锁仓解冻'
  } else if (input == 40000002) {
    return '节点解冻'
  } else {
    return '其他'
  }
}

// 委托单状态: 
// 0 委托中，
// 1 部分成交，
// 2 已成交，
// 3 部分成交待撤，
// 4 部分成交已撤，
// 5 待撤
// 6 已撤

export function entrustStatus(status) {
  if (status == 0) {
    return '委托中'
  } else if (status == 1) {
    return '部分成交'
  } else if (status == 2) {
    return '已成交'
  } else if (status == 3) {
    return '部分成交待撤'
  } else if (status == 4) {
    return '部分成交已撤'
  } else if (status == 5) {
    return '待撤'
  } else if (status == 6) {
    return '已撤'
  }
}
//获取小数点的位数
export function isLength(num, pric) {
  if (pric) {
    if (num.toString().indexOf('.') < 0) {
      return pric ? pric.toFixed(8) : 8
    } else {
      num = scientificToNumber(num)
      return pric ? Number(pric).toFixed(num.toString().split(".")[1].length) : num.toString().split(".")[1].length
    }
  }
}
//获取小数点的位数
export function isLength1(num) {
  if (num.toString().indexOf('.') < 0) {
    return 8
  } else {
    num = scientificToNumber(num)
    return num.toString().split(".")[1].length
  }
}
//币对显示价格精度计算(价格|数量，key值，数组，isPic（数量/true 价格/false）)
export function decimalNum(price, name, TradeArr, isPic) {
  for (let i = 0; i < TradeArr.length; i++) {
    if (TradeArr[i].tradeCode == name) {
      isPic ? price = coinSplice(price, isLength1(TradeArr[i].stepSize)) : price = coinSplice(price, isLength1(TradeArr[i].tickSize))
      return price
    }
  }

  // TradeArr.forEach((item) => {
  //   if (item.tradeCode == name) {
  //     isPic ? price = coinSplice(price, isLength(item.stepSize)) : price = coinSplice(price, isLength(item.tickSize))
  //   }
  // })
  // return price
}

//币种显示价格精度计算
export function coinNumRest(price, name, TradeArr) {
  for (let i = 0; i < TradeArr.length; i++) {
    if (TradeArr[i].coinCode == name) {
      return coinSplice(price, TradeArr[i].coinPrecision)
    }
  }
}

//2018年08月22日显示当前日期
export function resetDate(str) {
  let date = new Date(),
    year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate()
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  return str ? year + str + month + str + day : year + "年" + month + "月" + day + "日";
}

//时间格式化

export function resetTime(inputTime, type) {
  var date = new Date(inputTime);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  if (type) {
    return [y + '-' + m + '-' + d, h + ':' + minute + ':' + second];
  } else {
    return y + '-' + m + '-' + d;
  }
};

//一个月前，一周前，默认不传参数一周前 传‘month’一月前

export function beforeWeekMonth(weekMonth) {
  var nowdate = new Date();
  if (weekMonth == 'month') {//一月前
    nowdate.setMonth(nowdate.getMonth() - 1);
  } else if (weekMonth == 'week') {//一周前
    nowdate = new Date(nowdate - 7 * 24 * 3600 * 1000);
  } else if (weekMonth == 'day') {//一周前
    nowdate = new Date(nowdate - 24 * 3600 * 1000);
  }
  var y = nowdate.getFullYear();
  var m = nowdate.getMonth() + 1;
  var d = nowdate.getDate();
  m = m <= 9 ? '0' + m : m;
  d = d <= 9 ? '0' + d : d;
  return y + '-' + m + '-' + d;
}
//数组对象排序 flag=>true;[3,2,1] =>false[1,2,3]
export function compareSort(property, flag) {
  return function (a, b) {
    var value1 = a[property];
    var value2 = b[property];
    // flag=>true;[3,2,1] =>false[1,2,3]
    return flag ? value1 - value2 : value2 - value1;
  }
}

//判断数字
export function showNum(inp) {
  if (inp || inp == 0) {
    return inp
  } else {
    return '--'
  }
}
//计算我的钱包里面的比特币数量(币数量，币价格，是否有汇率，精度,BTC价格))
export function toFixedNum(input, inpPric, notBtc, BTCprice) {
  if (input) {
    if (inpPric) {
      let resNum = input * inpPric
      return coinToFixed(resNum, (resNum >= 1 ? 2 : 4))
    } else if (!inpPric) {
      if (notBtc) {
        let resNum = input * notBtc * BTCprice
        return coinToFixed(resNum, (resNum >= 1 ? 2 : 4))
      } else {
        return 0
      }
    }
  } else {
    return 0
  }
}

//币种显示精度(数字，保留位数)//不适用
export function coinToFixed(input, num) {
  return input == 0 ? input : input.toFixed(num)
}
//截取字符串（数字，位数）
export function coinSplice(nums, len) {
  if (nums || nums == 0) {
    let re = `/([0-9]+\.?[0-9]{${len}})[0-9]*/`, regexp = /(?:\.0*|(\.\d+?)0+)$/;
    nums = scientificToNumber(nums).toString();
    return nums == 0 ? nums : nums.replace(eval(re), "$1").replace(regexp, '$1');
  } else {
    return '--'
  }
}
//截取字符串（数字，位数）
export function coinSplice1(nums, len) {
  if (nums || nums == 0) {
    let re = `/([0-9]+\.[0-9]{${len}})[0-9]*/`
    nums = scientificToNumber(nums).toString();
    nums = nums == 0 ? nums : nums.replace(eval(re), "$1")
    console.log(nums)
    return nums;
  } else {
    return '--'
  }
}

//计算我的钱包里面资产总额()
export function walletAllPric(arr, btcCny, BTC) {
  if (arr) {
    let num = 0
    arr.forEach((item) => {
      if (btcCny[item.coinCode]) {
        num += item.enableAmount * btcCny[item.coinCode]
      } else {
        num += item.enableAmount * (BTC[item.coinCode] ? BTC[item.coinCode] : 0) * btcCny.BTC
      }
    });
    return coinToFixed(num, (num >= 1 ? 2 : 4));
  }
}

//我的钱包币种搜索
export function searchList(searchVal, val) {
  if (searchVal && val) {
    searchVal = searchVal.toLocaleLowerCase()
    val = val.toLocaleLowerCase()
    if (val.indexOf(searchVal) > -1 || searchVal == 'all') {
      return false
    } else {
      return true
    }
  } else {
    return false
  }
}

//涨跌幅颜色计算

export function isColor(type) {
  if (type == '+') {
    return 'color-green'
  } else if (type == '-') {
    return 'color-red'
  } else {
    return 'color-gray'
  }
}

//显示剩余时间
export function showTimeNeed(end, name) {
  end = end.replace(/\-/g, '/')
  let time = new Date(end) - new Date();
  let day = Math.floor(time / 1000 / 60 / 60 / 24);
  time = time - day * 24 * 60 * 60 * 1000;
  let hour = Math.floor(time / 1000 / 60 / 60);
  time = time - hour * 60 * 60 * 1000;
  let min = Math.floor(time / 1000 / 60);
  time = time - min * 60 * 1000;
  let str = '剩余 ' + day + ' 天 ' + hour + ' 小时 ' + min + ' 分可' + (name ? name : '解冻');
  return str
}

//挖矿时间区间设置
export function timeSection(time) {
  if (time == 0) {
    return '23:00 - ' + time + ':00'
  } else {
    return (time - 1) + ':00 -- ' + time + ':00'
  }
}

