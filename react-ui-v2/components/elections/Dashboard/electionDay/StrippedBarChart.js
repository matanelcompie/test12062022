import React from 'react';
import * as d3 from 'd3';
 

/**
 * Bar chart using D3
 *
 * parameters:
 * width: (number) the width of the container
 * height: (number) the height of the container
 * style:(object) container style
 * data: (array), array of values {label, value}
 */
class StrippedBarChart extends React.Component {
    constructor(props) {
        super(props);
        this.canvas;
        this.width = 90;
        this.height = 200;
		this.barWidth = 37;
		this.paddingBetweenBars = 10;
		
		this.minimalPercentageToPass = 20;
    }

    getRef(ref) {
        this.canvas = ref;
    }
	
	 
    componentDidMount() {
        this.addPie();
    }
	
	componentDidUpdate(){
		 this.addPie();
	}

    addPie() {
		 
		let colors = this.props.colors;
        let context = this.canvas.getContext("2d");
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
        let margin = { top: 0, right: 0, bottom: 0, left: 0 };
        let width = (this.props.colors.length*(this.barWidth + this.paddingBetweenBars));
        let height = this.height - margin.top - margin.bottom;

        var x = d3.scaleBand()
            .rangeRound([0, width])
            .padding(0.05);

        var y = d3.scaleLinear()
            .rangeRound([height, 0]);

        context.translate(margin.left, margin.top);
        x.domain(this.props.data.map(d => d.label));
        y.domain([0, d3.max(this.props.data, d => 100   )]);

        context.save();
        context.rotate(-Math.PI / 2);
        context.textAlign = "right";
        context.textBaseline = "top";
        context.font = "bold 10px sans-serif";
        context.restore();
 
        this.props.data.forEach((d, i) => {
            context.fillStyle = colors[i];
			if(d.bgRedColor ){
				context.fillStyle="#ff0000";
			}
            context.fillRect(x(d.label), y(d.value), x.bandwidth(), height - y(d.value));
			context.fillStyle = '#000000';
			context.fillText((d.value + '%'),  x(d.label)+ 25, y(d.value)-3);
			
        });
    }

    render() {
	 
        return (
            (this.props.data.length > 0) ?
		 
                    <canvas ref={this.getRef.bind(this)} width={this.width} height={this.height} style={{verticalAlign:'bottom' }} ></canvas>
              
                : null
        );
    }
}

export default StrippedBarChart;