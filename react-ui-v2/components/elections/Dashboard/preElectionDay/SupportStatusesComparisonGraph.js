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

class SupportStatusesComparisonGraph extends React.Component {
	
     constructor(props) {
        super(props);
		this.colors = ['#b6ccef' , '#f2b6bb' ];
        this.canvas;
        this.width = this.props.width || 300;
        this.height = this.props.height || 300;
    }

    getRef(ref) {
        this.canvas = ref;
    }

    componentDidMount() {
        this.addPie();
    }
	
	formatNumber(number){
		if(number < 1000){
			return number.toString();
		}
		else{
			number = number / 1000;
			number = Math.round( number * 10 ) / 10;
			number = number + 'K';
			return number;
		}
	}
	
    addPie() {
        let context = this.canvas.getContext("2d");
        let margin = { top: 20, right: 20, bottom: 30, left: 40 };
        let width = this.width - margin.left - margin.right;
        let height = this.height - margin.top - margin.bottom;

        var x = d3.scaleBand()
            .rangeRound([0, width])
            .padding(0.1);

        var y = d3.scaleLinear()
            .rangeRound([height, 0]);

        var y0 = d3.scaleLinear()
            .rangeRound([height, 0]);

        context.translate(margin.left, margin.top);
        x.domain(this.props.data.map(d => d.label));
        
        y.domain([0, d3.max(this.props.data, d => d.value.current * 1.1)]);
        y0.domain([0, d3.max(this.props.data,  d => d.value.previous * 1.1)]);

        var yTickCount = 10,
            yTicks = y.ticks(yTickCount),
            yTickFormat = y.tickFormat();

        context.beginPath();
		
        context.beginPath();
        context.moveTo(-6.5, -10);
       
         context.lineTo(-6.5, height + 0.5);
		 context.lineTo(20 + width, height + 0.5);
		 context.lineTo(20 + width, (height*4)/5);
		 context.lineTo(-6.5  , (height*4)/5);
		 
		 context.moveTo(20 + width, (height*4)/5);
		 context.lineTo(20 + width, (height*3)/5);
		 context.lineTo(-6.5, (height*3)/5);
		 
		 context.moveTo(20 + width, (height*3)/5);
		 context.lineTo(20 + width, (height*2)/5);
		 context.lineTo(-6.5, (height*2)/5);
          
		 context.moveTo(20 + width, (height*2)/5);
		 context.lineTo(20 + width, (height*1)/5);
		 context.lineTo(-6.5, (height*1)/5);

		context.moveTo(20 + width, (height*1)/5);
		 context.lineTo(20 + width, -10);
		 context.lineTo(-6.5, -10); 
		  
        context.strokeStyle = "#d2d2d2";
        context.stroke();
         
        context.save();
        context.rotate(-Math.PI / 2);
        context.textAlign = "right";
        context.textBaseline = "top";
        context.font = "bold 10px sans-serif";
        context.restore();

        this.props.data.forEach((d, i) => {
            let currentValue = d.value.current;
            let previousValue = d.value.previous;
            context.fillStyle = this.colors[0];
            context.fillRect(5 * i + x(d.label), y(currentValue), this.props.barWidth, height - y(currentValue));
            context.fillStyle = '#717171';
            context.fillText(this.formatNumber(currentValue), 5 * i + x(d.label) + this.props.barWidth / 2 + 3 * (this.formatNumber(currentValue).length), y(currentValue) - 3);
            context.fillStyle = this.colors[1];
            context.fillRect(5 * i + x(d.label) + this.props.barWidth + 2, y0(previousValue), this.props.barWidth, height - y0(previousValue));
            context.fillStyle = '#717171';
            context.fillText(this.formatNumber(previousValue), 5 * i + x(d.label) + this.props.barWidth + 2 + this.props.barWidth / 2 + 3 * (this.formatNumber(previousValue).length), y0(d.value.previous) - 3);
        });
    }

    renderLegendElement() {
        return this.props.data.map((item, i) => {
		 
            return <div key={i} className='legend-element' style={{ float: 'left', margin: 0, width: '20%', color: '#717171' }}>
                <div className='legend-element-color'></div>
                <span className='legend-element-label'>{item.label}</span>
            </div>
        });
    }

    render() {
        let containerStyle = this.props.style || {};
        return (
            (this.props.data.length > 0) ?
                <div style={containerStyle}>
                    <canvas ref={this.getRef.bind(this)} width={this.width} height={this.height}></canvas>
                    <div className='legend-container' style={{marginTop:'-30px' , marginLeft:'16px', width: '100%'}}>
                        {this.renderLegendElement()}
                    </div>
                </div>
                : null
        );
    }
}

export default SupportStatusesComparisonGraph;