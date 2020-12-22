import drawTempLineChart from "./tempLineChart.js"
import drawTempScatter from "./tempScatter.js"
import drawHeightLineChart from "./heightLineChart.js"
import drawHeightScatter from "./heightScatter.js"

async function drawCharts() {
    // 0. LOAD DATA
    const dataset = await d3.json("./data.json")
    drawTempLineChart(dataset)
    drawTempScatter(dataset)
    drawHeightLineChart(dataset)
    drawHeightScatter(dataset)
}

drawCharts()
