import React from 'react';
import * as d3 from 'd3';

class CallingAnsweringGraph extends React.Component {
    constructor(props) {
        super(props);
		this.colors = ['#4FA3F6' , '#45C5DB' ];
        this.canvas;
        this.width = this.props.width || 150;
        this.height = this.props.height || 170;
    }

    getRef(ref) {
        this.canvas = ref;
    }

    componentDidMount() {
        this.addPie();
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
		
        context.translate(margin.left, margin.top);
		
		let totalCallsResponded =  this.props.totalCallsResponded;
		let totalQuestsAnswers =  this.props.totalQuestsAnswers;
		
		let maxValue = totalCallsResponded;
		if(totalQuestsAnswers > totalCallsResponded){
			maxValue = totalQuestsAnswers;
		}
		context.beginPath();
        context.fillStyle = this.colors[0];
        context.fillRect(0, height*(1-(totalCallsResponded/maxValue)), 50,  height*(totalCallsResponded/maxValue));
		
		context.fillStyle = this.colors[1];
		context.fillRect(55, height*(1-(totalQuestsAnswers/maxValue)), 50,  height*(totalQuestsAnswers/maxValue));
     
		if(parseInt(totalQuestsAnswers) > 0 && parseInt(height*(totalQuestsAnswers/maxValue)) == 0){
			 context.fillRect(55, height-3 , 50,  3);
		}
		
		context.save();
        context.rotate(-Math.PI / 2);
        context.textAlign = "right";
        context.textBaseline = "top";
        context.font = "bold 10px sans-serif";
        context.restore();
		 
    }
	
	 
    render() {
        return (
			<div>
				<canvas ref={this.getRef.bind(this)} width={this.width} height={this.height}></canvas> 
			</div>
        );
    }
}

 

export default  CallingAnsweringGraph ;