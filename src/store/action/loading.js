export const IS_LOADING = 'isLoading';

export const getLoading = (isLoading)=>{
    return {
      type : IS_LOADING,
      isLoading,
    }
}
