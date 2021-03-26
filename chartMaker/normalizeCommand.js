const nlp = require('compromise')
const { NetworkAuthenticationRequire } = require('http-errors')
const lemmatize = require('wink-lemmatizer')

module.exports = (command) => {
    let doc = nlp(command)
    
    doc.nouns().toSingular()
    console.log(doc.nouns().out('array'))
    // console.log(newCommand.length)
    // newCommand.forEach(noun=>{
    //     console.log(noun.text())
    //     return lemmatize.noun(noun.text())
    // })
    // console.log(newCommand.text(), 'lololo')
    console.log(doc.text())
    return doc.text()
}