async function drawLineChart() {
  const dataset = await d3.json("./data.json")
  //console.table(dataset[0])

  const centralMovingAverage = function (data, window){
        if(! window%2 === 1){
            console.error("central moving average requires odd window length")
            return []
        }
        startIndex = 0 + Math.ceil(window/2)
        endIndex = data.length - 1 - Math.ceil(window/2)
        return Array.from(Array(endIndex - startIndex + 1), 
            (d,i) => ({
                date: data[startIndex + i].date, 
                slice: data.slice(i, i + window)
                })).map(d => 
                    ({
                        date:d.date, 
                        value: d.slice.reduce((a,b)=> a + b.aareHeight, 0)/d.slice.length
                    })
                )
    }

  const averagDataset = centralMovingAverage(dataset, 31)

  console.log(averagDataset)

  const yAccessor = d => d.airTempMax
  
  const y2Accessor = d => d.aareTempMax

  const avgAccessor = d => d.airTempAvg31

  const percipAccessor = d => d.percip

  const dateParser = d3.timeParse("%Y-%m-%dT00:00:00")
  const xAccessor = d => dateParser(d.date)
  
  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 400,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60
    }
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  const wrapper = d3.select("#wrapper")
    .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
      .style("transform", `translate(${dimensions.margin.left}px,
        ${dimensions.margin.top}px)`)
    
 const percipScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, percipAccessor)])
        .range([dimensions.boundedHeight, 0])

  const yScale = d3.scaleLinear()
      .domain(d3.extent(dataset, yAccessor))
      .range([dimensions.boundedHeight, 0])

  const xScale = d3.scaleTime()
      .domain(d3.extent(dataset, xAccessor))
      .range([0, dimensions.boundedWidth])

  const lineGenerator = d3.line()
      .x(d => xScale(xAccessor(d)))
      .y(d => yScale(yAccessor(d)))
      .defined(d => yAccessor(d) !== null)

  const line = bounds.append("path")
      .attr("d", lineGenerator(dataset))
      .attr("fill", "none")
      .attr("stroke", "#af9358")
      .attr("stroke-width", 2)

  const line2Generator = d3.line()
      .x(d => xScale(xAccessor(d)))
      .y(d => yScale(y2Accessor(d)))
      .defined(d => yAccessor(d) !== null)

    const avgLineGenerator = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(avgAccessor(d)))
        .defined(d => yAccessor(d) !== null)

  const line2 = bounds.append("path")
      .attr("d", line2Generator(dataset))
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 2)


  const rects =  bounds.selectAll("rect")
    .data(dataset)
      .enter().append("rect")
      .attr("x", d => xScale(xAccessor(d)))
      .attr("y", d => percipScale(percipAccessor(d)))
      .attr("width", 5)
      .attr("height", d => dimensions.boundedHeight - percipScale(percipAccessor(d)) )
        
  const yAxisGenerator = d3.axisLeft()
      .scale(yScale)
  
  const yAxis = bounds.append("g")
      .call(yAxisGenerator)

  const xAxisGenerator = d3.axisBottom()
      .scale(xScale)
  
  const xAxis = bounds.append("g")
    .call(xAxisGenerator) 
      .style("transform", `translateY(${dimensions.boundedHeight}px)`)
      

    d3.select("#body").on("scroll", function(){
        console.log("scrolling")
        line.transition().duration(1000)
        .attr("d", avgLineGenerator(dataset))})
      



}

