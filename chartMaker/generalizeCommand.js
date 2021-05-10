const nlp = require('compromise')
const createVector = require('./createVector')
nlp.extend(require('compromise-numbers'))
nlp.extend(require('compromise-dates'))
var thesaurus = require("thesaurus");
const findType = require('./findType')

module.exports = (command, attributes, data) => {
    let doc = nlp(command)
    let catchSynonymCommand = nlp(command);
    const {featureMatrix, synonymMatrix} = createMatrixForAll(attributes, data)
    for(let i = 0; i < attributes.length; i++) {
        if(doc.match(attributes[i])) {
            doc.replace(attributes[i], findType(attributes[i], data))
        }
    }
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
                catchSynonymCommand.replace(synonymMatrix[i][n], synonymMatrix[i][0])
            }
        }
    }

    generalizedCommand = doc.text()
    synonymCommand = catchSynonymCommand.text()
    return {generalizedCommand, synonymCommand}
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
        if(headers[i].match(/\W/g)){
            let words = headers[i].split(/\W/g)
            for(let i = 0; i < words.length; i++){
                let doc = nlp(words[i])
                if(doc.has('#Noun')){
                    synonyms.push(thesaurus.find(words[i]))
                    synonyms.push(words[i])
                }
            }

        }
        synonyms.push(thesaurus.find(headers[i].toLowerCase()))
        synonyms = synonyms.flat()

        // for(let j = 1; j < synonyms.length; j++) {
        //     console.log(synonyms[j], headers[i].toLowerCase())
        //     if(synonyms[j] == headers[i].toLowerCase()) {
        //         synonyms = synonyms.splice(j, 1)
        //     }
        // }
        // console.log(synonyms)

        synonymMatrix.push(synonyms)

    }

    for(let i = 0; i < synonymMatrix.length; i++) {
        for(let j = 1; j < synonymMatrix[i].length; j++) {
            for(let n = 0; n <  headers.length; n++) {
                if(synonymMatrix[i][j] === headers[n].toLowerCase()) {
                    // console.log(synonymMatrix[i][j], headers[n].toLowerCase())
                    // console.log(synonymMatrix[i].splice(j, 1), i , j)

                    synonymMatrix[i].splice(j, 1)
                }
            }
        }
    }
    
    // for(let i = 0; i < synonymMatrix.length; i++) {
        
    // }
    // console.log(synonymMatrix)
    return {featureMatrix, synonymMatrix}
}
