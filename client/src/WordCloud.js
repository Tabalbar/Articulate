import React, { useState, useEffect } from 'react'
import ReactWordCloud from 'react-wordcloud'
import nlp from 'compromise'

function WordCloud({
    overHearingData,
    attributes,
    synonymAttributes,
    featureAttributes
}) {

    const [words, setWords] = useState([])
    const [nounsLength, setNounsLength] = useState(0)

    useEffect(() => {
        let tmpWords = []
        for (let i = 0; i < attributes.length; i++) {
            tmpWords.push({ text: attributes[i], value: 0 })
        }
        setWords(tmpWords)
    }, [attributes])

    useEffect(() => {
        if (words.length > 0) {
            let doc = nlp(overHearingData)
            let nouns = doc.nouns().out('array')
            console.log(nouns)

            setNounsLength(nouns.length)
            let tmpWords = words
            if (nouns.length > nounsLength) {
                let lastTerm = nouns[nouns.length - 1]
                for (let i = 0; i < synonymAttributes.length; i++) {
                    for (let j = 0; j < synonymAttributes[i].length; j++) {
                        if (lastTerm.toLowerCase().includes(synonymAttributes[i][j])) {
                            tmpWords[i].value += 1
                        }
                    }
                }
                for (let i = 0; i < featureAttributes.length; i++) {
                    for (let j = 0; j < featureAttributes[i].length; j++) {
                        if (lastTerm.toLowerCase().includes(featureAttributes[i][j])) {
                            tmpWords[i].value += 1
                        }
                    }
                }
            }
            setWords(tmpWords)
        }
    }, [overHearingData])

    const options = {
        enableTooltip: true,
        deterministic: true,
        rotations: 0
    }
    return (
        <>
            <ReactWordCloud words={words} />
        </>
    )
}

export default WordCloud