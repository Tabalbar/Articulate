import React from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import { VegaLite } from 'react-vega'
import "./style.css"
 
class DraggableGraph extends React.Component {
 
  eventLogger = (e, data) => {
    console.log('Event: ', e);
    console.log('Data: ', data);
  };
 
  render() {
    return (
        <Draggable
        handle=".handle"
        defaultPosition={{x: 0, y: 0}}
        position={null}
        grid={[1, 1]}
        scale={1}
        onStart={this.handleStart}
        onDrag={this.handleDrag}
        onStop={this.handleStop}>
        <div className="Charts" style={{ width: this.props.spec.width + 170, height: this.props.spec.height + 150}}>
          <VegaLite className="handle" spec={this.props.spec} data={{ table: this.props.data }} />

        </div>
      </Draggable>
    );
  }
}

export default DraggableGraph