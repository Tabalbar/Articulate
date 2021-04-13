const nlp = require('compromise')
const { NetworkAuthenticationRequire } = require('http-errors')
const lemmatize = require('wink-lemmatizer')

module.exports = (command) => {
    let doc = nlp(command)
    
    let newCommand = doc.nouns().toSingular()
    // let newCommand = doc.text()
    // console.log(newCommand.length)
    // newCommand.forEach(noun=>{
    //     console.log(noun.text())
    //     return lemmatize.noun(noun.text())
    // })
    // console.log(newCommand.text(), 'lololo')
    return doc.text()
}