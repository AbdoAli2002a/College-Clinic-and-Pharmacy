import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BloodTypeD3ChartProps {
  students: any[];
}

export default function BloodTypeD3Chart({ students }: BloodTypeD3ChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!students || students.length === 0 || !svgRef.current) return;

    // Process data
    const bloodTypeCounts: Record<string, number> = {};
    let total = 0;
    students.forEach(s => {
      const bt = s.bloodType || 'غير مسجل';
      bloodTypeCounts[bt] = (bloodTypeCounts[bt] || 0) + 1;
      total++;
    });

    const data = Object.keys(bloodTypeCounts).map(key => ({
      bloodType: key,
      count: bloodTypeCounts[key],
      percentage: ((bloodTypeCounts[key] / total) * 100).toFixed(1) + '%'
    })).sort((a, b) => b.count - a.count);

    const width = 450;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const x = d3.scaleBand()
      .domain(data.map(d => d.bloodType))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 0]).nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.bloodType))
      .range(d3.schemeBlues[9].slice(3));

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-family", "inherit")
      .style("font-weight", "600")
      .style("font-size", "12px")
      .attr("fill", "#4b5563");

    // Y axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => Number.isInteger(d) ? d.toString() : ''))
      .selectAll("text")
      .style("font-family", "inherit")
      .style("font-size", "11px")
      .attr("fill", "#6b7280");
      
    // Remove axis domains (lines) for cleaner look
    svg.selectAll('.domain').remove();
    svg.selectAll('.tick line')
       .attr('stroke', '#f3f4f6')
       .attr('x2', width - margin.left - margin.right);

    // Bars with animation
    svg.append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => x(d.bloodType)!)
      .attr('y', height - margin.bottom)
      .attr('height', 0)
      .attr('width', x.bandwidth())
      .attr('fill', d => color(d.bloodType) as string)
      .attr('rx', 6)
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .delay((_, i) => i * 150)
      .attr('y', d => y(d.count))
      .attr('height', d => y(0) - y(d.count));
      
    // Labels on top of bars
    svg.append('g')
      .selectAll('text')
      .data(data)
      .join('text')
      .attr('x', d => x(d.bloodType)! + x.bandwidth() / 2)
      .attr('y', d => y(d.count) - 8)
      .attr('text-anchor', 'middle')
      .text(d => d.count)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay((_, i) => i * 150 + 500)
      .attr('opacity', 1);

    // Add tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('background', '#1f2937')
      .style('color', '#fff')
      .style('padding', '6px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('font-family', 'inherit')
      .style('pointer-events', 'none')
      .style('z-index', 1000);

    svg.selectAll('rect')
      .on('mouseover', (event, d: any) => {
        d3.select(event.currentTarget).attr('opacity', 0.8);
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`فصيلة: ${d.bloodType}<br/>العدد: ${d.count}<br/>النسبة: ${d.percentage}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).attr('opacity', 1);
        tooltip.transition().duration(500).style('opacity', 0);
      });

    return () => {
      d3.selectAll('.d3-tooltip').remove();
    };
  }, [students]);

  return (
    <div className="w-full flex justify-center items-center font-sans overflow-hidden">
      <svg ref={svgRef} width="450" height="300" viewBox="0 0 450 300" className="max-w-full h-auto" />
    </div>
  );
}
