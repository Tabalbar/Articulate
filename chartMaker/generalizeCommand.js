const nlp = require('compromise')
const createVector = require('./createVector')
nlp.extend(require('compromise-numbers'))
nlp.extend(require('compromise-dates'))
var thesaurus = require("thesaurus");


module.exports = (command, attributes, data) => {
    let doc = nlp(command)
    let catchSynonymCommand = nlp(command);
    const {featureMatrix, synonymMatrix} = createMatrixForAll(attributes, data)
    for (let i = 0; i < featureMatrix.length; i++) {
        for (let n = 0; n < featureMatrix[i].length; n++) {
            if (doc.match(featureMatrix[i][n])) {
                doc.replace(featureMatrix[i][n], findType(featureMatrix[i][0], data))
            }
        }
    }
    doc.numbers().replaceWith("quantitative")
    doc.dates().replaceWith("temporal")
    for(let i = 0; i < synonymMatrix.length; i++){
        for(let n = 0; n < synonymMatrix[i].length; n++){
            if(catchSynonymCommand.text().includes(synonymMatrix[i][n].toLowerCase())){
                console.log(synonymMatrix[i][n], synonymMatrix[i][0].toLowerCase(), 'here')
                catchSynonymCommand.replace(synonymMatrix[i][n], synonymMatrix[i][0])
            }
        }
    }
    generalizedCommand = doc.text()
    synonymCommand = catchSynonymCommand.text()
    console.log(synonymCommand)
    return {generalizedCommand, synonymCommand}
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
    let synonymMatrix = [];
    for (let i = 0; i < headers.length; i++) {
        synonyms = [headers[i]]
        if (findType(headers[i], data) === "nominal") {
            var flags = [], output = [headers[i]], l = data.length, n;
            for (n = 0; n < l; n++) {
                if (flags[data[n][headers[i]]]) continue;
                flags[data[n][headers[i]]] = true;
                output.push(data[n][headers[i]]);
                output.push(thesaurus.find(data[n][headers[i]]))
                output = output.flat()
            }
            featureMatrix.push(output)
        } else {
            var output = [headers[i]]
            featureMatrix.push(output)
        }

        // console.log(headers[i].split(/\W/g))
        // if(headers[i].match(/\W/g)){
        //     let words = headers[i].split(/\W/g)
        //     for(let i = 0; i < words.length; i++){
        //         let doc = nlp(words[i])
        //         if(doc.has('#Noun')){
        //             console.log(doc.text())
        //             synonyms.push(thesaurus.find(words[i]))
        //             synonyms.push(words[i])
        //         }
        //     }

        // }
        synonyms.push(thesaurus.find(headers[i].toLowerCase()))
        // console.log(synonyms)
        synonyms = synonyms.flat()
        synonymMatrix.push(synonyms)

    }

    // console.log(featureMatrix)
    return {featureMatrix, synonymMatrix}
}
