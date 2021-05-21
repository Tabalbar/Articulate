
const nlp = require('compromise')
const findType = require('./findType')
const findMissing = require('./findMissing').findMissing
const title = require('./specifications/title')
const size = require('./specifications/size')
const mark = require('./specifications/mark')
const encoding = require('./specifications/encoding')
const transform = require('./specifications/transform')
const plotlyPipeline = require('./plotly/plotlyPipeline')

module.exports = {
    chartMaker: function chartMaker(intent, command, headers, data, headerMatrix, actualCommand, headerFreq) {
        let filteredHeaders = extractFilteredHeaders(command, headerMatrix, data, headers, command)
        let extractedHeaders = extractHeaders(command, headers, data)
        let normalize = checkNormalize(command)

        const headerKeys = Object.keys(headerFreq)
        for (let i = 0; i < headerKeys.length; i++) {
            for (let j = 0; j < headerFreq[headerKeys[i]].length; j++) {
                if (headerFreq[headerKeys[i]][j].count >= 5) {
                    extractedHeaders.push(headerFreq[headerKeys[i]][j].header)
                }
            }
        }
        let charts = []

        let chartObj = {
            plotly: false,
            charts: {
                spec: {
                    title: "",
                    width: 0,
                    height: 0,
                    mark: "",
                    transform: [],
                    concat: [],
                    encoding: {
                        column: {},
                        y: {},
                        x: {},
                        color: {}
                    },
                    data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array

                }
            },
            extraCharts: [],
            errMsg: ''
        };
        let sizeGraph = 'medium'
        if (intent == 'radar') {
            return plotlyPipeline(actualCommand, extractedHeaders, filteredHeaders, data, headerFreq, command)
        }
        chartObj = title(chartObj, actualCommand)
        chartObj = size(chartObj, sizeGraph)
        chartObj, layerMark = mark(chartObj, intent, extractedHeaders)
        chartObj = encoding(chartObj, intent, extractedHeaders, data, headerFreq, command, normalize)
        chartObj = transform(data, filteredHeaders, chartObj)
        charts.push(chartObj)
        return chartObj
    }
}

function checkNormalize(command) {
    const doc = nlp(command)
    if (doc.has("normalized") || doc.has("normalize")) {
        return true
    } else {
        return false
    }
}




function reorderForParallel(extractedHeaders, data) {
    let folds = []
    for (let i = 0; i < extractedHeaders.length; i++) {
        if (findType(extractedHeaders[i], data) === "nominal") {
            let tmpHeader = extractedHeaders[0]
            extractedHeaders[0] = extractedHeaders[i]
            extractedHeaders[i] = tmpHeader
        }
    }

    for (let i = 1; i < extractedHeaders.length; i++) {
        folds.push(extractedHeaders[i])
    }
    return folds;
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

function extractHeaders(command, headers, data) {

    let doc = nlp(command)
    let extractedHeaders = []

    for (let i = 0; i < headers.length; i++) {
        if (doc.has(headers[i].toLowerCase())) {
            extractedHeaders.push(headers[i])
        }
    }
    let accessors = []
    // let keys = Object.keys(filteredHeaders);
    // for (let i = 0; i < keys.length; i++) {
    //     let found = false;
    //     if (filteredHeaders[keys[i]].length > 0 ) {
    //         for (let n = 0; n < extractedHeaders.length; n++) {
    //             if (extractedHeaders[n] === keys[i]) {
    //                 found = true
    //             }
    //         }
    //         if (!found) {
    //             extractedHeaders.push(keys[i])
    //         }
    //     }

    // }

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