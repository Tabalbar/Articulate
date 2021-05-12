const findType = require("../findType")

module.exports = (chartObj, intent, extractedHeaders, data) => {
    let numHeaders = extractedHeaders.length
    console.log(numHeaders)
    switch (numHeaders) {
        case 1:
            chartObj.charts.spec.encoding.x = {
                field: extractedHeaders[0],
                type: findType(extractedHeaders[0], data)
            }
            chartObj.charts.spec.encoding.y = {
                aggregate: 'count'
            }
            return chartObj
        case 2:
            extractedHeaders = findQuantitative(extractedHeaders, data)
            chartObj.charts.spec.encoding.x = {
                // bin: true,
                field: extractedHeaders[0],
                type: findType(extractedHeaders[0], data)
            }
            chartObj.charts.spec.encoding.y = {
                // bin: true,
                field: extractedHeaders[1],
                type: findType(extractedHeaders[1], data)
            }
            // chartObj.charts.spec.encoding.color = { aggregate: "count", type: "quantitative" }
            if(intent == "heatmap"){
                chartObj.charts.spec.encoding.x.bin = true
                chartObj.charts.spec.encoding.y.bin = true
                chartObj.charts.spec.encoding.color = { aggregate: "count", type: "quantitative" }
            }
            return chartObj


        case 3:
            extractedHeaders = findQuantitative(extractedHeaders, data)
            chartObj.charts.spec.encoding.columns = {
                field: extractedHeaders[2],
                type: findType(extractedHeaders[2], data)
            }
            chartObj.charts.spec.encoding.x = {
                field: extractedHeaders[0],
                type: findType(extractedHeaders[0], data)
            }
            chartObj.charts.spec.encoding.y = {
                field: extractedHeaders[1],
                type: findType(extractedHeaders[1], data)
            }
            chartObj.charts.spec.encoding.color = {
                field: extractedHeaders[0],
                type: findType(extractedHeaders[0], data)
            }
            return chartObj
        default: 
        chartObj.errMsg = "Error"
        return chartObj
    }
}
function switchHeaders(extractedHeaders, targetIndex, sourceIndex) {
    let tmpHeader = extractedHeaders[targetIndex]
    extractedHeaders[targetIndex] = extractedHeaders[sourceIndex]
    extractedHeaders[sourceIndex] = tmpHeader
    return extractedHeaders
}

function findQuantitative(extractedHeaders, data) {
    for (let i = 0; i < extractedHeaders.length; i++) {
        if (findType(extractedHeaders[i], data) == "quantitative") {
            return switchHeaders(extractedHeaders, 1, i)
        }
    }
}