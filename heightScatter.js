function drawHeightScatter(dataset) {
    // 1. ACCESS DATA
    
    const xAccessor = d => d.aareHeight  
    const yAccessor = d => d.aareFlow
    
    // 2. DIMENSIONS
    const dimensions = {
        width: 400,
        height: 400,
        margin: {
            top: 10,
            right: 10,
            bottom: 50,
            left: 50,
        }
    }
    dimensions.boundedWidth = dimensions.width - dimensions.margin.left 
        - dimensions.margin.right
    dimensions.boundedHeight = dimensions.height - dimensions.margin.top
        - dimensions.margin.bottom

    // 3. DRAW CANVAS
    const wrapper = d3.select("#height-scatter")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)

    const bounds = wrapper.append("g")
        .style("transform", `translate(${dimensions.margin.left}px,
            ${dimensions.margin.top}px)`)

    //4. CREATE SCALES
    const xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, xAccessor))
        .range([0, dimensions.boundedWidth])
        .nice()
    const yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, yAccessor))
        .range([dimensions.boundedHeight, 0])
        .nice()
    
    // 5. DRAW DATA
    const dots = bounds.selectAll("circle")
        .data(dataset)
      .enter().append("circle")
        .attr("cx", d => xScale(xAccessor(d)))
        .attr("cy", d => yScale(yAccessor(d)))
        .attr("r", 5)
        .attr("fill", "darkslategrey")
    
    //6. DRAW PERIPHERALS
        //axes
    const xAxisGenerator = d3.axisBottom()
        .scale(xScale)

    const xAxis = bounds.append("g")
        .call(xAxisGenerator)
          .style("transform", `translateY(${dimensions.boundedHeight}px)`)

    const xAxisLabel = xAxis.append("text")
        .attr("x", dimensions.boundedWidth/2)
        .attr("y", dimensions.margin.bottom - 10)
        .attr("fill", "black")
        .style("font-size", "1.4em")
        .html("Water level (Height above sea level) (m)")

    const yAxisGenerator = d3.axisLeft()
        .scale(yScale)
    
    const yAxis = bounds.append("g")
        .call(yAxisGenerator)

    const yAxisLabel = yAxis.append("text")
        .attr("x", -dimensions.boundedWidth/2)
        .attr("y", -dimensions.margin.left + 15)
        .attr("fill", "black")
        .style("font-size", "1.4em")
        .html("Aare Flow (m³/s)")
        .style("transform", "rotate(-90deg)")
        .style("text-anchor", "middle")
    
}

export default drawHeightScatter
