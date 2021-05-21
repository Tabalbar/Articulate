const nlp = require("compromise")
const chartOptions = require('./chartOptions')
module.exports = (command) => {
    let doc = nlp(command)
    for (let i = 0; i < chartOptions.length; i++) {
        console.log(chartOptions[i].key)
        console.log(command)
        if (doc.has(chartOptions[i].key)) {

            return chartOptions[i].mark
        }
    }
    return false

}