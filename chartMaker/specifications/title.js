module.exports = (chartObj, actualCommand) => {
    chartObj.charts['spec'] = actualCommand
    return chartObj
}