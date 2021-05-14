const findType = require("../findType")

module.exports = (chartObj, extractedHeaders, data) => {
    for (let i = 0; 0 < extractedHeaders.length; i++) {
        if (findType(extractedHeaders[0], data) == "nominal") {
            chartObj.charts.spec.encoding.theta = { aggregate: "count" }
            chartObj.charts.spec.encoding.color = { field: extractedHeaders[i], type: findType(extractedHeaders[i], data) }
            return chartObj

        }
    }

}