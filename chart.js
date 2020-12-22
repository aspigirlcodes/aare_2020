async function drawTempLineChart() {
    // 1. ACCESS DATA
    const dataset = await d3.json("./data.json")

    const aareTempAccessor = d => d.aareTempMax
    const airTempAccessor = d => d.airTempMax
    const avgAareTempAccessor = d => d.aareTempAvg31
    const avgAirTempAccessor = d => d.airTempAvg31

    const dateParser = d3.timeParse("%Y-%m-%dT00:00:00")
    xAccessor = d => dateParser(d.date)

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

async function drawTempScatter() {
    // 1. ACCESS DATA
    let dataset = await d3.json("./data.json")

    const xAccessor = d => d.airTempMax  
    const yAccessor = d => d.aareTempMax
    const dateParser = d3.timeParse("%Y-%m-%dT00:00:00")
    const dateAccessor = d => dateParser(d.date)

    // 2. DIMENSIONS
    const dimensions = {
        width: 700,
        height: 700,
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
    const wrapper = d3.select("#temp-scatter")
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
        .domain(d3.extent(dataset, xAccessor))
        .range([dimensions.boundedHeight, 0])
        .nice()


    // 5. DRAW DATA

    function joinCircles(dataset){
        return bounds.selectAll("circle")
            .data(dataset)
            .join("circle")
            .attr("cx", d => xScale(xAccessor(d)))
            .attr("cy", d => yScale(yAccessor(d)))
            .attr("r", 5)
            .attr("fill", d => {
                if(dateAccessor(d) < new Date("2020-03-20")){
                    return "deepskyblue"}
                else if (dateAccessor(d) < new Date("2020-06-20")){
                    return "forestgreen"
                }else if (dateAccessor(d) < new Date("2020-09-22")){
                    return "orange"
                }else if (dateAccessor(d) < new Date("2020-12-21")){
                    return "orangered"
                }else{return "deepskyblue"}
            })
    }


    const dots = joinCircles(dataset)
    
    const line = bounds.append("line")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", xScale(25))
        .attr("y2", yScale(25))
        .attr("stroke", "black")
        .attr("stroke-width", 3)

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
        .html("Air Daily Max. Temperature (&deg;C)")

    const yAxisGenerator = d3.axisLeft()
        .scale(yScale)
    
    const yAxis = bounds.append("g")
        .call(yAxisGenerator)

    const yAxisLabel = yAxis.append("text")
        .attr("x", -dimensions.boundedWidth/2)
        .attr("y", -dimensions.margin.left + 15)
        .attr("fill", "black")
        .style("font-size", "1.4em")
        .html("Aare Daily Max. Temperature (&deg;C)")
        .style("transform", "rotate(-90deg)")
        .style("text-anchor", "middle")
    
        // legend
    const legendDimensions = {
        width: 100,
        height: 100
    }

    const legendGroup = wrapper.append("g")
        .attr("class", "tempScatterLegend")
        .attr("transform", `translate(${dimensions.width- dimensions.margin.right - legendDimensions.width},
            ${dimensions.height - dimensions.margin.bottom - legendDimensions.height})`)
    
    const legend = [
        {
            color: "deepskyblue",
            text: "winter"
        },
        {
            color: "forestgreen",
            text: "spring"
        },
        {
            color: "orange",
            text: "summer"
        },
        {
            color: "orangered",
            text: "autumn"
        },
    ]
    
            
    legend.forEach(
        (d,i) => {
            legendGroup.append("circle")
                .attr("cx", 5)
                .attr("cy", 5 + 20*i)
                .attr("r", 5)
                .attr("fill", d.color)
            legendGroup.append("text")
                .attr("x", 20)
                .attr("y", 10 + 20*i)
                .attr("fill", "black")
                .style("font-size", "1em")
                .html(d.text)
        }
    )
    
    //7. INTERACTIONS  
        //hover tooltip
    const delaunay = d3.Delaunay.from(
        dataset,
        d => xScale(xAccessor(d)),
        d => yScale(yAccessor(d)),
    )
    const voronoi = delaunay.voronoi()
    voronoi.xmax = dimensions.boundedWidth
    voronoi.ymax = dimensions.boundedHeight

    bounds.selectAll(".voronoi")
    .data(dataset)
    .enter().append("path")
        .attr("class", "voronoi")
        .attr("d", (d,i) => voronoi.renderCell(i))
        .on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave)

    const tooltip = d3.select("#temp-scatter-tooltip")
    function onMouseEnter(datum) {
    const dayDot = bounds.append("circle")
        .attr("class", "tempScatterTooltipDot")
        .attr("cx", xScale(xAccessor(datum)))
        .attr("cy", yScale(yAccessor(datum)))
        .attr("r", 7)
        .style("fill", "none")
        .style("stroke", "darkslategrey")
        .style("stroke-width", 2)
        .style("pointer-events", "none")

    const formatTemp = d3.format(".2f")
    tooltip.select("#aaretemp")
        .text(formatTemp(yAccessor(datum)))

    tooltip.select("#airtemp")
        .text(formatTemp(xAccessor(datum)))

    const formatDate = d3.timeFormat("%B %-d, %Y")
    tooltip.select("#date")
        .text(formatDate(dateAccessor(datum)))

    // note: needs scale factor for real width vs defined base width
    const width = parseFloat(wrapper.style("width").replace("px", ""))
    
    const x = (xScale(xAccessor(datum))
        + dimensions.margin.left ) * width/dimensions.width
    const y = (yScale(yAccessor(datum))
        + dimensions.margin.top) * width/dimensions.width
    
    

    tooltip.style("transform", `translate(`
        + `calc( -45% + ${x}px ),`
        + `calc(-100% + ${y}px)`
        + `)`)

    tooltip.style("opacity", 1)
    }

    function onMouseLeave() {
    d3.selectAll(".tempScatterTooltipDot")
        .remove()

    tooltip.style("opacity", 0)
    }


        //clickables
    
    d3.select("#winter").on("click", function(){
        joinCircles(dataset.filter(d => dateAccessor(d) < new Date("2020-03-20") || dateAccessor(d) >= new Date("2020-12-21")))
    })   
    
    d3.select("#spring").on("click", function(){
        joinCircles(dataset.filter(d => dateAccessor(d) < new Date("2020-06-20") || dateAccessor(d) >= new Date("2020-12-21")))
    })

    d3.select("#summer").on("click", function(){
        joinCircles(dataset.filter(d => dateAccessor(d) < new Date("2020-09-22") || dateAccessor(d) >= new Date("2020-12-21")))        
    })

    d3.select("#autumn").on("click", function(){
        joinCircles(dataset)        
    })
    
}

async function drawHeightLineChart() {
    // 1. ACCESS DATA
    const dataset = await d3.json("./data.json")

    const heightAccessor = d => d.aareHeight
    
    const avgHeightAccessor = d => d.heightAvg31

    const percipAccessor = d => d.percip

    const dateParser = d3.timeParse("%Y-%m-%dT00:00:00")
    xAccessor = d => dateParser(d.date)

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

async function drawHeightScatter() {
    // 1. ACCESS DATA
    let dataset = await d3.json("./data.json")
    
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


drawTempLineChart()
drawTempScatter()
drawHeightLineChart()
drawHeightScatter()

