import React from 'react';
import * as d3 from 'd3';
 

/**
 * Pie chart using D3
 * 
 * parameters:
 * width: (number) the width of the container
 * height: (number) the height of the container
 * style:(object) container style
 * donut: (bool): if the chart is donut or pie
 * data: (array), array of values {label, value}
 * 
 */
const colors=["#4FA3F6", "#0033CC", "#F8B422", "#45C5DB", "#CC3366"];
class PercentsPie extends React.Component {
    constructor(props) {
        super(props);
        this.canvas;
        this.width = this.props.width || 300;
        this.height = this.props.height || 300;
    }

    getRef(ref) {
        this.canvas = ref;
    }

    componentDidMount() {
        this.addPie(this.props.data);
    }
	

    componentWillReceiveProps(newProps) {
 
        if (!_.isEqual(newProps.data, this.props.data)) { //if the props data changed!
 
            this.clearCanvasContext();
            this.addPie(newProps.data); //Print new pie with the new props
        }
 
    }
    /**
     * @method clearCanvasContext
     *  1. Return the pointer to the (0,0) point 
     *  2. clearing all the canvas rectangle
     *  (To clear all the arcs and the context)
     */
    clearCanvasContext() {
        let clearWidth = -(this.width / 2);
        let clearHeight = -(this.height / 2);
        this.context.beginPath();
        this.context.translate(clearWidth, clearHeight);
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.closePath();
    }
    addPie(pieData) {
        let outerRadius = Math.min(this.width, this.height) / 2 ;
        let innerRadius = this.props.donut ? (outerRadius * 0.75) : 0; //set innerRadius in case of donut (40% of the radius).
        let context = this.canvas.getContext("2d");
		context.clearRect(0, 0, this.width, this.height);
		
		
        var arc = d3.arc()
            .outerRadius(outerRadius)
            .innerRadius(innerRadius)
            .padAngle(-0.5)
            .context(context);

        var pie = d3.pie();
        var arcs = pie(pieData.map(i => i.value));
        context.translate(this.width / 2, this.height / 2);
 
        arcs.forEach((d, i) => {
			if (i == this.props.selectedRowIndex ){
				arc.padAngle(0.1)

				 
			}
			else{
				arc.padAngle(-0.5)
			}
            context.beginPath();
            arc(d);
            context.fillStyle = colors[i];
            context.fill();
        });
		if(this.props.selectedRowIndex != -1  ){
			context.font = "bold 16px sans-serif";
			context.fillStyle = colors[this.props.selectedRowIndex];
			context.fillText((this.props.percentText + "%") , 20 , 5);
		}

        context.beginPath();
        arcs.forEach(arc);
        context.strokeStyle = "#fff";
        context.stroke();
        this.context = context;
    }

 

    render() {
		//console.log(this.props.data);
        let containerStyle = this.props.style || {};
        return (
            (this.props.data.length > 0) ?
                <div style={containerStyle}>
                    <canvas ref={this.getRef.bind(this)} width={this.width} height={this.height}></canvas>
                </div>
                : null
        );
    }
}

export default PercentsPie;