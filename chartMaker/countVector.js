const nlp = require('compromise')

//returns two vectors
//1 for the attribute headers and 1 for the filtered headers
module.exports = (transcript, headerMatrix) => {
    let headers = []
    let filters = []

    let headerFreq = []
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
    console.log(doc.nouns().out('array'))


    return {headerFreq, filterFreq}
}
