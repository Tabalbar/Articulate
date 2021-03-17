
const nlp = require('compromise')
module.exports = (intent, command, headers, data) => {
    let extractedHeaders = extractHeaders(command, headers)
    let chart;
    console.log(extractedHeaders, command)
    switch (intent) {
        case "comparison":
            extracteHeaders = reorderHeadersForCategories(extractedHeaders, data)
            if (extractedHeaders.length === 2) {
                chart = {
                    data: { table: extractDataForTwo(extractedHeaders, data) },
                    spec: {
                        width: 200,
                        height: 200,
                        mark: 'bar',
                        encoding: {
                            x: { field: extractedHeaders[0], type: findType(extractedHeaders[0], data) },
                            y: { field: extractedHeaders[1], type: findType(extractedHeaders[1], data) },
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            } else if (extractedHeaders.length === 3) {
                chart = {
                    data: { table: extractDataForThree(extractedHeaders, data) },
                    spec: {
                        width: { step: 50 },
                        mark: "bar",
                        encoding: {
                            column: {
                                field: extractedHeaders[2], type: "nominal", spacing: 10
                            },
                            y: {
                                field: extractedHeaders[1],
                                type: "quantitative",
                                title: extractedHeaders[1],
                                exis: { grid: false }
                            },
                            x: {
                                field: extractedHeaders[0],
                                type: "nominal",
                                axis: { title: "" }
                            },
                            color: {
                                field: extractedHeaders[0],
                                scale: { range: createRandomColros(extractedHeaders[0], data) }
                            }
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array

                    }

                }
            } else if (extractedHeaders.length > 3) {
                chart = {
                    data: { table: extractDataForAll(extractedHeaders, data) },
                    spec: {
                        columns: extractedHeaders.length-1,
                        concat: createLayers(extractedHeaders, data),
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array

                    }

                }
            }

            return chart
        case "relationship":
            if (extractedHeaders.length === 2) {
                extracteHeaders = reorderTwoHeadersForRelationship(extractedHeaders, data)
                chart = {
                    data: { table: extractDataForTwo(extractedHeaders, data) },
                    spec: {
                        width: 200,
                        height: 200,
                        mark: 'point',
                        encoding: {
                            x: { field: extractedHeaders[0], type: findType(extractedHeaders[0], data) },
                            y: { field: extractedHeaders[1], type: findType(extractedHeaders[1], data) },
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            } else if (extractedHeaders.length === 3) {
                extracteHeaders = reorderThreeHeadersForRelationship(extractedHeaders, data)
                chart = {
                    data: { table: extractDataForThree(extractedHeaders, data) },
                    spec: {
                        width: 200,
                        height: 200,
                        mark: 'point',
                        encoding: {
                            x: { field: extractedHeaders[0], type: findType(extractedHeaders[0], data) },
                            y: { field: extractedHeaders[1], type: findType(extractedHeaders[1], data) },
                            size: { field: extractedHeaders[2], type: findType(extractedHeaders[2], data) }
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

function reorderTwoHeadersForRelationship(extractedHeaders, data) {
    if (findType(extractedHeaders[0], data) === "quantitative") {
        let tmpHeader = extractedHeaders[0];
        extractedHeaders[0] = extractedHeaders[1];
        extractedHeaders[1] = tmpHeader
    }
    return extractedHeaders
}
function reorderThreeHeadersForRelationship(extractedHeaders, data) {
    if (findType(extractedHeaders[1], data) === "nominal") {
        let tmpHeader = extractedHeaders[1];
        extractedHeaders[1] = extractedHeaders[0];
        extractedHeaders[0] = tmpHeader
    } else if (findType(extractedHeaders[2], data) === "nominal") {
        let tmpHeader = extractedHeaders[2];
        extractedHeaders[2] = extractedHeaders[0];
        extractedHeaders[0] = tmpHeader
    }
    return extractedHeaders
}

function reorderHeadersForCategories(extractedHeaders, data) {
    if (extractedHeaders.length == 2) {
        if (findType(extractedHeaders[1], data) === "nominal") {
            let tmpHeader = extractedHeaders[1];
            extractedHeaders[1] = extractedHeaders[0];
            extractedHeaders[0] = tmpHeader
        }
    } else if (extractedHeaders.length === 3) {
        if (findType(extractedHeaders[0], data) === "quantitative") {
            let tmpHeader = extractedHeaders[1];
            extractedHeaders[1] = extractedHeaders[0];
            extractedHeaders[0] = tmpHeader
        } else if (findType(extractedHeaders[2], data) === "quantitative") {
            let tmpHeader = extractedHeaders[1];
            extractedHeaders[1] = extractedHeaders[2];
            extractedHeaders[2] = tmpHeader
        }
        let lowestCategories = 0;
        if (countCategories(extractedHeaders[0], data) > countCategories(extractedHeaders[2], data)) {
            let tmpHeader = extractedHeaders[0]
            extractedHeaders[0] = extractedHeaders[2]
            extractedHeaders[2] = tmpHeader
        }

    }
    return extractedHeaders;

}

function findType(header, data) {
    if (data[0][header].includes('/') || data[0][header].includes('-') ||
        data[0][header].includes(':')) {
        return "temporal"
    } else if (isNaN(data[0][header])) {
        return "nominal"
    } else {
        return "quantitative"
    }
}

function extractHeaders(command, headers) {
    let doc = nlp(command)
    let extractedHeaders = []
    for (let i = 0; i < headers.length; i++) {
        if (doc.has(headers[i])) {
            extractedHeaders.push(headers[i])
        }
    }
    return extractedHeaders;
}

function extractDataForTwo(extractedHeaders, data) {
    let chartData = []
    for (let i = 0; i < data.length; i++) {
        chartData.push({
            [extractedHeaders[0]]: data[i][extractedHeaders[0]], [extractedHeaders[1]]: data[i][extractedHeaders[1]]
        })
    }
    return chartData
}

function extractDataForAll(extractedHeaders, data) {
    let chartData = []
    for(let i = 0; i < data.length; i++) {
        chartData.push({
            [extractedHeaders[0]]: data[i][extractedHeaders[0]]
        })
    }
    for(let i = 0; i < data.length; i++){
        for(let n = 1; n < extractedHeaders.length; n++){
            chartData[i][extractedHeaders[n]] = data[i][extractedHeaders[n]]
        }

    }
    console.log('here')
    return chartData;

}

function extractDataForThree(extractedHeaders, data) {
    let chartData = []
    for (let i = 0; i < data.length; i++) {
        chartData.push({
            [extractedHeaders[0]]: data[i][extractedHeaders[0]], [extractedHeaders[1]]: data[i][extractedHeaders[1]], [extractedHeaders[2]]: data[i][extractedHeaders[2]],
        })
    }
    return chartData
}

function createRandomColros(extractedHeader, data) {
    const numCategories = countCategories(extractedHeader, data)
    let colors = [];

    for (let i = 0; i < numCategories; i++) {
        colors.push("#" + Math.floor(Math.random() * 16777215).toString(16))
    }
    return colors
}

function countCategories(extractedHeeader, data) {
    const unique = [...new Set(data.map(item => item[extractedHeeader]))];
    return unique.length
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
                    mark: 'bar',
                    encoding: {
                        x: { field: extractedHeaders[i], type: 'nominal' },
                        y: { field: extractedHeaders[0], type: 'quantitative' }
                    }
                }
            ]
        })
    }
    console.log(layers)
    return layers
}