export const LANG = 'lang';

export const getLang = (lang)=>{
    return {
        type : LANG,
        lang,
    }
}