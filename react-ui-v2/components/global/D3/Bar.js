import React from 'react';
import * as d3 from 'd3';
import colors from './colors';

/**
 * Bar chart using D3
 *
 * parameters:
 * width: (number) the width of the container
 * height: (number) the height of the container
 * style:(object) container style
 * data: (array), array of values {label, value}
 */
class Bar extends React.Component {
    margin = { top: 20, right: 20, bottom: 30, left: 40 };
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
        this.context.beginPath();
        this.context.translate(-this.margin.left, -this.margin.top);
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.closePath();
    }
    addPie(pieData) {
        let context = this.canvas.getContext("2d");
        let margin = this.margin;
        let width = this.width - margin.left - margin.right;
        let height = this.height - margin.top - margin.bottom;

        var x = d3.scaleBand()
            .rangeRound([0, width])
            .padding(0.1);

        var y = d3.scaleLinear()
            .rangeRound([height, 0]);

        context.translate(margin.left, margin.top);
        x.domain(pieData.map(d => d.label));
        y.domain([0, d3.max(pieData, d => d.value)]);

        var yTickCount = 10,
            yTicks = y.ticks(yTickCount),
            yTickFormat = y.tickFormat();

        context.beginPath();
        yTicks.forEach(d => {
            context.moveTo(0, y(d) + 0.5);
            context.lineTo(-6, y(d) + 0.5);
        });
        context.strokeStyle = "black";
        context.stroke();

        context.textAlign = "right";
        context.textBaseline = "middle";
        yTicks.forEach(d => {
            context.fillText(yTickFormat(d), -9, y(d));
        });

        context.beginPath();
        context.moveTo(-6.5, 0 + 0.5);
        context.lineTo(0.5, 0 + 0.5);
        context.lineTo(0.5, height + 0.5);
        context.lineTo(-6.5, height + 0.5);
        context.strokeStyle = "black";
        context.stroke();

        context.save();
        context.rotate(-Math.PI / 2);
        context.textAlign = "right";
        context.textBaseline = "top";
        context.font = "bold 10px sans-serif";
        context.restore();

        pieData.forEach((d, i) => {
            context.fillStyle = colors[i];
            context.fillRect(x(d.label), y(d.value), x.bandwidth(), height - y(d.value));
        });
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

export default Bar;