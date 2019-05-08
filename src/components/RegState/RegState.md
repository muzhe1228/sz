
import RegState from 'components/RegState'


<button onClick={showReg}></button>
<RegState onClick={this.close} isShow={regIsShow}></RegState>

state = {
    regIsShow:false
}

showReg(){
    this.setState({
      regIsShow:true
    })
  }
  close(data){
    this.setState({
      regIsShow:false
    })
  }