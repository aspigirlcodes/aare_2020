function drawHeightLineChart(dataset) {
    // 1. ACCESS DATA
    const heightAccessor = d => d.aareHeight
    
    const avgHeightAccessor = d => d.heightAvg31

    const percipAccessor = d => d.percip

    const dateParser = d3.timeParse("%Y-%m-%dT00:00:00")
    const xAccessor = d => dateParser(d.date)

    // 2. DIMENSIONS
    let dimensions = {
        width: 700,
        height: 350,
        margin: {
            top: 15,
            right: 60,
            bottom: 40,
            left: 60
        }
    }
    dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
    dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom


    // 3. DRAW CANVAS
    const wrapper = d3.select("#height-timeline")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)

    const bounds = wrapper.append("g")
        .style("transform", `translate(${dimensions.margin.left}px,
            ${dimensions.margin.top}px)`)
    
    //4. CREATE SCALES        
    const yScale = d3.scaleLinear()
        .domain([501, d3.max(dataset, heightAccessor)])
        .range([dimensions.boundedHeight, 0])

    const percipScale = d3.scaleLinear()
        .domain([0, 50])
        .range([dimensions.boundedHeight,0])

    const xScale = d3.scaleTime()
        .domain(d3.extent(dataset, xAccessor))
        .range([0, dimensions.boundedWidth])


    // 5. DRAW DATA    
    const heightLineGenerator = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(heightAccessor(d)))
        .defined(d => heightAccessor(d) !== null)
    
    const avgLineGenerator = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(avgHeightAccessor(d)))
        .defined(d => avgHeightAccessor(d) !== null)

    const heightLine = bounds.append("path")
        .attr("d", heightLineGenerator(dataset))
        .attr("fill", "none")
        .attr("stroke", "darkslategrey")
        .attr("stroke-width", 1)

    const avgHeightLine = bounds.append("path")
        .attr("d", avgLineGenerator(dataset))
        .attr("fill", "none")
        .attr("stroke", "darkcyan")
        .attr("stroke-width", 3)
    
    const rects =  bounds.selectAll("rect")
        .data(dataset)
          .enter().append("rect")
          .attr("x", d => xScale(xAccessor(d)))
          .attr("y", d => percipScale(percipAccessor(d)))
          .attr("width", 1)
          .attr("height", d => dimensions.boundedHeight - percipScale(percipAccessor(d)) )
          .attr("fill", "steelblue")

    //6. DRAW PERIPHERALS
        //axes
    const yAxisGenerator = d3.axisLeft()
        .scale(yScale)
    
    const yAxis = bounds.append("g")
        .call(yAxisGenerator)

    const yAxisLabel = yAxis.append("text")
        .attr("x", -dimensions.boundedHeight/2 )
        .attr("y", -dimensions.margin.left + 15)
        .attr("fill", "black")
        .style("font-size", "1.4em")
        .html("Water level(m above sea level)")
        .style("transform", "rotate(-90deg)")
        .style("text-anchor", "middle")
  
    const percipAxisGenerator = d3.axisRight()
        .scale(percipScale)
    
    const percipAxis = bounds.append("g")
        .call(percipAxisGenerator)
        .style("transform", `translateX(${dimensions.boundedWidth}px)`)
    
    const percipAxisLabel = percipAxis.append("text")
        .attr("x", dimensions.boundedHeight/2 )
        .attr("y", -dimensions.margin.left + 20)
        .attr("fill", "black")
        .style("font-size", "1.4em")
        .html("Precipitation(mm)")
        .style("transform", "rotate(90deg)")
        .style("text-anchor", "middle")


    const xAxisGenerator = d3.axisBottom()
        .scale(xScale)
    
    const xAxis = bounds.append("g")
        .call(xAxisGenerator) 
        .style("transform", `translateY(${dimensions.boundedHeight}px)`)

        //legend
    const legend = [
        {
            color: "darkslategrey",
            width: 1,
            text: "Daily average waterlevel at Berne"
        },
        {
            color: "darkcyan",
            width: 3,
            text: "31 day moving average of waterlevel"
        },
        {
            color: "steelblue",
            width: 1,
            text: "Daily precipitation"
        },
    ]

    const legendGroup = wrapper.append("g")
        .style("transform", `translate(${dimensions.margin.left + 20}px,
            ${dimensions.margin.top }px)`)
        
    
    const makeLegend = (legenddata) => {
        legendGroup.selectAll("line")
            .data(legenddata).join("line")
                .attr("x1", (d, i) => i < 2 ? 0 : 7)
                .attr("y1", (d,i) => i<2 ? i*20 : i*15)
                .attr("x2", (d, i) => i < 2 ? 15 : 7)
                .attr("y2", (d,i) => i<2 ? i*20 : i*15+15)
                .attr("fill", "none")
                .attr("stroke", d => d.color)
                .attr("stroke-width", d => d.width)
                .exit().remove()
        legendGroup.selectAll("text")
            .data(legenddata).join("text")
                .attr("x", 20)
                .attr("y",(d,i) => 5+i*20)
                .html(d => d.text)
                .attr("fill", "black")
                .style("font-size", "0.8em")
                .exit().remove()
    }
    makeLegend(legend)
    

}

export default drawHeightLineChart
