import React from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import { VegaLite } from 'react-vega'
import "./style.css"
import { Menu } from 'semantic-ui-react'

class DraggableGraph extends React.Component {
    constructor(props) {
        super(props);
        // Don't call this.setState() here!
        this.state = { z_index: 0 };
        this.handleClick = this.handleClick.bind(this);
    }

    eventLogger = (e, data) => {
        console.log('Event: ', e);
        console.log('Data: ', data);
    };
    handleClick = () => {
        this.setState({z_index:0})
        this.setState({z_index: 1})
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
                    <div className="Charts" onClick={this.handleClick} style={{zIndex: this.state.z_index, width: this.props.spec.width + 170, height: this.props.spec.height + 150 }}>
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
                        <VegaLite spec={this.props.spec} data={{ table: this.props.data }} />

                    </div>
                </Draggable>

            </>
        );
    }
}

export default DraggableGraph