module.exports = (chartObj, intent) => {
    switch (intent) {
        case "bar":
            chartObj.charts.spec.mark = "bar"
            return chartObj;
        case "line":
            chartObj.charts.spec.mark = "line"
            return chartObj
        case "scatter":
            chartObj.charts.spec.mark = "scatter"
            return chartObj
        case "pie":
            chartObj.charts.spec.mark = "pie"
            return chartObj
        // case "marginalHistogram":
        //     chartObj.charts.spec.mark = "pie"
        //     return chartObj
        case "heatmap":
            chartObj.charts.spec.mark = "rect"
            return chartObj
        case "lineArea":
            chartObj.charts.spec.mark = "area"
            return chartObj
        case "stackedBar":
            chartObj.charts.spec.mark = "bar"
            return chartObj
        case "normalizedStackedBar":
            chartObj.charts.spec.mark = "bar"
            return chartObj
        // case "candleStick":
        //     chartObj.charts.spec.mark = "bar"
        //     return chartObj
        // case "parallelCoordinates":
        //     chartObj.charts.spec.mark = "bar"
        //     return chartObj


    }
    return chartObj
}