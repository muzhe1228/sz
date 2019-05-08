import { lStore } from './index';
import { getUserCustomCoinPair, addUserCustomCoinPair, removeUserCustomCoinPair } from "./http-req";

export default {
    _pairMap: null,
    _pairList: null,

    // _favorites: [],
    _loadFavStatus: 0,

    //法币的精度
    // fixedPrec: {
    //     "CNY": 2,
    //     "USD": 2,
    // },

    setPairList(list) {
        this._pairList = list;
    },
    getPairList() {
        return this._pairList;
    },
    loadFavorites(callback) {
        var token = lStore.get('token');
        if (token) {
            getUserCustomCoinPair().then(obj => {
                this._loadFavStatus = 2;
                var data = obj.data;
                if (data.status == 200) {
                    var list = data.data;
                    if (list) {
                        if (callback) callback(list.map((v) => v.coinPair));
                    }
                }
            }).catch(err => {
                if (callback) callback([]);
            });
        }
    },
    addFavorites(code, callback) {
        var token = lStore.get('token');
        if (token) {
            addUserCustomCoinPair({ "coinPair": code }).then((obj) => {
                if (callback) callback(obj.data);
            }).catch(err => {
                if (callback) callback(err.data);
            })
        }
    },
    removeFavorties(code, callback) {
        var token = lStore.get('token');
        if (token) {
            removeUserCustomCoinPair({ "coinPairs": code }).then((obj) => {
                if (callback) callback(obj.data);
            }).catch(err => {
                if (callback) callback(err.data);
            })
        }
    },
    getTabIndex() {
        return lStore.get("szTti");
    },
    setTabIndex(val) {
        lStore.set("szTti", val);
    },
    setPairMap(pairMap) {
        this._pairMap = pairMap;
    },
    getPairInfo(pair) {
        if (this._pairMap) {
            return this._pairMap[pair];
        }
    },
    setKvStore(key, value) {
        lStore.set(key, value);
    },
    getKvStore(key, defaultVal) {
        var val = lStore.get(key);
        if (val !== null) {
            if (key == 'klp' && val == 1) {
                lStore.set(key, 15)
                return 15;
            }
            return val;
        }
        return defaultVal;
    }
}
