import Big from 'big.js';

export default {
    //除法函数
    accDiv(arg1, arg2, scale) {
        var b1 = new Big(arg1);
        var b2 = new Big(arg2);
        return scale===0 || scale ? b1.div(b2).toFixed(scale) : b1.div(b2).toFixed();
    },

    //乘法函数
    accMul(arg1, arg2, scale) {
        var b1 = new Big(arg1);
        var b2 = new Big(arg2);
        return scale===0 || scale ? b1.times(b2).toFixed(scale) : b1.mul(b2).toFixed();
    },

    //加法函数
    accAdd(arg1, arg2, scale){
        var b1 = new Big(arg1);
        var b2 = new Big(arg2);
        return scale===0 || scale ? b1.plus(b2).toFixed(scale) : b1.add(b2).toFixed();
    },
    //减法函数
    accSubtr(arg1, arg2, scale) {
        var b1 = new Big(arg1);
        var b2 = new Big(arg2);
        return scale===0 || scale ? b1.minus(b2).toFixed(scale) : b1.sub(b2).toFixed();
    },
    mod: function(arg1, arg2){
        var a1 = new Big(arg1);
        return a1.mod(arg2);
    },
    //金额加逗号
    addCommas(nStr){
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    },
    //格式化金额
    //@str 金额
    //@scale 小数点保留位数
    formatAmount(str, scale){
        return this.addCommas(this.toFixed(str, scale));
    },
    //四舍五入
    toFixed(num, scale){
        var n = new Big(num);
        return n.toFixed(scale);
    },
    //向下  类似Math.floor
    format(num, scale){
        return this.round(num, scale);
    },
    //向上进位Math.ceil
    ceil(num, scale){
        if (String(num)!=="0") {
            var n = new Big(num);
            num = n.round(scale, 3);
        }
        return this.toFixed(num, scale);
    },
    //向下  类似Math.floor
    round(num, scale){
        if (String(num)!=="0") {
            var n = new Big(num);
            num = n.round(scale, 0);
        }
        return this.toFixed(num, scale);
    },
    //获取小数点后的位数
    getDotDigit(num){
        var sVal = String(num);
        var findex = sVal.indexOf('.');
        return findex==-1?0:sVal.length - (findex+1);
    },
    toPercent(num, scale){
        if (scale) return new Big(num).mul(100).toFixed(scale).toString()+'%';
        else return new Big(num).mul(100).toString()+'%';
    },
    //转成K或M的值
    toKorM(num, scale){
        // if (num > 1000000){
        //     return String(this.round(this.accDiv(num, Math.pow(10, 6)), scale))+'M';
        // }else if(num >= 1000){
        //     return String(this.round(this.accDiv(num, Math.pow(10, 3)), scale))+'K';
        // }
        return String(this.round(num, scale));
    }
};
