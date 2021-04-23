
const nlp = require('compromise')
module.exports = (intent, command, headers, data, headerMatrix, actualCommand) => {
    let filteredHeaders = extractFilteredHeaders(command, headerMatrix, data, headers, command)
    let extractedHeaders = extractHeaders(command, headers, filteredHeaders, data)
    let chartObj = {
        charts: null,
        errMsg: ''
    };

    let hasTime = false;
    switch (intent) {
        case "bar":
            hasTime = checkTimeAndReorder(extractedHeaders, data);
            if (hasTime) {
                if (extractedHeaders.length === 3) {
                    chartObj.charts = {
                        data: { table: data },
                        spec: {
                            title: actualCommand,
                            width: 400,
                            height: 400,
                            mark: "bar",
                            transform: [],
                            encoding: {
                                column: {
                                    field: extractedHeaders[2], type: "nominal", spacing: 10
                                },
                                y: {
                                    field: extractedHeaders[0],
                                    type: "quantitative",
                                    title: extractedHeaders[0],
                                    exis: { grid: false }
                                },
                                x: {
                                    tickCount: 12,
                                    field: extractedHeaders[1],
                                    type: "temporal",
                                    axis: {
                                        tickCount: 12,
                                        labelAlign: "left",
                                        labelExpr: "[timeFormat(datum.value, '%b'), timeFormat(datum.value, '%m') == '01' ? timeFormat(datum.value, '%Y') : '']",
                                        labelOffset: 4,
                                        labelPadding: -24,
                                        tickSize: 30,
                                        gridDash: {
                                            condition: {
                                                test: { field: "value", timeUnit: "month", "equal": 1 },
                                                value: []
                                            },
                                            value: [5, 5]
                                        },
                                        tickDash: {
                                            condition: {
                                                test: { field: "value", timeUnit: "month", "equal": 1 },
                                                value: []
                                            },
                                            value: [5, 5]
                                        }
                                    }
                                },
                                color: {
                                    field: extractedHeaders[1],
                                    scale: { range: createRandomColors(extractedHeaders[1], data) }
                                }
                            },
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array

                        }

                    }
                } else {
                    chartObj.errMsg = "Could not create graph. Expected 2 headers. Got " + extractedHeaders.length

                }
            } else {
                extractedHeaders = reorderHeadersForCategories(extractedHeaders, data)
                if (extractedHeaders.length === 1) {
                    chartObj.charts = {
                        data: { table: data },
                        spec: {
                            title: actualCommand,
                            mark: "bar",
                            transform: [],
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
                    console.log(extractedHeaders, 'herehrehrhehrehrhe')
                    chartObj.charts = {
                        data: { table: data },
                        spec: {
                            title: actualCommand,
                            width: 200,
                            height: 200,
                            mark: 'bar',
                            transform: [],
                            encoding: {
                                x: { field: extractedHeaders[0], type: findType(extractedHeaders[0], data) },
                                y: { field: extractedHeaders[1], type: findType(extractedHeaders[1], data) },
                            },
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                        }
                    }
                } else if (extractedHeaders.length === 3) {
                    chartObj.charts = {
                        data: { table: data },
                        spec: {
                            title: actualCommand,
                            width: { step: 10 },
                            mark: "bar",
                            transform: [],
                            encoding: {
                                column: {
                                    field: extractedHeaders[1], type: "nominal", spacing: 0
                                },
                                y: {
                                    field: extractedHeaders[0],
                                    type: "quantitative",
                                    title: extractedHeaders[0],
                                    exis: { grid: false }
                                },
                                x: {
                                    field: extractedHeaders[2],
                                    type: "nominal",
                                    axis: { title: "" }
                                },
                                color: {
                                    field: extractedHeaders[2],
                                    scale: { range: createRandomColors(extractedHeaders[2], data) }
                                }
                            },
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array

                        }

                    }
                } else if (extractedHeaders.length > 3) {
                    chartObj.charts = {
                        data: { table: data },
                        spec: {
                            title: actualCommand,
                            transform: [],
                            columns: extractedHeaders.length - 1,
                            concat: createLayers(extractedHeaders, data),
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array

                        }

                    }
                } else {
                    chartObj.errMsg = "Could not create graph. Got " + extractedHeaders.length + " headers"
                }
            }
            break;
        case "line":
            if (extractedHeaders.length === 1) {
                if (findType(extractedHeaders[0], data) === "quantitative") {
                    chartObj.charts = {
                        data: { table: data },
                        spec: {
                            title: actualCommand,
                            mark: "line",
                            transform: [],
                            encoding: {
                                x: { field: extractedHeaders[0], type: "quantitative" },
                                y: { aggregate: 'count' }
                            },
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                        }
                    }
                } else {
                    chartObj.errMsg = "Could not create graph. Expected numerical values. Got " + findType(extractedHeaders[0], data)

                }
            } else if (extractedHeaders.length === 2) {
                hasTime = checkTimeAndReorder(extractedHeaders, data);
                if (hasTime) {

                    chartObj.charts = {
                        data: { table: data },
                        spec: {
                            title: actualCommand,
                            width: 200,
                            height: 200,
                            transform: [],
                            mark: 'line',
                            encoding: {
                                x: { field: extractedHeaders[0], type: 'temporal' },
                                y: { field: extractedHeaders[1], type: 'quantitative' }
                            },
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                        }
                    }
                }
            } else if (extractedHeaders.length === 3) {
                console.log(extractedHeaders)

                hasTime = checkTimeAndReorder(extractedHeaders, data);
                if (hasTime) {
                    chartObj.charts = {
                        data: { table: data },
                        spec: {
                            title: actualCommand,
                            width: 600,
                            height: 600,
                            transform: [],
                            mark: 'line',
                            encoding: {
                                x: { field: extractedHeaders[1], type: 'temporal' },
                                y: { field: extractedHeaders[0], type: 'quantitative' },
                                color: { field: extractedHeaders[2], type: "nominal" }
                            },
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                        }
                    }
                } else {
                    chartObj.errMsg = "Could not create graph. Expected temporal data. "
                }
            } else {
                chartObj.errMsg = "Could not create graph. Expected 2 or 3 headers. Got " + extractedHeaders.length

            }
            break;
        case "scatter":
            if (extractedHeaders.length === 2) {
                extracteHeaders = reorderTwoHeadersForRelationship(extractedHeaders, data)
                chartObj.charts = {
                    data: { table: data },
                    spec: {
                        title: actualCommand,
                        width: 200,
                        height: 200,
                        mark: 'point',
                        transform: [],
                        encoding: {
                            x: { field: extractedHeaders[0], type: "quantitative" },
                            y: { field: extractedHeaders[1], type: "quantitative" },
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            } else if (extractedHeaders.length === 3) {
                extracteHeaders = reorderThreeHeadersForRelationship(extractedHeaders, data)
                chartObj.charts = {
                    data: { table: data },
                    spec: {
                        title: actualCommand,
                        width: 200,
                        height: 200,
                        mark: 'point',
                        transform: [],
                        encoding: {
                            x: { field: extractedHeaders[0], type: "quantitative" },
                            y: { field: extractedHeaders[1], type: "quantitative" },
                            size: { field: extractedHeaders[2], type: "quantitative" },
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            } else {
                chartObj.errMsg = "Could not create graph. Expected 2 or 3 headers. Got " + extractedHeaders.length
            }
            break;
        case "pie":
            if (extractedHeaders.length === 2) {
                extractedHeaders = reoderTwoHeadersForComposition(extractedHeaders, data)
                chartObj.charts = {
                    data: { table: data },
                    spec: {
                        title: actualCommand,
                        mark: "arc",
                        transform: [],
                        encoding: {
                            theta: { field: extractedHeaders[0], type: "quantitative" },
                            color: { field: extractedHeaders[1], type: "nominal" }
                        },
                        view: { stroke: null },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            } else {
                chartObj.errMsg = "Could not create graph. Expected 2 headers. Got " + extractedHeaders.length

            }
            break;
        case "marginalHistogram":
            if (extractedHeaders.length == 2) {
                chartObj.charts = {
                    data: { table: data },
                    spec: {
                        title: actualCommand,
                        transform: [],
                        vconcat: [
                            {
                                mark: "bar",
                                height: 60,
                                encoding: {
                                    x: { bin: true, field: extractedHeaders[0], axis: null },
                                    y: { aggregate: "count", scale: { domain: [0, 500] }, title: "" }
                                }
                            },
                            {
                                spacing: 15,
                                bounds: "flush",
                                hconcat: [
                                    {
                                        mark: "rect",
                                        encoding: {
                                            x: { bin: true, field: extractedHeaders[0], type: "quantitative" },
                                            y: { bin: true, field: extractedHeaders[1], type: "quantitative" },
                                            color: { aggregate: "count" }
                                        }
                                    },
                                    {
                                        mark: "bar",
                                        width: 60,
                                        encoding: {
                                            y: { "bin": true, field: extractedHeaders[1], axis: null },
                                            x: {
                                                aggregate: "count",
                                                scale: { domain: [0, 500] },
                                                title: ""
                                            }
                                        }
                                    }
                                ]
                            }
                        ],
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array

                    }

                }
            } else {
                chartObj.errMsg = "Could not create graph. Expected 2 headers. Got " + extractedHeaders.length
            }
            break;
        case "heatmap":
            if (extractedHeaders.length == 2) {
                chartObj.charts = {
                    data: { table: data },
                    spec: {
                        title: actualCommand,
                        mark: "rect",
                        wdith: 300,
                        height: 200,
                        transform: [],
                        encoding: {
                            x: {
                                bin: true,
                                field: extractedHeaders[0],
                                type: "quantitative"
                            },
                            y: {
                                bin: true,
                                field: extractedHeaders[1],
                                type: "quantitative"
                            },
                            color: { aggregate: "count", type: "quantitative" },
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }

                }
            } else {
                chartObj.errMsg = "Could not create graph. Expected 2 headers. Got " + extractedHeaders.length
            }
            break;
        case "lineArea":
            if (extractedHeaders.length == 3) {
                hasTime = checkTimeAndReorder(extractedHeaders, data)
                reorderForLineArea(extractedHeaders, data)
                if (hasTime) {
                    chartObj.charts = {
                        data: { table: data },
                        spec: {
                            title: actualCommand,
                            mark: "rect",
                            width: 600,
                            height: 200,
                            mark: "area",
                            transform: [],
                            encoding: {
                                x: { timeUnit: "yearmonth", field: extractedHeaders[1] },
                                y: { aggregate: "sum", field: extractedHeaders[0] },
                                color: { field: extractedHeaders[2] }
                            },
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                        }

                    }
                } else {
                    chartObj.errMsg = "Could not create graph. Expected dates attribute" + extractedHeaders.length
                }
            } else {
                chartObj.errMsg = "Could not create graph. Expected 3 headers. Got " + extractedHeaders.length
            }
            break;
        case "normalizedLineArea":
            if (extractedHeaders.length == 3) {
                hasTime = checkTimeAndReorder(extractedHeaders, data)
                reorderForLineArea(extractedHeaders, data)
                if (hasTime) {
                    chartObj.charts = {
                        data: { table: data },
                        spec: {
                            title: actualCommand,
                            mark: "rect",
                            width: 600,
                            height: 200,
                            mark: "area",
                            transform: [],
                            encoding: {
                                x: { timeUnit: "yearmonth", field: extractedHeaders[1] },
                                y: {
                                    aggregate: "sum",
                                    field: extractedHeaders[0],
                                    axis: null,
                                    stack: "normalize"
                                },
                                color: { field: extractedHeaders[2] }
                            },
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                        }

                    }
                } else {
                    chartObj.errMsg = "Could not create graph. Expected dates attribute" + extractedHeaders.length
                }
            } else {
                chartObj.errMsg = "Could not create graph. Expected 3 headers. Got " + extractedHeaders.length
            }
            break;
        case "stackedBar":
            if (extractedHeaders.length == 3) {
                hasTime = checkTimeAndReorder(extractedHeaders, data)
                reorderForLineArea(extractedHeaders, data)
                if (hasTime) {
                    chartObj.charts = {
                        data: { table: data },
                        spec: {
                            title: actualCommand,
                            mark: { type: "bar", cornerRadiusTopLeft: 3, cornerRadiusTopRight: 3 },
                            width: 600,
                            height: 200,
                            transform: [],
                            encoding: {
                                x: { timeUnit: "yearmonth", field: extractedHeaders[1] },
                                y: {
                                    aggregate: "sum",
                                    field: extractedHeaders[0]
                                },
                                color: { field: extractedHeaders[2] }
                            },
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                        }

                    }
                } else {
                    chartObj.errMsg = "Could not create graph. Expected dates attribute" + extractedHeaders.length
                }
            } else {
                chartObj.errMsg = "Could not create graph. Expected 3 headers. Got " + extractedHeaders.length
            }
            break;
        case "normalizedStackedBar":
            if (extractedHeaders.length == 3) {
                hasTime = checkTimeAndReorder(extractedHeaders, data)
                reorderForLineArea(extractedHeaders, data)
                if (hasTime) {
                    chartObj.charts = {
                        data: { table: data },
                        spec: {
                            title: actualCommand,
                            mark: { type: "bar", cornerRadiusTopLeft: 3, cornerRadiusTopRight: 3 },
                            width: 600,
                            height: 200,
                            transform: [],
                            encoding: {
                                x: { timeUnit: "yearmonth", field: extractedHeaders[1] },
                                y: {
                                    aggregate: "sum",
                                    field: extractedHeaders[0],
                                    axis: null,
                                    stack: "normalize"
                                },
                                color: { field: extractedHeaders[2] }
                            },
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                        }

                    }
                } else {
                    chartObj.errMsg = "Could not create graph. Expected dates attribute" + extractedHeaders.length
                }
            } else {
                chartObj.errMsg = "Could not create graph. Expected 3 headers. Got " + extractedHeaders.length
            }
            break;
        case "candleStick":
            if (extractedHeaders.length == 5) {
                hasTime = checkTimeAndReorder(extractedHeaders, data)
                reorderForCandleStick(extractedHeaders, data)
                if (hasTime) {
                    chartObj.charts = {
                        data: { table: data },
                        spec: {
                            title: actualCommand,
                            width: 1200,
                            transform: [],
                            encoding: {
                                x: {
                                    field: extractedHeaders[0],
                                    type: "temporal",
                                    format: "%m/%d",
                                    axis: {
                                        labelAngle: -45
                                    }
                                },
                                y: {
                                    type: "quantitative",
                                    scale: { zero: false }
                                },
                                color: {
                                    condition: {
                                        test: "datum.open < datum.close",
                                        value: "#06982d"
                                    },
                                    value: "#ae1325"
                                }
                            },
                            layer: [
                                {
                                    mark: "rule",
                                    encoding: {
                                        y: { field: extractedHeaders[1] }, //low
                                        y2: { field: extractedHeaders[2] } //high
                                    }
                                },
                                {
                                    mark: "bar",
                                    encoding: {
                                        y: { field: extractedHeaders[3] }, //open
                                        y2: { field: extractedHeaders[4] } //close
                                    }
                                }
                            ],
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                        }

                    }
                } else {
                    chartObj.errMsg = "Could not create graph. Expected dates attribute"
                }
            } else {
                chartObj.errMsg = "Could not create graph. Expected 3 headers. Got " + extractedHeaders.length
            }
            break;
        case "parallelCoordinates":
            if (extractedHeaders.length >2 ) {
                let folds = reorderForParallel(extractedHeaders, data)
                chartObj.charts = {
                    data: { table: data },
                    spec: {
                        title: actualCommand,
                        mark: { type: "bar", cornerRadiusTopLeft: 3, cornerRadiusTopRight: 3 },
                        width: 1200,
                        transform: [
                            { window: [{ op: "count", as: "index" }] },
                            { fold: folds }
                        ],
                        mark: "line",
                        encoding: {
                            color: { type: "nominal", field: extractedHeaders[0] },
                            detail: { type: "nominal", field: "index" },
                            opacity: { value: 0.3 },
                            x: { type: "nominal", field: "key" },
                            y: { type: "quantitative", field: "value" }
                        },

                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            } 
            break;

        default:
            chartObj.errMsg = "Could not specify graph."
    }
    if (chartObj.errMsg === "" && chartObj.charts !== null) {
        filterSpecs(command, extractedHeaders, data, filteredHeaders, chartObj)

    }
    return chartObj;
}

function reorderForParallel(extractedHeaders, data) {
    let folds = []
    for(let i = 0; i < extractedHeaders.length; i++) {
        if(findType(extractedHeaders[i], data) === "nominal") {
            let tmpHeader = extractedHeaders[0]
            extractedHeaders[0] = extractedHeaders[i]
            extractedHeaders[i] = tmpHeader
        }
    }

    for(let i = 1; i < extractedHeaders.length; i++) {
        folds.push(extractedHeaders[i])
    }
    return  folds;
}


function reorderForCandleStick(extractedHeaders, data) {
    for (let i = 0; i < extractedHeaders.length; i++) {
        if (findType(extractedHeaders[i], data) === "temporal") {
            let tmpHeader = extractedHeaders[0]
            extractedHeaders[0] = extractedHeaders[i]
            extractedHeaders[i] = tmpHeader;
        }
        if (extractedHeaders[i].includes("low")) {
            let tmpHeader = extractedHeaders[1]
            extractedHeaders[1] = extractedHeaders[i]
            extractedHeaders[i] = tmpHeader;
        }
        if (extractedHeaders[i].includes("high")) {
            let tmpHeader = extractedHeaders[2]
            extractedHeaders[2] = extractedHeaders[i]
            extractedHeaders[i] = tmpHeader;
        }
        if (extractedHeaders[i].includes("open")) {
            let tmpHeader = extractedHeaders[3]
            extractedHeaders[3] = extractedHeaders[i]
            extractedHeaders[i] = tmpHeader;
        }
        if (extractedHeaders[i].includes("close")) {
            let tmpHeader = extractedHeaders[4]
            extractedHeaders[4] = extractedHeaders[i]
            extractedHeaders[i] = tmpHeader;
        }
    }
}

function reorderForLineArea(extractedHeaders, data) {
    for (let i = 0; i < extractedHeaders.length; i++) {
        if (findType(extractedHeaders[i], data) === "quantitative") {
            let tmpHeader = extractedHeaders[0]
            extractedHeaders[0] = extractedHeaders[i]
            extractedHeaders[i] = tmpHeader;
        }
    }
    for (let i = 0; i < extractedHeaders.length; i++) {
        if (findType(extractedHeaders[i], data) === "temporal") {
            let tmpHeader = extractedHeaders[1]
            extractedHeaders[1] = extractedHeaders[i]
            extractedHeaders[i] = tmpHeader;
        }
    }
    return extractedHeaders
}

function reorderHeaders(extractedHeaders, data) {
    if (findType(extractedHeaders[1], data) === "quantitative") {
        let tmpHeader = extractedHeaders[0];
        extractedHeaders[0] = extractedHeaders[1];
        extractedHeaders[1] = tmpHeader
    }
    return extractedHeaders
}

function reorderTwoHeadersForRelationship(extractedHeaders, data) {
    if (findType(extractedHeaders[1], data) === "quantitative") {
        let tmpHeader = extractedHeaders[0];
        extractedHeaders[0] = extractedHeaders[1];
        extractedHeaders[1] = tmpHeader
    }
    return extractedHeaders
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
    console.log(extractedHeaders.length, 'fjnwfnlkwe')

    if (extractedHeaders.length == 2) {
        if (findType(extractedHeaders[1], data) === "nominal") {
            let tmpHeader = extractedHeaders[1];
            extractedHeaders[1] = extractedHeaders[0];
            extractedHeaders[0] = tmpHeader
        }
    } else if (extractedHeaders.length === 3) {

        if (findType(extractedHeaders[1], data) === "quantitative") {

            let tmpHeader = extractedHeaders[0];
            extractedHeaders[0] = extractedHeaders[1];
            extractedHeaders[1] = tmpHeader
        }
        if (findType(extractedHeaders[2], data) === "quantitative") {

            let tmpHeader = extractedHeaders[0];
            extractedHeaders[0] = extractedHeaders[2];
            extractedHeaders[2] = tmpHeader
        }
        let lowestCategories = 0;
        if (countCategories(extractedHeaders[1], data) > countCategories(extractedHeaders[2], data)) {
            let tmpHeader = extractedHeaders[2]
            extractedHeaders[2] = extractedHeaders[1]
            extractedHeaders[1] = tmpHeader
        }

    }
    return extractedHeaders;

}

function reoderTwoHeadersForComposition(extractedHeaders, data) {
    if (findType(extractedHeaders[1], data) === 'quantitative') {
        let tmpHeader = extractedHeaders[0]
        extractedHeaders[0] = extractedHeaders[1]
        extractedHeaders[1] = tmpHeader
    }
    return extractedHeaders
}

function checkTimeAndReorderComposition(extractedHeaders, data) {
    for (let i = 0; i < extractedHeaders.length; i++) {
        let lowerCaseHeader = extractedHeaders[i].toLowerCase();
        if (lowerCaseHeader.includes("year") || lowerCaseHeader.includes("month")
            || lowerCaseHeader.includes("date") || lowerCaseHeader.includes("day")
            || lowerCaseHeader.includes("time") || lowerCaseHeader.includes("hour")
            || lowerCaseHeader.includes("second")) {
            let tmpHeader = extractedHeaders[0]
            extractedHeaders[0] = extractedHeaders[i];
            extractedHeaders[i] = tmpHeader
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
    let lowerCaseHeader = header.toLowerCase()
    if (lowerCaseHeader.includes('date')
        || lowerCaseHeader.includes('year') || lowerCaseHeader.includes('month')
        || lowerCaseHeader.includes('day') || lowerCaseHeader.includes('months')
        || lowerCaseHeader.includes('dates')) {
        return "temporal"
    } else if (isNaN(data[1][header])) {
        return "nominal"
    } else {
        return "quantitative"
    }
}

function extractHeaders(command, headers, filteredHeaders, data) {

    let doc = nlp(command)
    let extractedHeaders = []

    for (let i = 0; i < headers.length; i++) {
        if (doc.has(headers[i].toLowerCase())) {
            console.log(headers[i])
            extractedHeaders.push(headers[i])
        }
    }
    let accessors = []
    let keys = Object.keys(filteredHeaders);
    for (let i = 0; i < keys.length; i++) {
        let found = false;
        if (filteredHeaders[keys[i]].length > 0 ) {
            for (let n = 0; n < extractedHeaders.length; n++) {
                if (extractedHeaders[n] === keys[i]) {
                    found = true
                }
            }
            if (!found) {
                extractedHeaders.push(keys[i])
            }
        }

    }

    if (doc.has("overtime") || doc.has("time")) {
        let foundTime = false
        for (let i = 0; i < extractedHeaders.length; i++) {
            if (findType(extractedHeaders[i], data) === "temporal") {
                foundTime = true
                break
            }
        }
        if (!foundTime) {
            for (let i = 0; i < headers.length; i++) {
                if (findType(headers[i], data) === "temporal") {
                    extractedHeaders.push(headers[i])
                    break;
                }
            }
        }
    }
    return extractedHeaders;
}

function extractFilteredHeaders(command, headerMatrix, data, headers, command) {
    let doc = nlp(command)
    let extractedFilteredHeaders = []
    let foundTimeHeader = false
    for (let i = 0; i < headerMatrix.length; i++) {
        extractedFilteredHeaders[headerMatrix[i][0]] = []
        for (let n = 1; n < headerMatrix[i].length; n++) {
            if (doc.has(headerMatrix[i][n])) {
                extractedFilteredHeaders[headerMatrix[i][0]].push(headerMatrix[i][n])
            }

        }

        if (findType(headerMatrix[i][0], data) === "temporal" && !foundTimeHeader) {
            const { foundTime, timeHeader } = extractHeadersWithoutFilter(doc, headers, data, command)
            if (!foundTime) {
                findDates(doc, extractedFilteredHeaders[headerMatrix[i][0]])
                command += " " + headerMatrix[i][0]
                foundTimeHeader = true;

            } else {
                if (timeHeader === headerMatrix[i][0]) {
                    findDates(doc, extractedFilteredHeaders[headerMatrix[i][0]])

                }


            }


        }

    }

    function findDates(docCommand, header) {
        if (docCommand.match("to") || docCommand.match("through") || docCommand.match("and")) {
            let termsBefore = docCommand.before('to').terms().out('array')
            let termsAfter = docCommand.after('to').terms().out('array')
            const yearBefore = termsBefore[termsBefore.length - 1]
            const yearAfter = termsAfter[0]
            if (!isNaN(yearBefore) && !isNaN(yearAfter)) {
                header.push(yearBefore)
                header.push(yearAfter)

            }

        }
    }

    function extractHeadersWithoutFilter(docCommand, headers, data) {
        let extractedHeaders = []
        let foundTime = false
        let index;
        for (let i = 0; i < headers.length; i++) {

            if (docCommand.has(headers[i]) && findType(headers[i], data) === "temporal") {
                index = i;
                foundTime = true
                break;
            }
        }
        let timeHeader = headers[index]
        return { foundTime, timeHeader }
    }
    console.log(extractedFilteredHeaders)
    return extractedFilteredHeaders;
}



function createRandomColors(extractedHeader, data) {
    const numCategories = countCategories(extractedHeader, data)
    let colors = [];

    for (let i = 0; i < numCategories; i++) {
        colors.push("#" + Math.floor(Math.random() * 16777215).toString(16))
    }
    return colors
}

/* 
Function used to calculate the number of unique words for a category.
This is used to infer what to parse in the comparison branch
 
Args:
    Extracted headers -> keyword attributes extracted from the command
    Data: Actual data from data set
 
Returns: 
    Vector length of unique words from every attribute header
*/
function countCategories(extractedHeeader, data) {
    const unique = [...new Set(data.map(item => item[extractedHeeader]))];
    return unique.length
}

/* 
Function used to calculate the number of unique words for a category.
This is used to infer what to parse in the comparison branch. 
 
Args:
    Extracted headers -> keyword attributes extracted from the command
    Data: Actual data from data set
 
Returns: 
    Returns layer specification for comparison branch to use to crete multiple
*/
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
            let tmpHeader = extractedHeaders[1]
            extractedHeaders[1] = extractedHeaders[i];
            extractedHeaders[i] = tmpHeader
            reorderForTimeAgain(extractedHeaders, data)
            return true
        } else if (findType(extractedHeaders[i], data) === "temporal") {
            let tmpHeader = extractedHeaders[1]
            extractedHeaders[1] = extractedHeaders[i];
            extractedHeaders[i] = tmpHeader
            reorderForTimeAgain(extractedHeaders, data)

            return true
        }
    }


    return false

}

function reorderForTimeAgain(extractedHeaders, data) {
    if (extractedHeaders.length === 2) {
        if (findType(extractedHeaders[1], data) === "temporal") {
            let tmpHeader = extractedHeaders[0]
            extractedHeaders[0] = extractedHeaders[1]
            extractedHeaders[1] = tmpHeader
        }
    } else if (extractedHeaders.length === 3) {
        if (findType(extractedHeaders[1], data) === "quantitative") {
            let tmpHeader = extractedHeaders[0]
            extractedHeaders[0] = extractedHeaders[1]
            extractedHeaders[1] = tmpHeader
        }
        if (findType(extractedHeaders[2], data) === "quantitative") {
            let tmpHeader = extractedHeaders[0]
            extractedHeaders[0] = extractedHeaders[2]
            extractedHeaders[2] = tmpHeader
        }
        if (findType(extractedHeaders[2], data) === "temporal") {
            let tmpHeader = extractedHeaders[1]
            extractedHeaders[1] = extractedHeaders[2]
            extractedHeaders[2] = tmpHeader
        }
    }


    return extractedHeaders
}

function filterSpecs(command, extractedHeaders, data, filteredHeaders, chartObj) {
    let accessors = []
    let keys = Object.keys(filteredHeaders);
    for (let i = 0; i < keys.length; i++) {
        if (filteredHeaders[keys[i]].length > 0) {
            if (findType(keys[i], data) === "nominal") {
                chartObj.charts.spec.transform.push({
                    filter: { field: keys[i], oneOf: filteredHeaders[keys[i]] }
                })
            } else if (findType(keys[i], data) === "temporal") {
                chartObj.charts.spec.transform.push({
                    filter: { timeUnit: 'year', field: keys[i], range: [filteredHeaders[keys[i]][0], filteredHeaders[keys[i]][1]] }
                })
            }
        }
    }
}



//Waterfall chart is too specific to make
// case "waterfall":
//             if (extractedHeaders.length == 2) {
//                 hasTime = checkTimeAndReorder(extractedHeaders, data)
//                 reorderForLineArea(extractedHeaders, data)
//                 if (hasTime) {
//                     chartObj.charts = {
//                         data: { table: data },
//                         spec: {
//                             title: actualCommand,
//                             width: 800,
//                             height: 450,
//                             layer: [
//                               {
//                                 mark: {type: "bar", size: 45},
//                                 encoding: {
//                                   x: {
//                                     field: extractedHeaders[1],
//                                     type: "ordinal",
//                                     sort: null,
//                                     axis: {labelAngle: 0}
//                                   },
//                                   y: {
//                                     field: "previous_sum",
//                                     type: "quantitative",
//                                     title: "Amount"
//                                   },
//                                   y2: {field: "sum"}
//                                 }
//                               },
//                               {
//                                 mark: {
//                                   type: "rule",
//                                   color: "#404040",
//                                   opacity: 1,
//                                   strokeWidth: 2,
//                                   xOffset: -22.5,
//                                   x2Offset: 22.5
//                                 },
//                                 encoding: {
//                                     x: {
//                                     field: extractedHeaders[1],
//                                     type: "ordinal",
//                                     sort: null
//                                   },
//                                   x2: {field: "lead"},
//                                   y: {field: "sum", "type": "quantitative"}
//                                 }
//                               },
//                               {
//                                 mark: {type: "text", dy: -4, baseline: "bottom"},
//                                 encoding: {
//                                   x: {
//                                     field: "label",
//                                     type: "ordinal",
//                                     sort: null
//                                   },
//                                   y: {field: "sum_inc", type: "quantitative"},
//                                   text: {field: "sum_inc", type: "nominal"}
//                                 }
//                               },
//                               {
//                                 mark: {type: "text", dy: 4, baseline: "top"},
//                                 encoding: {
//                                   x: {
//                                     field: "label",
//                                     type: "ordinal",
//                                     sort: null
//                                   },
//                                   y: {field: "sum_dec", type: "quantitative"},
//                                   text: {field: "sum_dec", type: "nominal"}
//                                 }
//                               },
//                               {
//                                 mark: {type: "text", fontWeight: "bold", baseline: "middle"},
//                                 encoding: {
//                                   x: {
//                                     field: extractedHeaders[1],
//                                     type: "ordinal",
//                                     sort: null
//                                   },
//                                   y: {field: "center", type: "quantitative"},
//                                   text: {field: "text_amount", type: "nominal"}
//                                 }
//                               }
//                             ],
//                             config: {text: {fontWeight: "bold", color: "#404040"}},
//                             transform: [
//                               {window: [{op: "sum", field: extractedHeaders[0], "as": "sum"}]},
//                               {window: [{op: "lead", field: extractedHeaders[1], as: "lead"}]},
//                               {
//                                 calculate: "datum.lead === null ? datum.label : datum.lead",
//                                 as: "lead"
//                               },
//                               {
//                                 calculate: "datum.label === 'End' ? 0 : datum.sum - datum.amount",
//                                 as: "previous_sum"
//                               },
//                               {
//                                 calculate: "datum.label === 'End' ? datum.sum : datum.amount",
//                                 as: "amount"
//                               },
//                               {
//                                 calculate: "(datum.label !== 'Begin' && datum.label !== 'End' && datum.amount > 0 ? '+' : '') + datum.amount",
//                                 as: "text_amount"
//                               },
//                               {calculate: "(datum.sum + datum.previous_sum) / 2", "as": "center"},
//                               {
//                                 calculate: "datum.sum < datum.previous_sum ? datum.sum : ''",
//                                 as: "sum_dec"
//                               },
//                               {
//                                 calculate: "datum.sum > datum.previous_sum ? datum.sum : ''",
//                                 as: "sum_inc"
//                               }
//                             ],
//                             data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
//                         }

//                     }
//                 } else {
//                     chartObj.errMsg = "Could not create graph. Expected dates attribute" + extractedHeaders.length
//                 }
//             } else {
//                 chartObj.errMsg = "Could not create graph. Expected 3 headers. Got " + extractedHeaders.length
//             }
//             break;