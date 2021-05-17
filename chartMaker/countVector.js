const nlp = require('compromise')
const findType = require('./findType')

//returns two vectors
//1 for the attribute headers and 1 for the filtered headers
module.exports = (transcript, headerMatrix, synonymAttributes, data) => {
    let headers = []
    let tmpSynonymAttributes = synonymAttributes
    let synonymsAndFeatures = []
    for(let i = 0; i < tmpSynonymAttributes.length; i++) {
        tmpSynonymAttributes[i].splice(0, 1)
    }
    for(let i = 0; i < headerMatrix.length; i++) {
        synonymsAndFeatures.push(headerMatrix[i].concat(tmpSynonymAttributes[i]))
    }
    let headerFreq = {
        nominal: [],
        quantitative: [],
        temporal: []
    }
    let wordCount = []
    let filterFreq = []
    transcript = "what is the marning of composition when students get high composition scores what are the composition of the composition where the composition lands"
    let doc = nlp(transcript)   

    doc.toLowerCase()
    doc.nouns().toSingular()

    const nouns = doc.nouns().out('array')
    for(let i = 0; i < synonymsAndFeatures.length; i++) {
        wordCount.push({header: synonymsAndFeatures[i][0], count: 0})
    }

    if(nouns.length > 2) {
        const numDelete = nouns.length-2
        nouns.splice(0,numDelete)
    }

    for(let i = 0; i < nouns.length; i ++) {
        for(let j = 0; j < synonymsAndFeatures.length; j++) {
            for(let n = 0; n < synonymsAndFeatures[j].length; n++) {
                if(synonymsAndFeatures[j][n].includes(nouns[i])){
                    wordCount[j].count += 1
                }
            }
        }
    }
    for(let i = 0; i < wordCount.length; i++) {
        headerFreq[findType(wordCount[i].header, data)].push(wordCount[i])
    }
    return {headerFreq}
}


