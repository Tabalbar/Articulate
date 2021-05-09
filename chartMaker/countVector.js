const nlp = require('compromise')

//returns two vectors
//1 for the attribute headers and 1 for the filtered headers
module.exports = (transcript, headerMatrix, data) => {
    let headers = []
    let filters = []

    let headerFreq = {
        nominal: [],
        quantitative: [],
        temporal: []
    }
    let wordCount = []
    let filterFreq = []

    for(let i = 0; i < headerMatrix.length; i ++){
        headers.push(headerMatrix[i][0])
        for(let j = 1; j < headerMatrix[i].length; j++){
            filters.push(headerMatrix[i][j])
        }
    }
    transcript = "what students get high math scores how many students are there math is a very important subject I wonder what math is for students computer show me a graph of what students eat"
    let doc = nlp(transcript)   

    doc.toLowerCase()
    doc.nouns().toSingular()

    const nouns = doc.nouns().out('array')
    for(let i = 0; i < headers.length; i++) {
        wordCount.push({header: headers[i], count: 0})
    }

    for(let i = 0; i < nouns.length; i ++) {
        for(let j = 0; j < wordCount.length; j++) {
            if(wordCount[j].header.includes(nouns[i])){
                wordCount[j].count +=1
            }
        }
    }

    for(let i = 0; i < wordCount.length; i++) {
        headerFreq[findType(wordCount[i].header, data)].push(wordCount[i])
    }
    return {headerFreq, filterFreq}
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
