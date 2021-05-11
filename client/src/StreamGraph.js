import React, {useState, useEffect} from 'react'
import { VegaLite } from 'react-vega'
import nlp from 'compromise'
import { scaleTypeSupportDataType } from 'vega-lite/build/src/scale'

const StreamGraph = ({
    overHearingData,
    attributes
}) => {

    const [streamData, setStreamData] = useState([])
    const [update, setUpdate] = useState(false)
    const specification = {
        width: 300,
        height: 300,
        mark: "bar",
        encoding: {
            x: {
                timeUnit: "seconds",
                field: "date",
                axis: {domain: false, tickSize: 0}
            },
            y: {
                aggregate: "sum",
                field: "count",
                axis: null,
                stack: "center"
            },
            color: {field: "header", scale: {scheme: "category20b"}}
        },
        data: {name: 'table'}
    }

    useEffect(() => {
        let id = setTimeout(() => {
            updateStream(attributes)
            setUpdate(prev => !prev)
        },5000)
        return () => {
            clearTimeout(id)
        }
    },[update])


    const updateStream = (attributes) => {
        overHearingData = "what students get high math scores how many students are there math is a very important subject I wonder what math is for students computer show me a graph of what students eat for lunch"

        let wordCount = []
        let doc = nlp(overHearingData)
        doc.toLowerCase()
        doc.nouns().toSingular()
        const nouns = doc.nouns().out('array')

        for(let i = 0; i < attributes.length; i++){
            wordCount.push({header: attributes[i], count: 0, date: new Date()})
        }
        console.log(attributes)
        console.log(wordCount)

        for(let i = 0; i < nouns.length; i++) {
            for(let j = 0; j < wordCount.length; j++) {
                if(wordCount[j].header.includes(nouns[i])) {
                    wordCount[j].count +=1
                }
            }
        }

        setStreamData(prev => prev, wordCount)

    };

    return (
        <>
            <VegaLite spec={specification} data={{table: streamData}} />
        </>
    )
}

export default StreamGraph