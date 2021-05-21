import React from 'react'
import StreamGraph from './StreamGraph'
import WordCloud from './WordCloud'

function AdminMenu({
    overHearingData,
    attributes,
    synonymAttributes, 
    featureAttributes,
    frequencyData,

}) {
    return (
        <>
            <div style={{ position: 'absolute' }}>

                <StreamGraph
                    overHearingData={overHearingData}
                    attributes={attributes}
                    synonymAttributes={synonymAttributes}
                    featureAttributes={featureAttributes}
                />
                <WordCloud
                    overHearingData={overHearingData}
                    attributes={attributes}
                    synonymAttributes={synonymAttributes}
                    featureAttributes={featureAttributes}
                />
                {
                    frequencyData.length > 1 ?
                        frequencyData.map(i => {
                            return (
                                <>
                                    <p><strong>Header:</strong> {i.header}</p>
                                    <p><strong>count:</strong> {i.count}</p>
                                </>
                            )
                        })
                        :
                        null
                }
            </div>
        </>
    )
}

export default AdminMenu