import React from 'react';
import * as d3 from 'd3';
import colors from './colors';
import { withCommas} from 'libs/globalFunctions';


/**
 * Bie chart using D3
 * 
 * parameters:
 * width: (number) the width of the container
 * height: (number) the height of the container
 * style:(object) container style
 * donut: (bool): if the chart is donut or pie
 * data: (array), array of values {label, value}
 * 
 */
class Pie extends React.Component {
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
        let outerRadius = Math.min(this.width, this.height) / 2 - 10;
        let innerRadius = this.props.donut ? (outerRadius * 0.6) : 0; //set innerRadius in case of donut (40% of the radius).
        let context = this.canvas.getContext("2d");

        var arc = d3.arc()
            .outerRadius(outerRadius)
            .innerRadius(innerRadius)
            .padAngle(0.02)
            .context(context);

        var pie = d3.pie();
		
        var arcs = pie(pieData.map(i => i.value));
		/*
		if(this.props.displayLabels){
			
			//sort arcs to calculate text places correctly
			arcs = arcs.sort(function(a,b){
				if(a.startAngle < b.startAngle){return 1}
				else if(a.startAngle > b.startAngle){return -1;}
				else return 0;
			});
			console.log(arcs);
		}
		*/
		//console.log(2*Math.PI);
		//console.log("cosinus : " + Math.round(Math.cos(Math.PI/2)));
		let cumsumRads = 0;
		
        context.translate(this.width / 2, this.height / 2);
	 
		//
		let existingXValues = [];
        arcs.forEach((d, i) => {
			if(this.props.displayLabels){
				//context.fillText("1",);
				 
			 
				cumsumRads +=  (d.endAngle - d.startAngle);
				if((d.endAngle-d.startAngle) >= 0.005*2*Math.PI){ // at least 1% of pie - draw text
					let angleDiff = (d.startAngle+d.endAngle)/2;
					let sinVal = Math.round(Math.sin(angleDiff)*100)/100;
					let cosVal = Math.round(Math.cos(angleDiff)*100)/100;
					context.font = "bold 10px sans-serif";
					context.fillStyle = '#000000';
					//console.log(sinVal + " - " + cosVal + "-" + angleDiff + "-"+d.startAngle + "-" + cumsumRads);
					let relativeWidth=(this.width / 4)*(sinVal) ;
					let valueXLengh = ((d.value+'').length);
					if(relativeWidth >= 0){
						relativeWidth = relativeWidth + 11*(valueXLengh);
					}
					else{
						relativeWidth = relativeWidth - (2-0.1*valueXLengh)*(valueXLengh) + valueXLengh*1.5*i;
					 
					}
					//console.log(angleDiff + "-" + sinVal);
					let relativeHeight=  -1*(this.height / 2.5)*(cosVal) ;
					
					if(relativeHeight < 0){
						relativeHeight = relativeHeight -11;
					}
					else{
						relativeHeight = relativeHeight+17;
					}
					for(let f = 0 ; f < existingXValues.length ; f++){
				 
						 
						if(Math.abs(existingXValues[f] -relativeWidth ) <= 4){
							relativeWidth = relativeWidth + 15;
							console.log("true");
							break;
						}
					}
				 
					existingXValues.push(relativeWidth);
					//console.log("len:"+existingXValues.length);
					//console.log(existingXValues);
					//console.log(relativeWidth);
					context.fillText(withCommas(d.value) ,relativeWidth, relativeHeight);
					// console.log( sinVal+ ":"+cosVal);
				}
				
				 //console.log(d);
			}
            context.beginPath();
            arc(d);
            context.fillStyle = colors[i];
            context.fill();
        });

        context.beginPath();
        arcs.forEach(arc);
        context.strokeStyle = "#fff";
        context.stroke();
        this.context = context;
    }

    renderLegendElement() {
        return this.props.data.map((item, i) => {
            return <div key={i} className='legend-element'>
                <div style={{ backgroundColor: colors[i] }} className='legend-element-color'></div>
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
                    <div style={{ width: this.width + 'px' }} className='legend-container'>
                        {this.renderLegendElement()}
                    </div>
                </div>
                : null
        );
    }
}

export default Pie;