async function drawScatter(){
    let dataset = await d3.json("./data.json")

    

    const xAccessor = d => d.airTempMax  
    const yAccessor = d => d.aareTempMax
    const dateParser = d3.timeParse("%Y-%m-%dT00:00:00")
    const dateAccessor = d => dateParser(d.date)

    const width = d3.min([window.innerWidth*0.9, window.innerHeight*0.9])

    const dimensions = {
        width: width,
        height: width,
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


    const wrapper = d3.select("#wrapper")
      .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

    const bounds = wrapper.append("g")
        .style("transform", `translate(${dimensions.margin.left}px,
            ${dimensions.margin.top}px)`)

    const xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, xAccessor))
        .range([0, dimensions.boundedWidth])
        .nice()
    const yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, xAccessor))
        .range([dimensions.boundedHeight, 0])
        .nice()

    const dots = bounds.selectAll("circle")
        .data(dataset)
      .enter().append("circle")
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
    
    const line = bounds.append("line")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", xScale(25))
        .attr("y2", yScale(25))
        .attr("stroke", "black")

    
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
        .html("Air Temp (&deg;C)")

    const yAxisGenerator = d3.axisLeft()
        .scale(yScale)
    
    const yAxis = bounds.append("g")
        .call(yAxisGenerator)

    const yAxisLabel = yAxis.append("text")
        .attr("x", -dimensions.boundedWidth/2)
        .attr("y", -dimensions.margin.left + 10)
        .attr("fill", "black")
        .style("font-size", "1.4em")
        .html("Aare Temp (&deg;C)")
        .style("transform", "rotate(-90deg)")
        .style("text-anchor", "middle")

    


}


async function drawBars(){
    const dataset = await d3.json("./data.json")

    const width = 600

    let dimensions = {
        width: width,
        height: width*0.6,
        margin: {
            top: 30,
            right: 15,
            bottom: 50,
            left: 50
        }
    }
    dimensions.boundedWidth = dimensions.width - dimensions.margin.left
        - dimensions.margin.right
    dimensions.boundedHeight = dimensions.height - dimensions.margin.top    
        - dimensions.margin.bottom

    const drawHistogram = metric => {
        const metricAccessor = d => d[metric]
        const yAccessor = d => d.length
        const wrapper = d3.select("#wrapper")
        .append("svg")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height)

        const bounds = wrapper.append("g")
            .style("transform", `translate(${dimensions.margin.left}px,
                ${dimensions.margin.top}px)`)
        

        const xScale = d3.scaleLinear()
            .domain(d3.extent(dataset, metricAccessor))
            .range([0, dimensions.boundedWidth])
            .nice()
        const binsGenerator = d3.histogram()
            .domain(xScale.domain())
            .value(metricAccessor)
            .thresholds(12)

        const bins = binsGenerator(dataset)

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(bins, yAccessor)])
            .range([dimensions.boundedHeight, 0])
            .nice()

        const binsGroup = bounds.append("g")

        const binGroups = binsGroup.selectAll("g")
            .data(bins)
            .enter().append("g")

        const barPadding = 1

        const barRects = binGroups.append("rect")
            .attr("x", d=> xScale(d.x0) + barPadding/2)
            .attr("y", d => yScale(yAccessor(d)))
            .attr("width", d => d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding ]))
            .attr("height", d => dimensions.boundedHeight - yScale(yAccessor(d)))
            .attr("fill", "cornflowerblue")

        const barText = binGroups.filter(yAccessor).append("text")  
            .attr("x", d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
            .attr("y", d => yScale(yAccessor(d)) - 5)
            .text(yAccessor)
            .style("text-anchor", "middle")
            .attr("fill", "darkgrey")
            .style("font-size", "12px")
            .style("font-family", "sans-serif")

        
        const mean = d3.mean(dataset, metricAccessor)
        const meanLine = bounds.append("line")
            .attr("x1", xScale(mean))
            .attr("x2", xScale(mean))
            .attr("y1", dimensions.boundedHeight)
            .attr("y2", -15)
            .attr("stroke", "maroon")
            .attr("stroke-dasharray", "2px 4px")

        const meanLabel = bounds.append("text")
            .attr("x", xScale(mean))
            .attr("y", -20)
            .text("mean")
            .attr("fill", "maroon")
            .style("font-size", "12px")
            .style("text-anchor", "middle")

        const xAxisGenerator = d3.axisBottom()
            .scale(xScale)

        const xAxis = bounds.append("g")
            .call(xAxisGenerator)
            .style("transform", `translateY(${dimensions.boundedHeight}px)`)

        const xAxisLabel = xAxis.append("text")
            .attr("x", dimensions.boundedWidth / 2)
            .attr("y", dimensions.margin.bottom - 10)
            .attr("fill", "black")
            .style("font-size", "1.4em")
            .text(metric)
    }    
    metrics = ["aareTemp", "aareHeight", "aareFlow", "airTemp", "percip"]
    metrics.forEach(drawHistogram)

}


drawLineChart()
drawScatter()
drawBars()
