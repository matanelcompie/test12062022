import React from 'react';
import * as d3 from 'd3';
/**
 * Line chart using D3
 * parameters:
 * data: (array), array of values {label, value}
 */

class VotesLineGraph extends React.Component {
	
     constructor(props) {
        super(props);
		this.colors = ['#68A3DA' ];
        this.canvas;
        this.width = this.props.width || 1340;
        this.height = this.props.height || 181;
		this.numberOfYLines = 6;
    }

    getRef(ref) {
        this.canvas = ref;
    }

    componentDidMount() {
	//	if(this.props.data.length){
			this.addPie();
		//}
    }
	
	componentDidUpdate() {
        this.addPie();
    }
	

    addPie() {
	    
        let context = this.canvas.getContext("2d");
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let margin = { top: 20, right: 0, bottom: 20, left: 0 };
        let width = this.width - margin.left - margin.right;
        let height = this.height - margin.top - margin.bottom;

        var x = d3.scaleBand()
            .rangeRound([0, width])
            .padding(0.1);

        var y = d3.scaleLinear()
            .rangeRound([height, 0]);

       
		
        context.beginPath();
		for(let i = 0 ; i <= this.numberOfYLines ; i++){
			context.moveTo(0,  25*i+27);
			context.lineTo(width-50, 25*i+27 );
		}
        context.strokeStyle = "#d2d2d2";
        context.stroke();
		
		let maxValue = 0;
		for(let i = 0 ; i < this.props.data.length ; i++){
			if(this.props.data[i].value > maxValue){
				maxValue = this.props.data[i].value; 
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
		 
		if(this.props.data.length > 0){
			context.font = "normal 12px sans-serif";
			context.fillStyle = '#717171';
			for(let i = 0 ; i < this.numberOfYLines ; i++){
				context.fillText(parseInt(i*(maxNumber/(this.numberOfYLines-1))), width, height - 30*i +40);
			}
		}
		else{
			context.fillText(0, width-20, height  +40);
		}
		
		let lineToRelatively = Math.floor(this.width/(this.props.data.length*1.3));
		
		let fragmentLength = Math.floor((this.width-(this.width/(this.props.data.length*1.75)))/ this.props.data.length);
		 
		context.beginPath();
		context.lineWidth=3.5;
		context.strokeStyle = this.colors[0];
		let previousX = lineToRelatively;
		let previousY = 0;
		if(this.props.data.length > 0){
			previousY = height*(1-(this.props.data[0].value/maxNumber))+ 20;
		} 
	//	lineToRelatively = (this.width/(this.props.data.length*1.4))  ;
		context.moveTo(previousX, previousY );
        for(let i = 1 ; i < this.props.data.length  ; i++){
			 context.font = "bold 20px sans-serif";
			 context.fillStyle = this.colors[0] ;
			 context.fillText("●", previousX+6  , previousY+6 );
			  
			 context.lineTo(fragmentLength + previousX , height*(1-(this.props.data[i].value/maxNumber)) + 30 );
			 previousX += fragmentLength;
			 previousY = height*(1-(this.props.data[i].value/maxNumber)) + 30 ;
		}
 
		context.fillText("●", previousX+6  , previousY+6 );
		context.stroke();
	 
        context.save();
        context.rotate(-Math.PI / 2);
        context.textAlign = "right";
        context.textBaseline = "top";
        context.font = "bold 14px sans-serif";
        context.restore(); 
    }

    renderLegendElement() {
		let self = this;
		let lineToRelatively = Math.floor(this.width/(this.props.data.length*1.3));
		
		let fragmentLength = Math.floor((this.width-(this.width/(this.props.data.length*1.75)))/ this.props.data.length);
		let previousX = lineToRelatively-15;
		
        return this.props.data.map((item, i) => {
			if(i > 0){
				previousX +=(fragmentLength+2);
			}
			if(self.props.data.length >= 16 && i == self.props.data.length - 1){ // if too much data + last item
				return <div key={i} className='legend-element' style={{position:'absolute' , left:((previousX-5) + 'px') , color:'#717171'}}>
							<div  className='legend-element-color'></div>
							<span className='legend-element-label'>{item.label.length == 4 ? ("0"+item.label): item.label}</span>
					   </div>
			}
			else{
				return <div key={i} className='legend-element' style={{position:'absolute' , left:(previousX + 'px') , color:'#717171'}}>
							<div  className='legend-element-color'></div>
							<span className='legend-element-label'>{item.label.length == 4 ? ("0"+item.label): item.label}</span>
						</div>
			}
            
        });
    }

    render() {
        let containerStyle = this.props.style || {};
 
        return (
            //(this.props.data.length > 0) ?
                <div style={containerStyle}>
                    <canvas ref={this.getRef.bind(this)} width={this.width} height={this.height}></canvas>
                    <div style={{ width: this.width + 'px' }} className='legend-container' style={{marginTop:'0px' , marginLeft:'3px'}}>
                        {this.renderLegendElement()}
                    </div>
                </div>
              //  : null
        );
    }
}

export default VotesLineGraph;