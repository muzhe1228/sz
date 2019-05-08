import {combineReducers} from 'redux';
// import {good} from './goods';
import {isLoading} from './loading';
import {lang} from './i18n';
import {tradeInfo} from "./tradeInfo";
import {userMsg} from "./userMsg";

export const rootReducer = combineReducers({
  isLoading,
  lang,
  tradeInfo,
  userMsg
});
