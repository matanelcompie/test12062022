import React from 'react';
import * as d3 from 'd3';
 

/**
 * CircledGraph chart using D3
 * 
 * parameters:
 * color - the color of graph arc and text color 
 * data - the text data
 * percent 
 * 
 */
class CircledGraph extends React.Component {
    constructor(props) {
        super(props);
    }

 
    componentDidMount() {
        this.addPie();
    }

	componentDidUpdate(){
		 this.addPie();
	}
	
    addPie() {
		var svg = d3.select("svg")
					.append("g")
					.attr("transform", "translate(230,75)");

		var arc = d3.arc()
					.innerRadius(60)
					.outerRadius(60);
		var sector = svg.append("path")
						.attr("fill", "none")
						.attr("stroke-width", 5)
						.attr("stroke", '#ffffff')
						.attr("d", arc({startAngle:0, endAngle:(2*Math.PI)}));
		
		
  
	    sector = svg.append("path")
						.attr("fill", "none")
						.attr("stroke-width", 5)
						.attr("stroke", this.props.color)
						.attr("d", arc({startAngle:0, endAngle:((2*Math.PI)*this.props.percent)}));
		
		sector = svg.append("path")
						.attr("fill", "none")		
						.attr("stroke-width", 2)
						.attr("stroke", "#cccccc")
						.attr("d", arc({startAngle:((2*Math.PI)*this.props.percent), endAngle:(2*Math.PI)}))
						
						
    }

 

    render() {
        return (
             
                <svg>
					{this.props.data && <text x="281" y="77" fill={this.props.color} style={{  fontSize:'32px'}}>{this.props.data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</text>}
					<text x="265" y="100" fill="#676767" style={{  fontSize:'16px' , fontWeight:'600'}}>סך תומכים</text>
				</svg>
              
        );
    }
}

export default CircledGraph;