const findType = require('../findType')

module.exports = (actualCommand, extractedHeaders, filteredHeaders, data) => {
    if(extractedHeaders.length !== 2) {
        let chartObj = {
            errmsg: 'error'
        }
        return chartObj
    }
    for(let i = 0; i < extractedHeaders.length; i++) {
        if(findType(extractedHeaders[i], data) == "nominal") {
            switchHeaders(extractedHeaders, 0, i)
        }
        if(findType(extractedHeaders[i], data) == "quantitative") {
            switchHeaders(extractedHeaders, 1, i)
        }
    }
    let chartObj = {
        plotly: true,
        data: [{
            r: extractedHeaders[1],
            theta: extractedHeaders[0],
            fill: 'toself'
        }],
        layout: {
            polar: {
                redialaxis: {
                    visible: true,
                    range: [Math.min(extractedHeaders[1]), Math.max(extractedHeaders[1])]
                }
            },
            title: {text: actualCommand}
        }
    }
    return chartObj
}

function switchHeaders(extractedHeaders, targetIndex, sourceIndex) {
    let tmpHeader = extractedHeaders[targetIndex]
    extractedHeaders[targetIndex] = extractedHeaders[sourceIndex]
    extractedHeaders[sourceIndex] = tmpHeader
    return extractedHeaders
}
