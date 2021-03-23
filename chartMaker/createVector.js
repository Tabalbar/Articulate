const nlp = require('compromise')

module.exports = (headers, data) => {
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
        }
    }
    return featureMatrix
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