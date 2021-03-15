
const nlp = require('compromise')
module.exports = (intent, command, headers, data) => {
    switch(intent){
        case "comparison":

        case "relationship":
            let extractedHeaders = extractHeaders(command, headers)
            let chart;
            if(extractedHeaders.length === 2) {
                extracteHeaders = reoderHeadersForTwo(extractedHeaders, data)
                chart = {
                    data: {table: extractDataForTwo(extractedHeaders, data)},
                    spec: {
                        width: 200,
                        height: 200,
                        mark: 'point',
                        encoding: {
                          x: { field: extractedHeaders[0], type: findType(extractedHeaders[0], data) },
                          y: { field: extractedHeaders[1], type: findType(extractedHeaders[1], data)},
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            } else if (extractedHeaders.length === 3) {
                extracteHeaders = reoderHeadersForThree(extractedHeaders, data)
                console.log(extractedHeaders)
                chart = {
                    data: {table: extractDataForThree(extractedHeaders, data)},
                    spec: {
                        width: 200,
                        height: 200,
                        mark: 'point',
                        encoding: {
                          x: { field: extractedHeaders[0], type: findType(extractedHeaders[0], data) },
                          y: { field: extractedHeaders[1], type: findType(extractedHeaders[1], data)},
                          size: {field: extractedHeaders[2], type: findType(extractedHeaders[2], data)}
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            }
            return chart;
 
        case "distribution":
        case "composition":
        default: return ''
    }
}  

function reoderHeadersForTwo(extractedHeaders, data) {
    if(findType(extractedHeaders[0], data) === "quantitative"){
        let tmpHeader = extractedHeaders[0];
        extractedHeaders[0] = extractedHeaders[1];
        extractedHeaders[1] = tmpHeader
    }
    return extractedHeaders
}
function reoderHeadersForThree(extractedHeaders, data) {
    if(findType(extractedHeaders[1], data) === "nominal"){
        let tmpHeader = extractedHeaders[1];
        extractedHeaders[1] = extractedHeaders[0];
        extractedHeaders[0] = tmpHeader
    } else if(findType(extractedHeaders[2], data) === "nominal"){
        let tmpHeader = extractedHeaders[2];
        extractedHeaders[2] = extractedHeaders[0];
        extractedHeaders[0] = tmpHeader
    }
    return extractedHeaders
}

function findType(header, data) {
    if(data[0][header].includes('/') || data[0][header].includes('-') ||
    data[0][header].includes(':')) {
        return "temporal"
    } else if(isNaN(data[0][header])) {
        return "nominal"
    } else {
        return "quantitative"
    }
}

function extractHeaders(command, headers) {
    let doc = nlp(command)
    let extractedHeaders = []
    for(let i = 0; i < headers.length; i ++){
        if(doc.has(headers[i])){
            extractedHeaders.push(headers[i])
        }
    }
    return extractedHeaders;
}

function extractDataForTwo(extractedHeaders, data){
    let chartData = []
    for(let i = 0; i < data.length; i++) {
        chartData.push({
            [extractedHeaders[0]]: data[i][extractedHeaders[0]], [extractedHeaders[1]]: data[i][extractedHeaders[1]]
        })
    }
    return chartData
}
function extractDataForThree(extractedHeaders, data){
    let chartData = []
    for(let i = 0; i < data.length; i++) {
        chartData.push({
            [extractedHeaders[0]]: data[i][extractedHeaders[0]], [extractedHeaders[1]]: data[i][extractedHeaders[1]],[extractedHeaders[2]]: data[i][extractedHeaders[2]],
        })
    }
    return chartData
}