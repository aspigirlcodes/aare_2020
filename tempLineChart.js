function drawTempLineChart(dataset) {
    
    // 1. ACCESS DATA
    
    const aareTempAccessor = d => d.aareTempMax
    const airTempAccessor = d => d.airTempMax
    const avgAareTempAccessor = d => d.aareTempAvg31
    const avgAirTempAccessor = d => d.airTempAvg31

    const dateParser = d3.timeParse("%Y-%m-%dT00:00:00")
    const xAccessor = d => dateParser(d.date)

    // 2. DIMENSIONS
    let dimensions = {
        width: 700,
        height: 350,
        margin: {
            top: 15,
            right: 15,
            bottom: 40,
            left: 60
        }
    }
    dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
    dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

    // 3. DRAW CANVAS
    const wrapper = d3.select("#temp-timeline")
        .append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
    
    const bounds = wrapper.append("g")
        .style("transform", `translate(${dimensions.margin.left}px,
            ${dimensions.margin.top}px)`)
    
    //4. CREATE SCALES
    const yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, airTempAccessor))
        .range([dimensions.boundedHeight, 0])

    const xScale = d3.scaleTime()
        .domain(d3.extent(dataset, xAccessor))
        .range([0, dimensions.boundedWidth])

    // 5. DRAW DATA
    const airLineGenerator = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(airTempAccessor(d)))
        .defined(d => airTempAccessor(d) !== null)
    
    const aareLineGenerator = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(aareTempAccessor(d)))
        .defined(d => aareTempAccessor(d) !== null)

    const avgAirLineGenerator = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(avgAirTempAccessor(d)))
        .defined(d => avgAirTempAccessor(d) !== null)

    const avgAareLineGenerator = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(avgAareTempAccessor(d)))
        .defined(d => avgAareTempAccessor(d) !== null)

    const airLine = bounds.append("path")
        .attr("d", airLineGenerator(dataset))
        .attr("fill", "none")
        .attr("stroke", "darkslategrey")
        .attr("stroke-width", 2)

    const aareLine = bounds.append("path")
        .attr("d", aareLineGenerator(dataset))
        .attr("fill", "none")
        .attr("stroke", "darkcyan")
        .attr("stroke-width", 2)
    
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
        .html("Daily Max. Temperature (&deg;C)")
        .style("transform", "rotate(-90deg)")
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
            width: 2,
            text: "Daily max air temperature at Berne"
        },
        {
            color: "darkcyan",
            width: 2,
            text: "Daily max Aare temperature at Berne"
        },
        {
            color: "darkslategrey",
            width: 2,
            text: "Max Air temp 31 days moving average"
        },
        {
            color: "darkcyan",
            width: 2,
            text: "Max Aare temp 31 days moving average"
        },
    ]

    const legendGroup = wrapper.append("g")
        .style("transform", `translate(${dimensions.margin.left + 20}px,
            ${dimensions.margin.top }px)`)
        
    
    const makeLegend = (legenddata) => {
        legendGroup.selectAll("line")
            .data(legenddata).join("line")
                .attr("x1", 0)
                .attr("y1", (d,i) => i*20)
                .attr("x2", 15)
                .attr("y2", (d,i) => i*20)
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
    makeLegend(legend.slice(0,2))

    //7. INTERACTIONS  
        //hover tooltip
    const listeningRect = bounds.append("rect")
        .attr("class", "listening-rect")
        .attr("width", dimensions.boundedWidth)
        .attr("height", dimensions.boundedHeight)
        .on("mousemove", onMouseMove)
        .on("mouseleave", onMouseLeave)
    const tooltip = d3.select("#temp-line-tooltip")
    const tooltipLine = bounds.append("line")
        .attr("class", "tooltip-line")
        .attr("stroke", "darkslategrey")
        .attr("stroke-width", 1)
        .style("opacity", 0)
    
    function onMouseMove() {
        const mousePosition = d3.mouse(this)
        const hoveredDate = xScale.invert(mousePosition[0])
    
        const getDistanceFromHoveredDate = d => Math.abs(xAccessor(d) - hoveredDate)
        const closestIndex = d3.scan(dataset, (a, b) => (
        getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
        ))
        const closestDataPoint = dataset[closestIndex]
    
        const closestXValue = xAccessor(closestDataPoint)
        const closestYValue = airTempAccessor(closestDataPoint)
        const closestY2Value = aareTempAccessor(closestDataPoint)

        const formatDate = d3.timeFormat("%B %-d, %Y")
        tooltip.select("#date")
            .text(formatDate(closestXValue))
    
        const formatTemperature = d => `${d3.format(".1f")(d)}°C`
        tooltip.select("#airlinetemp")
            .html(formatTemperature(closestYValue))
        tooltip.select("#aarelinetemp")
            .html(formatTemperature(closestY2Value))
        
        const width = parseInt(wrapper.style("width").replace("px", ""));
        const x = (xScale(closestXValue)
        + dimensions.margin.left) *width / dimensions.width
        const y = (dimensions.margin.top) *width / dimensions.width
    
        tooltip.style("transform", `translate(`
        + `calc( -45% + ${x}px),`
        + `calc(-100% + ${y}px)`
        + `)`)
    
        tooltip.style("opacity", 1)
    
        tooltipLine
            .attr("x1", xScale(closestXValue))
            .attr("x2", xScale(closestXValue))
            .attr("y1", 0)
            .attr("y2", dimensions.boundedHeight)
            .style("opacity", 1)
    }
    
    function onMouseLeave() {
        tooltip.style("opacity", 0)
    
        tooltipLine.style("opacity", 0)
    }

        //clickables
    d3.select("#averager").on("click", function(){
        airLine.transition().duration(1)
            .attr("d", airLineGenerator(dataset.slice(15, dataset.length-15)))
        airLine.transition().duration(5000)
            .attr("d", avgAirLineGenerator(dataset))
        aareLine.transition().duration(1)
            .attr("d", aareLineGenerator(dataset.slice(15, dataset.length-15)))
        aareLine.transition().duration(5000)
            .attr("d", avgAareLineGenerator(dataset))
        makeLegend(legend.slice(2,4))
        listeningRect.on("mousemove", ()=>{})
        listeningRect.on("mouseleave", () => {})
        d3.select("#resetter").attr("class", "btn btn-link")
    })

    d3.select("#resetter").on("click", function(){
        airLine.transition().duration(1)
            .attr("d", airLineGenerator(dataset))
        
        aareLine.transition().duration(1)
            .attr("d", aareLineGenerator(dataset))
        makeLegend(legend.slice(0,2))
        listeningRect.on("mousemove", onMouseMove)
        listeningRect.on("mouseleave", onMouseLeave)
        d3.select("#resetter").attr("class", "d-none")
    })
}

export default drawTempLineChart
