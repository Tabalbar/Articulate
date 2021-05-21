import React from 'react'
import StreamGraph from './StreamGraph'
import WordCloud from './WordCloud'
import { Button, Icon } from 'semantic-ui-react'

function AdminMenu({
    overHearingData,
    attributes,
    synonymAttributes,
    featureAttributes,
    frequencyData,
    setShowAdminMenu
}) {
    return (
        <>
            {/* <Button onClick={() => setShowAdminMenu(prev => !prev)} icon color="red"><Icon name="bars" /></Button> */}
            {/* <div style={{ position: 'absolute', background: 'white', width: 400 }}> */}

            <div style={{ position: 'absolute'}}>

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
                                    <p><strong>Header:</strong> {i.header} <strong>count:</strong> {i.count}</p>
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