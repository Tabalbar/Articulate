const nlp = require("compromise")

module.exports = (command) => {

    const chartOptions = [
        {
            key: "bar",
            mark: "bar"
        },
        {
            key: "line",
            mark: "line"
        },        {
            key: "scatter",
            mark: "scatter"
        },        {
            key: "pie",
            mark: "pie"
        },        {
            key: "histogram",
            mark: "bar"
        },        {
            key: "heat map",
            mark: "heatmap"
        },        {
            key: "area",
            mark: "lineArea"
        },        {
            key: "normalized area",
            mark: "normalizedLineArea"
        },        {
            key: "stacked bar",
            mark: "stackedBar"
        },        {
            key: "normalized stacked bar",
            mark: "normalizedStackedBar"
        },        {
            key: "candle stick",
            mark: "candleStick"
        },        {
            key: "parallel coordinates",
            mark: "parallelCoordinates"
        },
    ]

    for(let i = 0; i < chartOptions.length; i++) {
        if(command.includes(chartOptions[i].key)){
            console.log(command, chartOptions[i].key)
            return chartOptions[i].mark
        }
    }
    return false

}