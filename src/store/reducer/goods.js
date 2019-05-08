export const good = (state,action)=>{
	switch(action.type) {
		case 'REQUEST_GOODS' :
			return {
		        isFetching: true
		    };
		case 'RECEIVE_GOODS' :
			return {
				isFetching : false,
				goods : action.goods
			}
		default :
			return {
			    isFetching: true,
			    goods: [1,3]
			}
	}
}
