// import React, { Component } from 'react'
// import { LineChart } from 'react-d3-basic'
// import * as d3 from 'd3';

// export class LineCharter extends Component {
// 	constructor(props) {
// 		super(props)
// 		this.createLineChart = this.createLineChart.bind(this)
// 		this.formatData = this.formatData.bind(this)
// 	}

// 	componentDidMount() {
// 		this.createLineChart();
// 	}

// 	componentDidUpdate() {
// 		this.createLineChart();
// 	}

// 	formatData() {
// 		const formatted = []
// 		Object.keys(this.props.data).forEach(k => {
// 			formatted.push({date: k, energy: this.props.data[k].energy})
// 		})
// 		return formatted;

// 	}

// 	render() {
// 		const data = this.props.data
// 		console.log("TPD", this.props.data)
// 		const parseDate = d3.timeFormat('%Y-%m-%d');
// 		const width = 700,
// 			  height = 300,
// 			  margins = {left: 100, right: 100, top: 50, bottom: 50}
// 	    const chartSeries = [
// 	    	{
// 	    		field: 'enery',
// 	    		name: 'Energy',
// 	    		color: 'red'
// 	    	}
// 	    ]
// 	    const x = (d) => parseDate(d.date)
// 	    const xScale = 'time';
// 		return (
// 			<LineChart
// 			 margins={margins}
// 			 data={data}
// 			 width={width}
// 			 height={height}
// 			 chartSeries={chartSeries}
// 			 x={x}
// 			 xScale={xScale}/>
// 		)
// 	}
// }