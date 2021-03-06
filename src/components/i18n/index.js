import React from 'react';
import {connect} from 'react-redux';
import {ZH,EN,FA} from 'i18n';
import {lStore} from 'js';

function convertLang(message, params, lang){
    var txt;
    switch (lang) {
        case 'zh' :
            txt = ZH[message];
            break;
        case 'en' :
            txt = EN[message];
            break;
        case 'fa' :
            txt = FA[message];
            break;
        default :
            txt = ZH[message];
    }
    if (!txt) txt = message;
    return params ? txt.replace(/\{([\d]+)\}/g, (word, s1)=>{
        return params[Number(s1)-1];
    }) : txt;
}

export function I18nFunc(props){
    if (typeof(props)=='object'){
        const {lang, message, params} = props;
        return convertLang(message, params, lang);
    }else if (typeof(props)=='string'){
        var lang = lStore.get('lang')||'zh';
        var args = [].slice.call(arguments, 0);
        var message = args.shift();
        var params = args;
        return convertLang(message, params, lang);
    }
}


const mapStateToProps = (state)=>{
    return {
        lang : state.lang.lang
    }
};

export default connect(mapStateToProps)(I18nFunc)
