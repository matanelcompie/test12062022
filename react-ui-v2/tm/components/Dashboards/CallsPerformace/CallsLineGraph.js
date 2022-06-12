import React from 'react';
import * as d3 from 'd3';
/**
 * Line chart using D3
 * parameters:
 * data: (array), array of values {label, value}
 */

class CallsLineGraph extends React.Component {
	
     constructor(props) {
        super(props);
		this.colors = ['#5DAED7' , '#009900' ];
        this.canvas;
        this.width = this.props.width || 546;
        this.height = this.props.height || 121;
		this.numberOfYLines = 5;
	 
    }

    getRef(ref) {
        this.canvas = ref;
    }

    componentDidMount() {
        this.addPie();
    }
	
	componentDidUpdate() {
        this.addPie();
    }
	

    addPie() {
		 
        let context = this.canvas.getContext("2d");
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let margin = { top: 20, right: 0, bottom: 30, left: 0 };
        let width = this.width - margin.left - margin.right;
        let height = this.height - margin.top - margin.bottom;

        var x = d3.scaleBand()
            .rangeRound([0, width])
            .padding(0.1);

        var y = d3.scaleLinear()
            .rangeRound([height, 0]);

       
		
        context.beginPath();
		for(let i = 0 ; i <= this.numberOfYLines ; i++){
			context.moveTo(0, -10+20*i);
			context.lineTo(width-26,-10+20*i );
		}
        context.strokeStyle = "#d2d2d2";
        context.stroke();
		
		let maxValue = 0;
		for(let i = 0 ; i < this.props.inputData.todays_15mins_stats.length ; i++){
			if(this.props.inputData.todays_15mins_stats[i].calls_count > maxValue){
				maxValue = this.props.inputData.todays_15mins_stats[i].calls_count; 
			}
		}
		
		for(let i = 0 ; i < this.props.inputData.average_15mins_stats.length ; i++){
			if(this.props.inputData.average_15mins_stats[i].calls_count > maxValue){
				maxValue = this.props.inputData.average_15mins_stats[i].calls_count; 
			}
		}
		
		 
		
		let decimalMultiplier = 0.1;
		let tempMaxValue = maxValue;
		do{
			decimalMultiplier = decimalMultiplier*10;
			tempMaxValue = tempMaxValue / 10;
		}while(parseInt(tempMaxValue) > 0)
		let multiplyBy = parseInt(tempMaxValue*10) + 1;
		let maxNumber = multiplyBy*decimalMultiplier;
		
				
		context.font = "normal 12px sans-serif";
		context.fillStyle = '#717171';
		for(let i = 0 ; i < this.numberOfYLines ; i++){
			context.fillText(parseInt(i*(maxNumber/(this.numberOfYLines-1))), width, height - 20*i +20);
		}
		
		let stepSize=0; 
		
	    if(this.props.inputData.average_15mins_stats.length > 0){
			context.beginPath();
			//context.beginPath();
			context.lineWidth=3;
			context.strokeStyle = this.colors[1];
			stepSize = (width-20)/this.props.inputData.average_15mins_stats.length;
			context.moveTo(10,height*(1-(this.props.inputData.average_15mins_stats[0].avg_previous/maxNumber))+20);
			//console.log(height + "-" + this.props.inputData.average_15mins_stats[0].avg_previous + "-" + maxNumber);
			for(let i = 1 ; i < this.props.inputData.average_15mins_stats.length   ; i++){
				context.lineTo(stepSize*i+10,height*(1-(this.props.inputData.average_15mins_stats[i].avg_previous/maxNumber))+20);
				context.moveTo(stepSize*i+10,height*(1-(this.props.inputData.average_15mins_stats[i].avg_previous/maxNumber))+20);
				// context.moveTo(10*(i) + (i==0 ? 0 :((i== this.props.inputData.average_15mins_stats.length-1)?140: ( (-10+i*17)))) , height*(1-(this.props.inputData.average_15mins_stats[i].calls_count/maxNumber)) + 20 );
				//context.lineTo(10*(i+1) + (i==0 ? 0 :((i== this.props.inputData.average_15mins_stats.length-1)?140: ( (-10+i*17)))) , height*(1-(this.props.inputData.average_15mins_stats[i-1].calls_count/maxNumber)) + 20 );
			}
			context.stroke();
		}
		
		context.beginPath();
		context.moveTo(10,height)
		
		context.strokeStyle = this.colors[0];
	//	console.log(this.props.inputData.todays_15mins_stats.length);
		if(this.props.inputData.todays_15mins_stats.length == 1){
			context.lineWidth=4;
			context.moveTo(10,height*(1-(this.props.inputData.todays_15mins_stats[0].calls_count/maxNumber))+20);
			context.lineTo(13,height*(1-(this.props.inputData.todays_15mins_stats[0].calls_count/maxNumber))+20);
		}
		else{
			context.lineWidth=3;
			stepSize = (width-20)/this.props.inputData.todays_15mins_stats.length;
			context.moveTo(10,height*(1-(this.props.inputData.todays_15mins_stats[0].calls_count/maxNumber))+20);
			for(let i =1 ; i < this.props.inputData.todays_15mins_stats.length   ; i++){
				context.lineTo(stepSize*i,height*(1-(this.props.inputData.todays_15mins_stats[i].calls_count/maxNumber))+20);
				context.moveTo(stepSize*i,height*(1-(this.props.inputData.todays_15mins_stats[i].calls_count/maxNumber))+20);
				//context.moveTo(10*(i) + (i==0 ? 0 :((i== this.props.inputData.todays_15mins_stats.length-1)?140: ( (-10+i*17)))) , height*(1-(this.props.inputData.todays_15mins_stats[i].calls_count/maxNumber)) + 20 );
				// context.lineTo(10*(i+1) + (i==0 ? 0 :((i== this.props.inputData.todays_15mins_stats.length-1)?140: ( (-10+i*17)))) , height*(1-(this.props.inputData.todays_15mins_stats[i].calls_count/maxNumber)) + 20 );
			}
		}
		context.stroke();
		/* 
		context.font = "normal 12px sans-serif";
		context.fillStyle = '#717171';
		for(let i = 0 ; i <  this.props.inputData.todays_15mins_stats.length ; i++){
			//context.fillText(parseInt(i*(maxNumber/(this.numberOfYLines-1))), width, height - 20*i +20);
		}
		*/
		//console.log(this.props.todays_start_time);
		let startTime = this.props.todays_start_time.split(" ")[1];
		startTime = startTime.split(":");
		let startHour = parseInt(startTime[0]);
		
		context.beginPath();
		context.font = "bold 9px sans-serif";
		for(let i = 0 ; i <= this.props.inputData.todays_15mins_stats.length-1 ; i++){
			//context.moveTo(0, -10+20*i);
			//context.lineTo(width-26,-10+20*i );
			context.moveTo(10+i*stepSize,height +20-3);
			context.lineTo(10+i*stepSize,  height+20+5);
			if(i % 4 == 0){
				context.fillText((startHour<10 ? "0":"")+startHour + ":00", 25+i*(stepSize),  height+30+5) ;
				startHour = startHour+1;
			}
		}
		
		context.lineWidth=1;
        context.strokeStyle = "#000000";
        context.stroke();
		
	 
        context.save();
        context.rotate(-Math.PI / 2);
        context.textAlign = "right";
        context.textBaseline = "top";
        
        context.restore(); 
    }

    renderLegendElement() {
        return <div>
					<div>
					<div style={{width:'10px',height:'10px' , backgroundColor:this.colors[0] , display:'inline-block'}}></div>
					<div style={{display:'inline-block' ,paddingRight:'3px'}}>מצב נוכחי </div>
					<div style={{display:'inline-block' ,width:'20px'}}></div>
					<div style={{width:'10px',height:'10px' , backgroundColor:this.colors[1] , display:'inline-block' }}></div>
					<div style={{display:'inline-block',paddingRight:'3px'}} >ממוצע מתחילת קמפיין </div>
					</div>
			   </div>;
    }

    render() {
		
        let containerStyle = this.props.style || {};
        return (
            (this.props.inputData.todays_15mins_stats.length > 0) ?
                <div style={containerStyle}>
                    <canvas ref={this.getRef.bind(this)} width={this.width} height={this.height}></canvas>
                    <div style={{ width: this.width + 'px' }} className='legend-container' style={{marginTop:'-10px' , marginLeft:'3px'}}>
                        {this.renderLegendElement()}
                    </div>
                </div>
                : null
        );
    }
}

export default CallsLineGraph;