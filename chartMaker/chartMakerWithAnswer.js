
const nlp = require('compromise')
module.exports = (intent, command, headers, data) => {
    let extractedHeaders = extractHeaders(command, headers)
    let chart;
    console.log(extractedHeaders, command)
    let hasTime = false;
    switch (intent) {
        case "comparison":
            hasTime = checkTimeAndReorder(extractedHeaders, data);
            console.log(hasTime)
            if (hasTime) {
                let numCategories = countCategories(extractedHeaders[1], data)
                console.log(numCategories)
                if (extractedHeaders.length === 2) {
                    chart = {
                        data: { table: extractDataForTwo(extractedHeaders, data) },
                        spec: {
                            width: 200,
                            height: 200,
                            mark: 'line',
                            encoding: {
                                x: { field: extractedHeaders[0], type: 'temporal' },
                                y: { field: extractedHeaders[1], type: 'quantitative' }
                            },
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                        }
                    }
                } else {
                    extractedHeaders = reorderForTimeAgain(extractedHeaders, data)

                    if (numCategories > 3) {
                        chart = {
                            data: { table: extractDataForThree(extractedHeaders, data) },
                            spec: {
                                width: 200,
                                height: 200,
                                mark: 'line',
                                encoding: {
                                    x: { field: extractedHeaders[0], type: 'temporal' },
                                    y: { field: extractedHeaders[1], type: 'quantitative' },
                                    color: { field: extractedHeaders[2], type: "nominal" }
                                },
                                data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                            }
                        }
                    } else {
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
                                        type: "temporal",
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
                    }
                }
            } else {
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
                            columns: extractedHeaders.length - 1,
                            concat: createLayers(extractedHeaders, data),
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array

                        }

                    }
                }
            }

            return chart
        case "relationship":
            if (extractedHeaders.length === 3) {
                extracteHeaders = reorderThreeHeadersForRelationship(extractedHeaders, data)
                chart = {
                    data: { table: extractDataForThree(extractedHeaders, data) },
                    spec: {
                        width: 200,
                        height: 200,
                        mark: 'point',
                        encoding: {
                            x: { field: extractedHeaders[0], type: "quantitative" },
                            y: { field: extractedHeaders[1], type: "quantitative" },
                            color: { field: extractedHeaders[2], type: "nominal" },
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            } else if (extractedHeaders.length === 4) {
                extracteHeaders = reorderFourHeadersForRelationship(extractedHeaders, data)
                //Need to reoder extracted headers for quantiative data, should put lowest number of categories on axis?
                chart = {
                    data: { table: extractDataForAll(extractedHeaders, data) },
                    spec: {
                        width: 200,
                        height: 200,
                        mark: 'point',
                        encoding: {
                            x: { field: extractedHeaders[0], type: 'quantitative' },
                            y: { field: extractedHeaders[1], type: 'quantitative' },
                            color: { field: extractedHeaders[2], type: "nominal" },
                            size: { field: extractedHeaders[3], type: 'quantitative' }
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            }
            return chart;

        case "distribution":
            if (extractedHeaders.length === 1) {
                chart = {
                    data: { table: extractDataForOne(extractedHeaders, data) },
                    spec: {
                        mark: "bar",
                        encoding: {
                            x: {
                                field: extractedHeaders[0]
                            },
                            y: { aggregate: 'count' }
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            } else if (extractedHeaders.length === 2) {
                chart = {
                    data: { table: extractDataForTwo(extractedHeaders, data) },
                    spec: {
                        mark: "point",
                        encoding: {
                            x: { field: extractedHeaders[0], type: 'quantitative' },
                            y: { field: extractedHeaders[1], type: 'quantitative' },
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            } else if (extractedHeaders.length === 3) {
                //Need to distinguis what is lat and lon,
                //Longitude is supposed to be in the first index of extractedHeaders followed by latitude
                chart = {
                    data: { table: extractDataForAll(extractedHeaders, data) },
                    spec: {
                        projection: {type: {expr: "projection"}},
                        mark: "circle",
                        width: 500,
                        height: 200,
                        params: [
                            {
                              name: "projection",
                              value: "equalEarth",
                              bind: {
                                input: "select",
                                options: [
                                  "albers",
                                  "albersUsa",
                                  "azimuthalEqualArea",
                                  "azimuthalEquidistant",
                                  "conicConformal",
                                  "conicEqualArea",
                                  "conicEquidistant",
                                  "equalEarth",
                                  "equirectangular",
                                  "gnomonic",
                                  "mercator",
                                  "naturalEarth1",
                                  "orthographic",
                                  "stereographic",
                                  "transverseMercator"
                                ]
                              }
                            }
                          ],
                        encoding: {
                            longitude: {
                              field: extractedHeaders[2],
                              type: "quantitative"
                            },
                            latitude: {
                              field: extractedHeaders[1],
                              type: "quantitative"
                            },
                            size: {value: 10},
                            color: {field: extractedHeaders[0], type: "nominal"}
                          },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            }
            return chart
        case "composition":
            hasTime = checkTimeAndReorderComposition(extractedHeaders, data);
            if(hasTime){
                chart = {
                    data: { table: extractDataForTwo(extractedHeaders, data) },
                    spec: {
                        mark: "bar",
                        encoding: {
                          x: {
                            field: extractedHeaders[0],
                            type: "ordinal",
                          },
                          y: {aggregate: "count", type: "quantitative"},
                          color: {
                            field: extractedHeaders[1],
                            type: "nominal",
                            scale: {
                              range: createRandomColors(extractedHeaders[1], data)
                            },
                          }
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            }else {
                if(extractedHeaders.length === 2){
                    extractedHeaders = reoderTwoHeadersForComposition(extractedHeaders, data)
                    chart = {
                        data: { table: extractDataForTwo(extractedHeaders, data) },
                        spec: {
                            mark: "arc",
                            encoding: {
                              theta: {field: extractedHeaders[0], "type": "quantitative"},
                              color: {field: extractedHeaders[1], "type": "nominal"}
                            },
                            view: {stroke: null},
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                        }
                    }
                } else if(extractedHeaders.length > 2){

                }
            }
            return chart
        default: return ''
    }
}

function reorderThreeHeadersForRelationship(extractedHeaders, data) {
    if (findType(extractedHeaders[1], data) === "quantitative") {
        let tmpHeader = extractedHeaders[1];
        extractedHeaders[1] = extractedHeaders[0];
        extractedHeaders[0] = tmpHeader
    }
    if (findType(extractedHeaders[2], data) === "quantitative") {
        let tmpHeader = extractedHeaders[1];
        extractedHeaders[1] = extractedHeaders[2];
        extractedHeaders[2] = tmpHeader
    }

    return extractedHeaders
}
function reorderFourHeadersForRelationship(extractedHeaders, data) {
    if (findType(extractedHeaders[0], data) === "nominal") {
        let tmpHeader = extractedHeaders[2];
        extractedHeaders[2] = extractedHeaders[0];
        extractedHeaders[0] = tmpHeader
    } else if (findType(extractedHeaders[1], data) === "nominal") {
        let tmpHeader = extractedHeaders[2];
        extractedHeaders[2] = extractedHeaders[1];
        extractedHeaders[1] = tmpHeader
    } else if (findType(extractedHeaders[4], data) === "quantitative") {
        let tmpHeader = extractedHeaders[2];
        extractedHeaders[2] = extractedHeaders[4];
        extractedHeaders[4] = tmpHeader
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

function reoderTwoHeadersForComposition(extractedHeaders, data) {
    if(findType(extractedHeaders[1], data) === 'quantitative'){
        let tmpHeader = extractedHeaders[0]
        extractedHeaders[0] = extractedHeaders[1]
        extractedHeaders[1] = tmpHeader
    }
    return extractedHeaders
}

function checkTimeAndReorderComposition(extractedHeaders, data) {
    for(let i = 0; i < extractedHeaders.length; i ++){
        let lowerCaseHeader = extractedHeaders[i].toLowerCase();
        if (lowerCaseHeader.includes("year") || lowerCaseHeader.includes("month")
            || lowerCaseHeader.includes("date") || lowerCaseHeader.includes("day")
            || lowerCaseHeader.includes("time") || lowerCaseHeader.includes("hour")
            || lowerCaseHeader.includes("second")) {
            let tmpHeader = extractedHeaders[0]
            extractedHeaders[0] = extractedHeaders[i];
            extractedHeaders[i] = tmpHeader
            console.log('here')
            return true
        } else if (findType(extractedHeaders[i], data) === "temporal") {
            let tmpHeader = extractedHeaders[0]
            extractedHeaders[0] = extractedHeaders[i];
            extractedHeaders[i] = tmpHeader
            return true
        }
    } 


    return false
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

function extractDataForOne(extractedHeaders, data) {
    let chartData = [];
    for (let i = 0; i < data.length; i++) {
        chartData.push({
            [extractedHeaders[0]]: data[i][extractedHeaders[0]]
        })
    }
    return chartData
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
    for (let i = 0; i < data.length; i++) {
        chartData.push({
            [extractedHeaders[0]]: data[i][extractedHeaders[0]]
        })
    }
    for (let i = 0; i < data.length; i++) {
        for (let n = 1; n < extractedHeaders.length; n++) {
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

function createRandomColors(extractedHeader, data) {
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
    return layers
}

function checkTimeAndReorder(extractedHeaders, data) {
    for (let i = 0; i < extractedHeaders.length; i++) {
        let lowerCaseHeader = extractedHeaders[i].toLowerCase();
        if (lowerCaseHeader.includes("year") || lowerCaseHeader.includes("month")
            || lowerCaseHeader.includes("date") || lowerCaseHeader.includes("day")
            || lowerCaseHeader.includes("time") || lowerCaseHeader.includes("hour")
            || lowerCaseHeader.includes("second")) {
            let tmpHeader = extractedHeaders[0]
            extractedHeaders[0] = extractedHeaders[i];
            extractedHeaders[i] = tmpHeader
            console.log('here')
            return true
        } else if (findType(extractedHeaders[i], data) === "temporal") {
            let tmpHeader = extractedHeaders[0]
            extractedHeaders[0] = extractedHeaders[i];
            extractedHeaders[i] = tmpHeader
            return true
        }
    }

    return false

}

function reorderForTimeAgain(extractedHeaders, data) {
    if (findType(extractedHeaders[2], data) === "quantitative") {
        let tmpHeader = extractedHeaders[1]
        extractedHeaders[1] = extractedHeaders[2]
        extractedHeaders[2] = tmpHeader
    }
    return extractedHeaders
}