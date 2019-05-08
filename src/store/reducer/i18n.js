import {LANG} from 'store/action/i18n';
import {lStore} from 'js';

const initialState = {
    lang: lStore.get('lang') || 'zh'
};

export const lang = (state = initialState, action = {})=>{
    switch(action.type) {
        case LANG :
            return Object.assign({}, state, { lang: action.lang });
        default :
            return state
    }
}
