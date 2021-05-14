import React, { useState, useEffect } from 'react'
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
        width: 150,
        height: 150,
        mark: "area",
        encoding: {
            x: {
                timeUnit: "seconds",
                field: "date",
                axis: { domain: false, tickSize: 0 }
            },
            y: {
                aggregate: "sum",
                field: "count",
                axis: null,
                stack: "center"
            },
            color: { field: "header" }
        },
        data: { name: 'table' }
    }

    useEffect(() => {
        let id = setTimeout(() => {
            updateStream(attributes)
            setUpdate(prev => !prev)
        }, 2000)
        return () => {
            clearTimeout(id)
        }
    }, [update])


    const updateStream = (attributes) => {

        let wordCount = []
        let doc = nlp(overHearingData)
        doc.toLowerCase()
        doc.nouns().toSingular()
        const nouns = doc.nouns().out('array')

        for (let i = 0; i < attributes.length; i++) {
            wordCount.push({ header: attributes[i], count: 0, date: new Date() })
        }

        for (let i = 0; i < nouns.length; i++) {
            for (let j = 0; j < wordCount.length; j++) {
                if (wordCount[j].header.toLowerCase().includes(nouns[i])) {
                    wordCount[j].count += 1
                }
            }
        }
        let tmpStreamData = [...streamData, wordCount]
        if (tmpStreamData.length > 8) {
            let numDelete = tmpStreamData.length - 8
            tmpStreamData.splice(0, numDelete)
        }
        console.log(tmpStreamData.flat())

        setStreamData(tmpStreamData.flat())

    };

    return (
        <>
            <div style={{ position: 'absolute' }}>
                <VegaLite spec={specification} data={{ table: streamData }} />
            </div>
        </>
    )
}

export default StreamGraph