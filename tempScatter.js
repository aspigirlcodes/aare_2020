function drawTempScatter(dataset) {
    // 1. ACCESS DATA
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

export default drawTempScatter
