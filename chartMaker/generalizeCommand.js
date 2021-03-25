const nlp = require('compromise')
const createVector = require('./createVector')
nlp.extend(require('compromise-numbers'))

module.exports = (command, attributes, data) => {
    let doc = nlp(command)

    const filteredHeaders = createMatrixForAll(attributes, data)
    console.log(filteredHeaders[0][0])
    for (let i = 0; i < filteredHeaders.length; i++) {
        for (let n = 0; n < filteredHeaders[i].length; n++) {
            if (doc.match(filteredHeaders[i][n])) {
                doc.replace(filteredHeaders[i][n], findType(filteredHeaders[i][0], data))
            }
        }
    }
    doc.numbers().replaceWith("quantitative")
    console.log(doc.text())
    return doc.text()
}


function findType(header, data) {
    if (data[0][header].includes('/') || data[0][header].includes('-') ||
        data[0][header].includes(':')) {
        return "temporal"
    } else if (isNaN(data[0][header])) {
        return "nominal"
    } else {
        return "quantitative"
    }
}

let featureMatrix = [];

function createMatrixForAll(headers, data){
    let featureMatrix = [];

    for (let i = 0; i < headers.length; i++) {
        let isNominal = false;
        if (findType(headers[i], data) === "nominal") {
            var flags = [], output = [headers[i]], l = data.length, n;
            for (n = 0; n < l; n++) {
                if (flags[data[n][headers[i]]]) continue;
                flags[data[n][headers[i]]] = true;
                output.push(data[n][headers[i]]);
            }
            featureMatrix.push(output)
        } else {
            var output = [headers[i]]
            featureMatrix.push(output)
        }
    }
    return featureMatrix
}
