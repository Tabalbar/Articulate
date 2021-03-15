
const nlp = require('compromise')
module.exports = (intent, command, headers, dataHead) => {
    switch(intent){
        case "comparison":

        case "relationship":
            const extractedHeaders = extractHeaders(command, headers)
            if(extractedHeaders.length == 2) {
                const spec = {
                    width: 200,
                    height: 200,
                    mark: 'bar',
                    encoding: {
                      x: { field: 'a', type: findType(extractedHeaders, data) },
                      y: { field: 'b', type: findType(extractedHeaders, data)},
                    },
                    data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
                  }
            }
 
        case "distribution":
        case "composition":
        default: return ''
    }
}  

function findType(header, data) {

}

function extractHeaders(command, headers) {
    let doc = nlp(command)
    let extractedHeaders = []
    for(let i = 0; i < headers.length; i ++){
        if(doc.has(headers[i])){
            extractedHeaders.push(headers[i])
        }
    }
    return extractedHeaders;
}