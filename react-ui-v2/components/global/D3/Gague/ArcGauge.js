import React from 'react';
import  ReactDOM   from 'react-dom';
 
import * as d3 from 'd3';
 


class ArcGauge extends React.Component {
	
	constructor(props) {
        super(props);
		this.state={
			arrow:{
				height: 55,
				width: 5,
				color: '#a5a5a5'
				}
      }
    }
	 
  
    componentDidMount() {
		return this.renderArcGauge();
	} 

	componentDidUpdate() {
		return this.renderArcGauge();
	} 

	render() {
		return <div className="gauge-el"></div>;
	}

  renderArcGauge() {
    const el = ReactDOM.findDOMNode(this);
    var {value, width} = this.props;
	if(!value || isNaN(value) || !isFinite(value)   ){
		value = 0;
	}
    const height = this.props.height || (width / 2);

    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }

    // Values: provided styles || default styles
    let radius = this.props.radius,
        sections = this.props.sections,
        sectionsNum = this.props.sections.length,
        sectionWidth = this.props.size,
        rotateAngle = .75,
        sectionFill = 1 / sectionsNum / 2,
        sectionSpaces = -0.04,
        legend = this.props.legend,
        arrow = this.props.arrow || this.state.arrow,
        arcStart, arcEnd, padStart, padEnd;

    // Draw svg
 
    let arc = d3.arc()
        .startAngle(this._deg2rad(-80))
        .endAngle(this._deg2rad(80))
        .outerRadius(height);

    let svg = d3.select(el).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height + ")");

    var meter = svg.append("g")
        .attr("class", "progress-meter");
 
    // Generate path
    sections.map((section, sectionIndex) => {
      let index = sectionIndex + 1;
      arcStart = this._percToRad(rotateAngle);
      arcEnd = arcStart + this._percToRad(sectionFill);
      rotateAngle += sectionFill;
      padStart = 0 ? 0 : sectionSpaces / 2;
      padEnd = sectionsNum ? 0 : sectionSpaces / 2;

      arc = d3.arc()
          .outerRadius(radius)
          .innerRadius(radius - sectionWidth)
          .startAngle(arcStart + padStart)
          .endAngle(arcEnd - padEnd);

      meter.append("path")
        .attr("d", arc)
        .attr("id", "gauge-path-" + index)
        .attr('class', "gauge-section-" + index)
        .attr("fill", section);

      // Legend
      if (legend) {
        let text = meter.append("text")
            .attr("x", 10)
            .attr("dy", 35);

        text.append("textPath")
            .attr("class","gauge-text")
            .attr("xlink:href","#gauge-path-" + index)
            .text(legend[sectionIndex]);
      }
    });

    // Label
    if (this.props.label) {
      let text = meter.append("text")
          .attr("class", "gauge-label")
          .attr("text-anchor", "middle")
          .attr("dy", "1.8em")
          .attr("fill", "#515151");

      text.text(value + '%');
    }
 

    // Draw and animate arrow with default or provided styles
    this._drawArrow(meter, value, arrow.color, arrow.width, arrow.height);
    this._animateArrow(meter, value * 0.01, arrow.width, arrow.height);
    meter.transition();
    return meter;
  }

  //ease(d3.easeLinear)
  _animateArrow(el, perc, width, height) {
    var scope = this;
 
    return el.transition()
		.ease(d3.easeElastic)
        .delay(500)
        
        .duration(4000)
        .selectAll('.gauge-arrow')
        .tween('progress', () => {
          return function(percentOfPercent) {
			    
            return d3.select(this)
                .attr('d', scope._mkCmd(width, height, percentOfPercent * perc));
          };
        });
  } 

  _drawArrow(el, perc, color, width, height) {
    el.append('circle')
        .attr('class', 'gauge-arrow-center')
        .attr('cx', 0).attr('cy', 0)
        .attr("fill", color)
        .attr('r', width);

	 
    return el.append('path')
        .attr('class', 'gauge-arrow')
        .attr("fill", color)
        .attr('d', this._mkCmd(width, height, perc));
  }

  _mkCmd(width, height, perc) {
    let centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;

    thetaRad = this._percToRad(perc / 2);
    centerX = 0;
    centerY = 0;
    topX = centerX - height * Math.cos(thetaRad);
    topY = centerY - height * Math.sin(thetaRad);
    leftX = centerX - width * Math.cos(thetaRad - Math.PI / 2);
    leftY = centerY - width * Math.sin(thetaRad - Math.PI / 2);
    rightX = centerX - width * Math.cos(thetaRad + Math.PI / 2);
    rightY = centerY - width * Math.sin(thetaRad + Math.PI / 2);
    return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
  }

  _percToDeg(perc) {
    return perc * 360;
  }

  _percToRad(perc) {
    return this._degToRad(this._percToDeg(perc));
  }

  _degToRad(deg) {
    return deg * Math.PI / 180.5;
  }

  _deg2rad(deg) {
    return deg / 180 * Math.PI;
  }
};


ArcGauge.defaultProps = {
    width:'100%'
};


export default ArcGauge;