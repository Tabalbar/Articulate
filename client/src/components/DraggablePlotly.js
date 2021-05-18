import React from 'react';
import Draggable from 'react-draggable';
import { VegaLite } from 'react-vega'
import "../style.css"
import Plot from 'react-plotly.js';

import { Menu } from 'semantic-ui-react'

class DraggablePlotly extends React.Component {
    constructor(props) {
        super(props);
        // Don't call this.setState() here!
        this.state = { z_index: 0, data: [] };
        this.handleClick = this.handleClick.bind(this);
    }

    eventLogger = (e, data) => {
        console.log('Event: ', e);
        console.log('Data: ', data);
    };
    handleClick = () => {
        this.setState({ z_index: 0 })
        this.setState({ z_index: 1 })
    }
    componentDidMount() {
        let tmpState = this.state
        let tmpData = this.props.data
        tmpData.sort((a, b) => (Date.parse(a[this.props.chart.data[0].theta]) > Date.parse(b[this.props.chart.data[0].theta])) ? 1 : -1)
        console.log(Date.parse(tmpData[0][this.props.chart.data[0].theta]))
        tmpState.data = tmpData
        this.setState({tmpState})
    }

    render() {

        return (
            <>
                <Draggable
                    handle=".handle"
                    defaultPosition={{ x: 400, y: 150 }}
                    position={null}
                    grid={[1, 1]}
                    scale={1}
                    onStart={this.handleStart}
                    onDrag={this.handleDrag}
                    onStop={this.handleStop}>
                    <div className="Charts" onClick={this.handleClick} style={{ zIndex: this.state.z_index, width: 500, height: 500 }}>
                        <div className="handle">
                            <Menu size="mini" color="black" inverted >
                                <Menu.Item
                                    icon="x"
                                    color="red"
                                    inverted
                                    onClick={() => { }}
                                    position="right"
                                />
                            </Menu>
                        </div>
                        <Plot
                            data={[
                                {
                                    r: extractData(this.state.data, this.props.chart.data[0].r, false),
                                    theta: extractData(this.state.data, this.props.chart.data[0].theta, true),
                                    type: 'scatterpolar',
                                    fill: 'toself'
                                },
                            ]}
                            layout={{
                                width: 400, height: 400, polar: {
                                    radialaxis: {
                                        visible: true,
                                        range: getMinAndMax(this.state.data, this.props.chart.data[0].theta)
                                    }
                                }
                            }}
                        />

                    </div>
                </Draggable>

            </>
        );
    }
}

export default DraggablePlotly

function extractData(data, extractedHeader) {
    let tmpData = []

    for(let i = 0; i < data.length; i ++) {
        let possibleDate = new Date(data[i][extractedHeader])

        if(!isNaN(possibleDate)) {
            tmpData.push(possibleDate)
        } else {
            tmpData.push(data[i][extractedHeader])
        }

    }
    return tmpData
}

function getMinAndMax(data, extractedHeader) {
    let tmpData = []

    for(let i = 0; i < data.length; i ++) {
        tmpData.push(data[i][extractedHeader])
    }
    return [Math.min(tmpData), Math.max(tmpData)]
}