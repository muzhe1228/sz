import React from 'react';
import { autobind } from 'core-decorators';
import './style.less';
import PropTypes from "prop-types";
import MiningTop from "components/MiningTop"
import MiningCont from "components/MiningCont"
import MiningBot from "components/MiningBot"
import MiningMy from "components/MiningMy"


@autobind
export default class Mining extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="mining container">
        <MiningTop />
        <MiningMy />
        <MiningCont />
        <MiningBot />
      </div>
    )
  }
}
