import React from 'react';
import {autobind} from 'core-decorators';
import PAGE404 from 'images/404.png';

@autobind
export default class Page404 extends React.Component{
    constructor(props){
        super(props);
        this.state={

        };
    }

    componentDidMount(){

    }

    render(){
        return(
            <div className="page-404" style={{textAlign : 'center',paddingTop : "203px"}}>
                <div className="image-404" style={{width:"717px",margin:"0 auto", padding: '50px 0 100px 0'}}><img src={PAGE404} alt=""/></div>
            </div>
        )
    }
}
