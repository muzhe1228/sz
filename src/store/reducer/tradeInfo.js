const initialState = {
    "allTradeInfo": [],
    "getRecomment": [],
    "allCoins": {},
};

export const tradeInfo = (state = initialState, action = {})=>{
    switch(action.type) {
        case "allTradeInfo":
            var result = action.data;
            return Object.assign({}, state, { allTradeInfo: result });
        case "getRecomment":
            var newList = action.data;
            return Object.assign({}, state, { getRecomment: newList});
        case "allCoins":
            var map = action.data;
            return Object.assign({}, state, { allCoins: map});
        default:
            return state;
    }
}
