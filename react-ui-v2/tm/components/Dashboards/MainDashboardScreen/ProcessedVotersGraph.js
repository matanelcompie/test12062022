import React from 'react';
import * as d3 from 'd3';

class ProcessedVotersGraph extends React.Component {
    constructor(props) {
        super(props);
		this.colors = ['#EAECEF' , '#CC3366' ];
        this.canvas;
        this.width = this.props.width || 150;
        this.height = this.props.height || 285;
    }

    getRef(ref) {
        this.canvas = ref;
    }

    componentDidMount() {
        this.addPie();
    }
	
	addPie() {
		
        let context = this.canvas.getContext("2d");
        let margin = { top: 0, right: 20, bottom: 0, left: 23 };
        let width = this.width - margin.left - margin.right;
        let height = this.height - margin.top - margin.bottom;
		
        var x = d3.scaleBand()
            .rangeRound([0, width])
            .padding(0.1);

        var y = d3.scaleLinear()
            .rangeRound([height, 0]);
		
        context.translate(margin.left, margin.top);
		
		let totalVotersCount =    this.props.totalVotersCount;
		let processedVotersCount =   this.props.processedVotersCount;
		let remainingVoterCount = totalVotersCount - processedVotersCount;
		
		
	   
		
		let decimalDigitsCount = 0.1;
		let decimalMultiplier = 0;
		let tempTotalVotersCount = parseInt(totalVotersCount);
		do{
			decimalDigitsCount*= 10;
			decimalMultiplier = tempTotalVotersCount ;
			tempTotalVotersCount = parseInt(tempTotalVotersCount/10);
		}while(tempTotalVotersCount > 0)
			
		let maxValue = (decimalDigitsCount*(1+decimalMultiplier));
		let legendInterval = maxValue / this.props.intervalsCount;

		
	 
		context.beginPath();
		
		if((processedVotersCount/totalVotersCount) < 1){
		 
			context.fillStyle = this.colors[0];
			context.fillRect(10, (((maxValue-totalVotersCount)*height)/maxValue), 40,  height*((remainingVoterCount / maxValue))-2);
		
			context.fillStyle = this.colors[1];
			context.fillRect(10, (((maxValue-processedVotersCount)*height)/maxValue)-2, 40,  2);
		}
		else{
			context.fillStyle = this.colors[0];
			context.fillRect(10, (((maxValue-totalVotersCount)*height)/maxValue), 40,  height*((remainingVoterCount / maxValue)));
		
			context.fillStyle = this.colors[1];
			context.fillRect(10, (((maxValue-processedVotersCount)*height)/maxValue), 40,  height*(1-((maxValue-processedVotersCount) / maxValue)));
     
		}
		context.fillStyle = '#000000';
		context.font = "normal 14px sans-serif";
		context.fillText(0, 120 ,   height);
		
		context.moveTo(0, 10);
		context.lineTo(60, 10);
		context.strokeStyle = "#EAECEF";
		context.stroke();
		
		context.moveTo(0, height);
		context.lineTo(60, height);
		context.stroke();
		
		for(let i = 1 ; i <=  this.props.intervalsCount-1 ; i++){
			
			if(maxValue-legendInterval*i >= remainingVoterCount){
				context.moveTo(0, 10+((i*height)/ this.props.intervalsCount));
				context.lineTo(60, 10+((i*height)/ this.props.intervalsCount));
				context.strokeStyle = "#EAECEF";
				context.stroke();
			}
			else{
				context.moveTo(0, 10+((i*height)/ this.props.intervalsCount));
				context.lineTo(10, 10+((i*height)/ this.props.intervalsCount));
				context.strokeStyle = "#EAECEF";
				context.stroke();
			
				context.moveTo(50, 10+((i*height)/ this.props.intervalsCount));
				context.lineTo(60, 10+((i*height)/ this.props.intervalsCount));
				context.stroke();
			}
			
			context.fillStyle = '#000000';
			context.fillText(maxValue-legendInterval*i, 120 ,   10+((i*height)/ this.props.intervalsCount));
		}
		context.fillText(maxValue, 120 ,   10);
	 
		if(parseInt(processedVotersCount) > 0 && parseInt(height*(processedVotersCount/processedVotersCount)) == 0){
		//	 context.fillRect(55, height-3 , 50,  3);
		}
		
		context.save();
        context.rotate(-Math.PI / 2);
        context.textAlign = "right";
        context.textBaseline = "top";
        context.font = "bold 12px sans-serif";
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

 

export default  ProcessedVotersGraph ;