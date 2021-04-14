import React, { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Input, Header, Checkbox } from 'semantic-ui-react'
import { VegaLite } from 'react-vega'
import MaterialTable from 'material-table'
import XLSX from 'xlsx'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

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

  const laodData = (e) => {
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
      body: JSON.stringify({ command: command, attributes: attributes, dataHead: dataHead, prevChart: prevChart }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const body = await response.text();
    setErrMsg("")
    const { chartObj } = JSON.parse(body)
    let count = 0;
    for(let i = 0; i < chartObj.length; i++) {
      if (chartObj[i].errMsg === '' && chartObj[i].charts !== null) {
        setCharts(prev => [chartObj[i].charts, ...prev])
        count++
      } else {  
        setErrMsg(prev => prev +  chartObj[i].errMsg + ".\n")
      }
    }
    setErrMsg(prev => prev + "Returned " + count + " chart(s)")
    // console.log(responseObj.charts)
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
      body: JSON.stringify({ command: transcript, attributes: attributes, dataHead: dataHead, prevChart: prevChart }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const body = await response.text();
    setErrMsg("")
    const { chartObj } = JSON.parse(body)
    let count = 0;
    for(let i = 0; i < chartObj.length; i++) {
      if (chartObj[i].errMsg === '' && chartObj[i].charts !== null) {
        setCharts(prev => [chartObj[i].charts, ...prev])
        count++
      } else {  
        setErrMsg(prev => prev +  chartObj[i].errMsg + "\n")
      }
    }
    setErrMsg(prev => prev + "Returned " + count + " charts")


    // console.log(responseObj.charts)
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
      <Grid centered={true}>
      <Grid.Row>
          <MaterialTable columns={dataHeaders} data={data} title='' />
        </Grid.Row>
        <Grid.Row>
          <Form onSubmit={createCharts}>
            <Input placeholder={'...Enter query Here'} onChange={handleChange} size="large" style={{ width: 500, fontWeight: 50 }} />

          </Form>
          <Button size="large" onClick={createCharts}>Create Visualization</Button>
        </Grid.Row>
        <Dictaphone
          createChartWithVoice={createChartWithVoice}
        />
        <Grid.Row>

          <Input type='file' onChange={laodData} />
          <Button onClick={clearGraphs}>Clear Graphs</Button>
        </Grid.Row>
        <Grid.Row>
          <Header as="h3" color="blue">{errMsg}</Header>
        </Grid.Row>
        <Checkbox label="Iterate on Graph" checked={selected} onChange={handleSelect}/>
          {
            charts.length ?
              charts.map((element, index) => {
                return (
                  <>
                    <Grid.Row>
                      <VegaLite spec={element.spec} data={{ table: data }} />
                    </Grid.Row>
                  </>
                )
              })
              :
              null
          }

      </Grid>

    </>
  );
}

export default App;

const Dictaphone = ({
  createChartWithVoice
}) => {
  const { transcript, resetTranscript } = useSpeechRecognition()

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return null
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