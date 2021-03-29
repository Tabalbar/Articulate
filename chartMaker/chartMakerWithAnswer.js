
const nlp = require('compromise')
module.exports = (intent, command, headers, data, headerMatrix, actualCommand) => {
    let filteredHeaders = extractFilteredHeaders(command, headerMatrix, data, headers, command)
    let extractedHeaders = extractHeaders(command, headers, filteredHeaders)
    console.log(command, extractedHeaders)
    let chartObj = {
        charts: null,
        errMsg: ''
    };
    let hasTime = false;
    switch (intent) {
        case "comparison":
            hasTime = checkTimeAndReorder(extractedHeaders, data);
            if (hasTime) {
                let numCategories = countCategories(extractedHeaders[1], data)
                if (extractedHeaders.length === 2) {
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
                } else if (extractedHeaders.length === 3) {
                    extractedHeaders = reorderForTimeAgain(extractedHeaders, data)

                    if (numCategories > 3) {
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
                                    y: { field: extractedHeaders[1], type: 'quantitative' },
                                    color: { field: extractedHeaders[2], type: "nominal" }
                                },
                                data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                            }
                        }
                    } else {
                        chartObj.charts = {
                            data: { table: data },
                            spec: {
                                title: actualCommand,
                                width: { step: 50 },
                                mark: "bar",
                                transform: [],
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
                                        scale: { range: createRandomColors(extractedHeaders[0], data) }
                                    }
                                },
                                data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array

                            }

                        }
                    }
                } else {
                    chartObj.errMsg = "Could not create specification. Expected headers = 2 or 3, got " + extractedHeaders.length

                }
            } else {
                extracteHeaders = reorderHeadersForCategories(extractedHeaders, data)

                if (extractedHeaders.length === 2) {
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
                                    scale: { range: createRandomColors(extractedHeaders[0], data) }
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
                    chartObj.errMsg = "Could not create specification. Expected headers >= 2, got " + extractedHeaders.length
                }
            }
            if (chartObj.errMsg === "") {
                filterSpecs(command, extractedHeaders, data, filteredHeaders, chartObj)

            }
            return chartObj
        case "relationship":
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
                            color: { field: extractedHeaders[2], type: "nominal" },
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            } else if (extractedHeaders.length === 4) {
                extracteHeaders = reorderFourHeadersForRelationship(extractedHeaders, data)
                //Need to reoder extracted headers for quantiative data, should put lowest number of categories on axis?
                chartObj.charts = {
                    data: { table: data },
                    spec: {
                        title: actualCommand,
                        width: 200,
                        height: 200,
                        mark: 'point',
                        transform: [],
                        encoding: {
                            x: { field: extractedHeaders[0], type: 'quantitative' },
                            y: { field: extractedHeaders[1], type: 'quantitative' },
                            color: { field: extractedHeaders[2], type: "nominal" },
                            size: { field: extractedHeaders[3], type: 'quantitative' }
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            } else {
                chartObj.errMsg = "Could not create specification. Expected headers 2, 3, or 4, got " + extractedHeaders.length
            }
            if (chartObj.errMsg === "") {
                filterSpecs(command, extractedHeaders, data, filteredHeaders, chartObj)

            }
            return chartObj;

        case "distribution":
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
                chartObj.charts = {
                    data: { table: data },
                    spec: {
                        title: actualCommand,
                        mark: "point",
                        transform: [],
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
                chartObj.charts = {
                    data: { table: data },
                    spec: {
                        title: actualCommand,
                        projection: { type: { expr: "projection" } },
                        mark: "circle",
                        width: 500,
                        height: 200,
                        transform: [],
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
                            size: { value: 10 },
                            color: { field: extractedHeaders[0], type: "nominal" }
                        },
                        data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                    }
                }
            } else {
                chartObj.errMsg = "Could not create specification. Expected headers 1, 2, or 3, got " + extractedHeaders.length

            }
            if (chartObj.errMsg === "") {
                filterSpecs(command, extractedHeaders, data, filteredHeaders, chartObj)

            }
            return chartObj
        case "composition":
            hasTime = checkTimeAndReorderComposition(extractedHeaders, data);
            if (hasTime) {
                if (extractedHeaders.length === 2) {
                    chartObj.charts = {
                        data: { table: data },
                        spec: {
                            title: actualCommand,
                            mark: "bar",
                            transform: [],
                            encoding: {
                                x: {
                                    field: extractedHeaders[0],
                                    type: "ordinal",
                                },
                                y: { aggregate: "count", type: "quantitative" },
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
                } else {
                    chartObj.errMsg = "Could not create specification. Expected headers = 2 got " + extractedHeaders.length

                }

            } else {
                if (extractedHeaders.length === 2) {
                    extractedHeaders = reoderTwoHeadersForComposition(extractedHeaders, data)
                    chartObj.charts = {
                        data: { table: data },
                        spec: {
                            title: actualCommand,
                            mark: "arc",
                            transform: [],
                            encoding: {
                                theta: { field: extractedHeaders[0], "type": "quantitative" },
                                color: { field: extractedHeaders[1], "type": "nominal" }
                            },
                            view: { stroke: null },
                            data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                        }
                    }
                } else {
                    chartObj.errMsg = "Could not create specification. Expected headers = 2, got " + extractedHeaders.length

                }
            }
            if (chartObj.errMsg === "") {
                filterSpecs(command, extractedHeaders, data, filteredHeaders, chartObj)

            }
            return chartObj
        default: return ''
    }
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
    header = header.toLowerCase()
    if (header.includes('date')
        || header.includes('year') || header.includes('month')
        || header.includes('day') || header.includes('months')
        || header.includes('dates')) {
        return "temporal"
    } else if (isNaN(data[0][header])) {
        return "nominal"
    } else {
        return "quantitative"
    }
}

function extractHeaders(command, headers, filteredHeaders) {
    let doc = nlp(command)
    let extractedHeaders = []
    for (let i = 0; i < headers.length; i++) {
        if (doc.has(headers[i])) {
            extractedHeaders.push(headers[i])
        }
    }
    let accessors = []
    let keys = Object.keys(filteredHeaders);
    for (let i = 0; i < keys.length; i++) {
        let found = false;
        if (filteredHeaders[keys[i]].length > 0) {
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
            console.log(headerMatrix[i][0])
            const { foundTime, timeHeader } = extractHeadersWithoutFilter(doc, headers, data, command)
            if (!foundTime) {

                //todo: ******* find a way to add the accessor to extractedFilteredHeaders array before adding the filters



                findDates(doc, extractedFilteredHeaders[headerMatrix[i][0]])
                command += " " + headerMatrix[i][0]
                foundTimeHeader = true;
                console.log(timeHeader, headerMatrix[i][0])
                console.log(foundTime)
                // findDates(doc, extractedFilteredHeaders["State"])
            } else {
                console.log(foundTime)

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
        console.log(headers)
        for (let i = 0; i < headers.length; i++) {

            if(docCommand.has(headers[i]) && findType(headers[i], data) === "temporal"){
                index = i;
                foundTime=true
                break;
            }
        }
        let timeHeader = headers[index]
        console.log(timeHeader)
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
Function used to calculate the number of unique words for a category

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
Args:
    Extracted headers -> keyword attributes extracted from the command
    Data: Actual data from data set

Returns: 
    Vector length of unique words from every attribute header
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

function reorderForTimeAgain(extractedHeaders, data) {
    if (findType(extractedHeaders[2], data) === "quantitative") {
        let tmpHeader = extractedHeaders[1]
        extractedHeaders[1] = extractedHeaders[2]
        extractedHeaders[2] = tmpHeader
    } else if(findType(extractedHeaders[0], data) === "quantitative") {
        let tmpHeader = extractedHeaders[1]
        extractedHeaders[1] = extractedHeaders[0]
        extractedHeaders[0] = tmpHeader
    }
    if(findType(extractedHeaders[2], data) === "temporal"){
        let tmpHeader = extractedHeaders[0]
        extractedHeaders[0] = extractedHeaders[2]
        extractedHeaders[2] = tmpHeader
    } else if(findType(extractedHeaders[1], data) === "temporal"){
        let tmpHeader = extractedHeaders[0]
        extractedHeaders[0] = extractedHeaders[1]
        extractedHeaders[1] = tmpHeader
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
    // for( let i = 0; i < filteredHeaders.length;i++){
    //     let found = false;
    //     for(let n = 0; n < filteredHeaders.length; n++){
    //         if(filteredHeaders[n] === keys[0]){
    //             found = true
    //         }
    //     }
    //     if(!found){
    //         accessors.push(keys[0])
    //     }
    // }
    // for(let i = 0; i < accessors.length; i++){
    //     if(findType(accessors[i], data) === "nominal"){
    //         chartObj.charts.spec.transform.push({filter: {field: accessors[i], equal: filteredHeaders[i][accessors[i]]}})
    //     }
    // }
    // for(let i = 0; i < uniqueHeaders.length; i++){
    //     let found = false;
    //     for(let n = 0; n < extractedHeaders.length; n++){
    //         if(extractedHeaders[i] === uniqueHeaders[n]){
    //             found = true
    //         }
    //     }
    //     if(!found){
    //         extraData.push(uniqueHeaders[i])
    //     }

    // }

    // console.log(filteredHeaders[0])
}

// function extractDataForOne(extractedHeaders, data) {
//     let chartData = [];
//     for (let i = 0; i < data.length; i++) {
//         chartData.push({
//             [extractedHeaders[0]]: data[i][extractedHeaders[0]]
//         })
//     }
//     return chartData
// }

// function extractDataForTwo(extractedHeaders, data) {
//     let chartData = []
//     for (let i = 0; i < data.length; i++) {
//         chartData.push({
//             [extractedHeaders[0]]: data[i][extractedHeaders[0]], [extractedHeaders[1]]: data[i][extractedHeaders[1]]
//         })
//     }
//     return chartData
// }

// function extractDataForAll(extractedHeaders, data) {
//     let chartData = []
//     for (let i = 0; i < data.length; i++) {
//         chartData.push({
//             [extractedHeaders[0]]: data[i][extractedHeaders[0]]
//         })
//     }
//     for (let i = 0; i < data.length; i++) {
//         for (let n = 1; n < extractedHeaders.length; n++) {
//             chartData[i][extractedHeaders[n]] = data[i][extractedHeaders[n]]
//         }

//     }
//     return chartData;

// }

// function extractDataForThree(extractedHeaders, data) {
//     let chartData = []
//     for (let i = 0; i < data.length; i++) {
//         chartData.push({
//             [extractedHeaders[0]]: data[i][extractedHeaders[0]], [extractedHeaders[1]]: data[i][extractedHeaders[1]], [extractedHeaders[2]]: data[i][extractedHeaders[2]],
//         })
//     }
//     return chartData
// }