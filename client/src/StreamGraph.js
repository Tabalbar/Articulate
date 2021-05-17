import React, { useState, useEffect } from 'react'
import { VegaLite } from 'react-vega'
import nlp from 'compromise'
import { Form } from 'semantic-ui-react'

const StreamGraph = ({
    overHearingData,
    attributes,
    synonymAttributes,
    featureAttributes
}) => {

    const [streamData, setStreamData] = useState([])
    const [update, setUpdate] = useState(false)
    const [nounsLength, setNounsLength] = useState(0)

    const [overHearingText, setOverHearingText] = useState("")
    const [overHearing, setOverHearing] = useState('')

    const specification = {
        width: 150,
        height: 150,
        mark: "area",
        encoding: {
            x: {
                // timeUnit: "seconds",
                field: "date",
                axis: null
            },
            y: {
                aggregate: "sum",
                field: "count",
                // axis: null,
                stack: "center"
            },
            color: { field: "header" }
        },
        data: { name: 'table' }
    }

    useEffect(() => {
        let tmpStreamData = []
        for (let i = 0; i < attributes.length; i++) {
            tmpStreamData.push({ header: attributes[i], count: 0, date: new Date() })
        }
        setStreamData(tmpStreamData)
    }, [attributes])

    useEffect(() => {
        let doc = nlp(overHearingData)
        let nouns = doc.nouns().out('array')
        setNounsLength(nouns.length)
        let tmpStreamData = streamData
        if (nouns.length > nounsLength) {
            let lastTerm = nouns[nouns.length - 1]
            for (let i = 0; i < synonymAttributes.length; i++) {
                for (let j = 0; j < synonymAttributes[i].length; j++) {
                    if (lastTerm.toLowerCase().includes(synonymAttributes[i][j])) {
                        tmpStreamData.push({
                            header: synonymAttributes[i][0],
                            count: 1,
                            date: new Date()
                        })
                    }
                }
            }
            for (let i = 0; i < featureAttributes.length; i++) {
                for (let j = 0; j < featureAttributes[i].length; j++) {
                    if (lastTerm.toLowerCase().includes(featureAttributes[i][j])) {
                        tmpStreamData.push({
                            header: featureAttributes[i][0],
                            count: 1,
                            date: new Date()
                        })
                        console.log(lastTerm, featureAttributes[i][j])

                    }
                }
            }
        }
        setStreamData(tmpStreamData.flat())
    }, [overHearingData])

    return (
        <>
            {/* <Form onSubmit={() => setOverHearing(overHearingText)}>
                <input type="text" onChange={(e) => setOverHearingText(e.target.value)}></input>
            </Form> */}
            <VegaLite spec={specification} data={{ table: streamData }} />
        </>
    )
}

export default StreamGraph