const nlp = require("compromise")
const chartOptions = require('./chartOptions')
module.exports = (command) => {


    for (let i = 0; i < chartOptions.length; i++) {
        if (command.includes(chartOptions[i].key)) {
            return chartOptions[i].mark
        }
    }
    return false

}