import React from 'react';
import  ReactDOM   from 'react-dom';
import * as d from 'd3';
import ArcGauge from './ArcGauge';


class Gauge extends React.Component {
	
	constructor(props) {
        super(props);
		this.state={
			width: this.props.width || 212  
      }
    }
 

  componentDidMount() {
    this.setState({
      width: ReactDOM.findDOMNode(this).offsetWidth
    })
  }

  componentWillReceiveProps(nextProps) {
    let history = this.state.history || new Array(100).fill(0);

    if (history.length > 100) {
      history.shift();
    }

    history.push(nextProps.value);

    this.setState({
      history: history,
      width: ReactDOM.findDOMNode(this).offsetWidth
    })
  } 

  render() {
    let cls = 'gauge';
    return (
        <section className={cls}>
          <ArcGauge value={this.props.value}
                    size={this.props.size}
                    radius={this.props.radius}
                    sections={this.props.sections}
                    arrow={this.props.arrow}
                    label={this.props.label}
                    legend={this.props.legend}
                    height={this.props.height}
                    width={this.state.width}/>
        </section>
    );
  }

 
 
}

ArcGauge.defaultProps = {
      value: 0,
      size: 15,
      radius: 85,
      sections: ['#ccc', '#999', '#444'],
      arrow: null,
      label: null,
      legend: null
};


export default Gauge;