import React, { Component } from 'react'
import './css/BarChart.css'
import { scaleLinear } from 'd3-scale'
import { max } from 'd3-array'
import { select } from 'd3-selection'

export class BarChart extends Component {
   constructor(props){
      super(props)
      this.createBarChart = this.createBarChart.bind(this)
   }

   componentDidMount() {
      this.createBarChart()
   }

   componentDidUpdate() {
      this.createBarChart()
   }

   createBarChart() {
   	const vals = Object.values(this.props.data)
   	const buckets = Object.keys(this.props.data)
      console.log(vals, buckets)
      const node = this.node
      const dataMax = max(vals)
      console.log("dataMax", dataMax)
      const yScale = scaleLinear()
         .domain([0, dataMax])
         .range([0, this.props.size[1]])

   select(node)
      .selectAll('rect')
      .data(vals)
      .enter()
      .append('rect')
   
   select(node)
      .selectAll('rect')
      .data(vals)
      .exit()
      .remove()
   
   select(node)
      .selectAll('rect')
      .data(vals)
      .style('fill', '#fe9922')
      .attr('x', (d,i) => i*12)
      .attr('text', (d,i) => buckets[i])
      .attr('y', d => this.props.size[1] - yScale(d))
      .attr('height', d => yScale(d))
      .attr('width', 10)
      .append('text').text((d,i) => buckets[i])
   }

render() {
      return (
      <center>
      <svg ref={node => this.node = node}>
      </svg>
      </center>
      )

   }
}
