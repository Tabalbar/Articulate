const findType = require("../findType")
const findMissing = require("../findMissing").findMissing

module.exports = (chartObj, extractedHeaders, data, headerFreq, command) => {
    let folds = reorderForParallel(extractedHeaders, data)
    chartObj.charts = {
        data: { table: data },
        spec: {
            title: actualCommand,
            mark: { type: "bar", cornerRadiusTopLeft: 3, cornerRadiusTopRight: 3 },
            width: 1200,
            height: 200,
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
    return chartObj
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