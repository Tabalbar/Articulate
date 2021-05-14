const findType = require("../findType")
const heatmap = require("../specialGraphs/heatmap")
const pie = require('../specialGraphs/pie')
const marginalHistogram = require('../specialGraphs/marginalHistogram')

module.exports = (chartObj, intent, extractedHeaders, data, headerFreq, command) => {
    let numHeaders = extractedHeaders.length
    if (numHeaders > 3) {
        numHeaders = 4
    }
    if (intent == "pie") {
        return pie(chartObj, extractedHeaders, data)
    }
    if (intent == "heatmap") {
        return heatmap(chartObj, extractedHeaders, data, headerFreq, command)
    }
    if(intent == "marginalHistogram") {
        return marginalHistogram(chartObj, extractedHeaders, data, headerFreq, command)
    }
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
                field: extractedHeaders[0],
                type: findType(extractedHeaders[0], data)
            }
            chartObj.charts.spec.encoding.y = {
                field: extractedHeaders[1],
                type: findType(extractedHeaders[1], data)
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
        case 4:
            chartObj.charts.spec.columns = extractedHeaders.length - 1
            chartObj.charts.spec.concat = createLayers(extractedHeaders, data)
            delete chartObj.charts.spec.encoding
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
    return extractedHeaders
}

function createLayers(extractedHeaders, data) {
    let layers = [];
    for (let i = 0; i < extractedHeaders.length; i++) {
        if (findType(extractedHeaders[i], data) === "quantitative") {
            let tmpHeader = extractedHeaders[0];
            extractedHeaders[0] = extractedHeaders[i];
            extractedHeaders[i] = tmpHeader;
            break;

        }
    }
    for (let i = 1; i < extractedHeaders.length; i++) {
        layers.push({
            layer: [
                {
                    mark: layerMark,
                    encoding: {
                        x: { field: extractedHeaders[i], type: findType(extractedHeaders[i], data) },
                        y: { field: extractedHeaders[0], type: findType(extractedHeaders[0], data) }

                    }
                }
            ]
        })
    }
    return layers
}