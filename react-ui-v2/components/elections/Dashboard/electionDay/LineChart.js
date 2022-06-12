import React from 'react';
import * as d3 from 'd3';
 

/**
 * LineChart chart using D3
 *
 * parameters:
 * width: (number) the width of the container
 * height: (number) the height of the container
 * style:(object) container style
 * data: (array), array of values {label, value}
 */
class LineChart extends React.Component {
    constructor(props) {
        super(props);
        this.canvas;
        this.width =   970;
        this.height =   180;
    }

    getRef(ref) {
        this.canvas = ref;
    }

    componentDidMount() {
        this.addPie();
    }
	
	componentDidUpdate(){
		//  this.addPie();
		//console.log("update")
	}
	
	 

    addPie() {

        let context = this.canvas.getContext("2d");
 	   
	   /*
 	    context.globalCompositeOperation='destination-over';
		context.fillStyle = "#fff";
		context.fillRect(0,0,context.width,context.height);
		context.fill();
	 */
		
        let margin = { top: 10, right: 40, bottom: 10, left: 10 };
        let width = this.width - margin.left - margin.right;
        let height = this.height - margin.top - margin.bottom;
 
        context.translate(margin.left, margin.top);
   

        var yTickCount = 10;
 
		let arrayHours = [];
		let VoteElectionsHours = this.props.VoteElectionsHours;
		let startHour = parseInt(VoteElectionsHours['vote_start_time']);
		let endHour = parseInt(VoteElectionsHours['vote_end_time']);
		let currentHour = startHour;
		while (currentHour <= endHour) {
			let hourStr = currentHour;
			if (currentHour < 10) { hourStr = '0' + hourStr }
			hourStr += ':00';
			arrayHours.push(hourStr)
			currentHour++;
		}

		var xTickCount = arrayHours.length ;
		let colWidth = this.width / xTickCount;
		context.lineWidth = 4;
		for(let i = 0 ; i < this.props.data.length ; i++){
			let d = this.props.data[i]; 
			context.beginPath();  
			context.strokeStyle = this.props.colors[i];

			for (let j = 0; j < d.length; j++) {
				if (i == 1) {
					context.lineTo(j * 61.5, height - d[j].percentage * 1.6);
				}
				else {
					context.lineTo((parseInt(d[j].time) - startHour) * colWidth, height - d[j].percentage * 1.6);
				}
			}
			context.stroke();
			context.strokeStyle = "#cccccc"; 
		}
		 
		context.lineWidth=1;
	 
        context.beginPath();
        context.moveTo(0, 0);
        context.strokeStyle = "#cccccc";
        context.lineTo(0, height  );
		context.lineTo(width, height  );
		context.lineTo(width, 0  );
        context.fillStyle = "#666666";
        context.stroke();
		
		for(let i = 0 ; i < yTickCount ; i++){
			
			 context.fillStyle = "#cccccc";
			 context.strokeStyle = "#cccccc";
			 context.moveTo(0,  i*16   );
			 context.lineTo(width,  i*16 );
             context.stroke();
			 if(i%2 == 0){
				 context.strokeStyle = "#50B973";
				 context.fillStyle = "#50B973";
				context.strokeText((100-10*i)+'%', width+25 , i*16+2 ); 
			 }
		}
         context.strokeStyle = "#cccccc";
		context.fillStyle = "#666666";
		context.fillText(arrayHours[0], 15 , height + 10);
		for(let i = 0 ; i < xTickCount-1 ; i++){

			context.moveTo((i + 1) * colWidth, 0);
			context.lineTo((i + 1) * colWidth, height);
             context.stroke();
			 context.fillText(arrayHours[i+1], (i+1)*colWidth+15 , height + 10); 
			 
		}
		context.fillText(arrayHours[arrayHours.length - 1], width+15 , height + 10);
        context.save();
		
		context.moveTo(0,  height  );
		
		context.save();
		
		context.rotate(-Math.PI / 2);
        context.textAlign = "right";
        context.textBaseline = "top";
        context.font = "bold 10px sans-serif";
        context.restore();
 
    }


    render() {
		
        let containerStyle = this.props.style || {};
        return (
            (this.props.data.length > 0) ?
                 
                    <canvas ref={this.getRef.bind(this)} width={this.width} height={this.height}></canvas>
               
                : null
        );
    }
}

export default LineChart;