import React, { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Input, Header, Checkbox } from 'semantic-ui-react'
import { VegaLite } from 'react-vega'
import MaterialTable from 'material-table'
import XLSX from 'xlsx'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import UseVoice from './UseVoice';
import DraggableGraph from './DraggableGraph';
import InputBar from './InputBar';
import StreamGraph from './StreamGraph'

function App() {

  //data used for charts and table
  const [data, setData] = useState([])
  const [dataHeaders, setDataHeaders] = useState([])
  const [charts, setCharts] = useState([])
  const [command, setCommand] = useState('')
  const [dataHead, setDataHead] = useState([])
  const [attributes, setAttributes] = useState([])
  const [errMsg, setErrMsg] = useState('')
  const [selected, setSelected] = useState(false)

  const [overHearingData, setOverHearingData] = useState('')

  const processData = async (data) => {
    const dataStringLines = data.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);

    const list = [];
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
      if (headers && row.length == headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] == '"')
              d = d.substring(1, d.length - 1);
            if (d[d.length - 1] == '"')
              d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }

        // remove the blank rows
        if (Object.values(obj).filter(x => x).length > 0) {
          list.push(obj);
        }
      }
    };
    let tmpHeaders = []
    for (let i = 0; i < headers.length; i++) {
      let obj = { title: headers[i], field: headers[i] }
      tmpHeaders.push(obj)
    }
    setData(list)
    setDataHeaders(tmpHeaders)
    setAttributes(headers)
    let tmpDataHead = []
    for (let i = 0; i < 100; i++) {
      tmpDataHead.push(list[i])
    }
    setDataHead(tmpDataHead)
    const response = await fetch('http://localhost:5000/addHeaders', {
      method: 'POST',

      body: JSON.stringify({ headers: headers }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  const loadData = (e) => {
    e.preventDefault()
    const file = e.target.files[0]
    if (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        // Use reader.result
        const bstr = e.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        /* Get first worksheet */
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        /* Convert array of arrays */
        const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
        processData(data)
      }
      reader.readAsBinaryString(file);

    }
  }
  const handleChange = (e) => {
    e.preventDefault()
    setErrMsg('')
    const value = e.target.value;
    setCommand(value)
  }

  const createCharts = async () => {
    await fetch('http://localhost:5000/addHeaders', {
      method: 'POST',

      body: JSON.stringify({ headers: attributes }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    let prevChart = false
    if(selected===true){
      prevChart = charts[charts.length-1]
    }

    const response = await fetch('http://localhost:5000/', {
      method: 'POST',
      body: JSON.stringify({ command: command, attributes: attributes, dataHead: dataHead, prevChart: prevChart, overHearingData: overHearingData  }),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const body = await response.text();
    setErrMsg("")
    const { chartObj } = JSON.parse(body)
    let count = 0;
    let tmpText = ""
    for(let i = 0; i < chartObj.length; i++) {
      if (chartObj[i].errMsg === '' && chartObj[i].charts !== null) {
        setCharts(prev => [chartObj[i].charts, ...prev])
        count++
      } else {  
        setErrMsg(prev => prev +  chartObj[i].errMsg + "\n")
        tmpText += chartObj[i].errMsg
      }
    }
    setErrMsg(prev => prev + "Returned " + count + " charts")
    tmpText += "Returned " + count + " chart(s)"
    UseVoice(tmpText)
  }
  const createChartWithVoice = async (transcript) => {
    await fetch('http://localhost:5000/addHeaders', {
      method: 'POST',

      body: JSON.stringify({ headers: attributes }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    let prevChart = false
    if(selected===true){
      prevChart = charts[charts.length-1]
    }

    const response = await fetch('http://localhost:5000/', {
      method: 'POST',
      body: JSON.stringify({ command: transcript, attributes: attributes, dataHead: dataHead, prevChart: prevChart, overHearingData: overHearingData }),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const body = await response.text();
    setErrMsg("")
    const { chartObj } = JSON.parse(body)
    let count = 0;
    let tmpText = ""
    for(let i = 0; i < chartObj.length; i++) {
      if (chartObj[i].errMsg === '' && chartObj[i].charts !== null) {
        setCharts(prev => [chartObj[i].charts, ...prev])
        count++
      } else {  
        setErrMsg(prev => prev +  chartObj[i].errMsg + "\n")
        tmpText += chartObj[i].errMsg
      }
    }
    setErrMsg(prev => prev + "Returned " + count + " charts")
    tmpText += "Returned " + count + " chart(s)"
    
    let utterance = UseVoice(tmpText)
    return utterance
  }


  const clearGraphs = () => {
    setCharts([])
    setErrMsg("")
    setSelected(false);
  }

  const handleSelect = (e) => {
    setSelected(prev=>!prev)
  }

  return (
    <>
      <br />
      <StreamGraph
        overHearingData={overHearingData}
        attributes={attributes}
      />
      <Grid centered={true}>
      <Grid.Row>
        </Grid.Row>
        <Dictaphone
          createChartWithVoice={createChartWithVoice}
          setOverHearingData={setOverHearingData}
        />
        <Grid.Row>

          <Input type='file' onChange={loadData} />
        </Grid.Row>
        <Grid.Row>
          <Header as="h3" color="blue">{errMsg}</Header>
        </Grid.Row>
        {/* <Checkbox label="Iterate on Graph" checked={selected} onChange={handleSelect}/> */}


      </Grid>

    <InputBar
      createCharts={createCharts}
      handleChange={handleChange}
      dataHeaders={dataHeaders}
      data={data}
      clearGraphs={clearGraphs}
    />
    <div style={{position: "absolute"}}>
      {
            charts.length ?
              charts.map((element, index) => {
                return (
                  <>
                      <DraggableGraph
                        spec={element.spec}
                        data={data}

                        
                      />
                  </>
                )
              })
              :
              null
          }
</div>
    </>
  );
}

export default App;

const Dictaphone = ({
  createChartWithVoice,
  setOverHearingData
}) => {

  const [listening, setListening] = useState(false)

  let commands = [
    {
      command: "computer *",
      callback: (command) => {
        console.log('listening')
        let utterance = createChartWithVoice(command, transcript)
        utterance.onend = function(event) {
          console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
          setListening(true)
        }
      }
    },
    {
      command: "computer",
      callback: () => {
        let utterance = UseVoice("At your service")
        utterance.onend = function(event) {

          console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
          setTimeout(() => {
            setListening(true)
            console.log('listening')
          }, 2500)


        }
      }
    },
    {
      command: "computer are you there?",
      callback: () => {
        let utterance = UseVoice("Yes, how can i help you?")
        utterance.onend = function(event) {
          console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
          setListening(true)
        }
      }
    }
  ]



  useEffect(() => {
    if(listening) {
      const timer = setTimeout(() => {
        setListening(false)
        console.log('not listening')
      }, 10000)
      return () => {
        clearTimeout(timer)
      }
    }

  }, [listening])

  // if(listening) {
  //   // console.log('listening')
  //   commands = [
  //     {
  //       command: "*",
  //       callback: (command) => {
  //         let commandUtterance = createChartWithVoice(command)
  //         console.log(command)
  //         setListening(true)
  //         commandUtterance.onend = function(event) {
  //           console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
  //         }
  //       }
  //     }
  //   ]
  // }

  const { transcript, resetTranscript } = useSpeechRecognition({ commands})

  useEffect(() => {
    setOverHearingData(transcript)
  },[transcript])

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return null
  } else {
    SpeechRecognition.startListening({ continuous: true })

  }

  return (
    <div>
      <button onClick={SpeechRecognition.startListening}>Start</button>
      <button onClick={()=>{
        SpeechRecognition.stopListening();
        createChartWithVoice(transcript);
        }}>Create Visualization</button>
      <p>{transcript}</p>
    </div>
  )
}