import React, { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Input, Header, Checkbox, Container } from 'semantic-ui-react'
import { VegaLite } from 'react-vega'
import MaterialTable from 'material-table'
import XLSX from 'xlsx'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import UseVoice from './UseVoice';
import DraggableGraph from './DraggableGraph';
import InputBar from './InputBar';
import StreamGraph from './StreamGraph'
import { noCharts } from './AssistantReplies'
import WordCloud from './WordCloud'
import Plot from 'react-plotly.js';

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
  const [prevChart, setPrevChart] = useState([])

  const [overHearingData, setOverHearingData] = useState('')
  const [synonymAttributes, setSynonymAttributes] = useState([])
  const [featureAttributes, setFeatureAttributes] = useState([])

  const [overHearingText, setOverHearingText] = useState("")

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

      body: JSON.stringify({ headers: headers, data: tmpDataHead }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const body = await response.text()
    const { synonymMatrix, featureMatrix } = JSON.parse(body)
    setSynonymAttributes(synonymMatrix)
    setFeatureAttributes(featureMatrix)
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

    const response = await fetch('http://localhost:5000/', {
      method: 'POST',
      body: JSON.stringify(
        {
          command: command,
          attributes: attributes,
          dataHead: dataHead,
          prevChart: prevChart,
          overHearingData: overHearingData,
          synonymAttributes: synonymAttributes,
          featureAttributes: featureAttributes
        }),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const body = await response.text();
    setErrMsg("")
    const { chartObj } = JSON.parse(body)
    let count = 0;
    let tmpText = ""
    setPrevChart(chartObj)

    for (let i = 0; i < chartObj.length; i++) {
      if (chartObj[i].errMsg === '' && chartObj[i].charts !== null) {
        setCharts(prev => [chartObj[i].charts, ...prev])
        count++
      } else {
        setErrMsg(prev => prev + chartObj[i].errMsg + "\n")
        tmpText += chartObj[i].errMsg
      }
    }
    if (chartObj.length == 0) {
      tmpText = noCharts[Math.floor(Math.random() * 3)]
      setErrMsg(tmpText)
    } else {
      setErrMsg(prev => prev + "Returned " + count + " charts")
      tmpText += "Returned " + count + " chart(s)"
    }

    UseVoice(tmpText)
  }

  const createChartWithVoice = async (transcript) => {

    const response = await fetch('http://localhost:5000/', {
      method: 'POST',
      body: JSON.stringify(
        {
          command: transcript,
          attributes: attributes,
          dataHead: dataHead,
          prevChart: prevChart,
          overHearingData: overHearingData,
          synonymAttributes: synonymAttributes,
          featureAttributes: featureAttributes
        }),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const body = await response.text();
    setErrMsg("")
    const { chartObj } = JSON.parse(body)
    let count = 0;
    let tmpText = ""
    setPrevChart(chartObj)
    for (let i = 0; i < chartObj.length; i++) {
      if (chartObj[i].errMsg === '' && chartObj[i].charts !== null) {
        setCharts(prev => [chartObj[i].charts, ...prev])
        count++
      } else {
        setErrMsg(prev => prev + chartObj[i].errMsg + "\n")
        tmpText += chartObj[i].errMsg
      }
    }
    if (chartObj.length == 0) {
      tmpText = noCharts[Math.floor(Math.random() * 3)]
      setErrMsg(tmpText)
    } else {
      setErrMsg(prev => prev + "Returned " + count + " charts")
      tmpText += "Returned " + count + " chart(s)"
    }
    let utterance = UseVoice(tmpText)
    return utterance
  }


  const clearGraphs = () => {
    setCharts([])
    setErrMsg("")
    setSelected(false);
  }

  const handleSelect = (e) => {
    setSelected(prev => !prev)
  }

  return (
    <>
      <br />
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
      </div>
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
        <Form onSubmit={() => setOverHearingData(overHearingText)}>
          <input type="text" onChange={(e) => setOverHearingText(e.target.value)}></input>
        </Form>
        <Plot
        data={[
          {
            r: [1, 2, 3],
            theta: ['A', 'B', 'C'],
            type: 'scatterpolar',
            fill: 'toself'
          },
        ]}
        layout={ {width: 400, height: 400, polar: {
          radialaxis: {
            visible: true,
            range: [0,10]
          }
        }} }
      />
      </Grid>

      <InputBar
        createCharts={createCharts}
        handleChange={handleChange}
        dataHeaders={dataHeaders}
        data={data}
        clearGraphs={clearGraphs}
      />
      <div style={{ position: "absolute" }}>
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
        utterance.onend = function (event) {
          console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
          setListening(true)
        }
      }
    },
    {
      command: "computer",
      callback: () => {
        let utterance = UseVoice("At your service")
        utterance.onend = function (event) {

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
        utterance.onend = function (event) {
          console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
          setListening(true)
        }
      }
    }
  ]



  useEffect(() => {
    if (listening) {
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

  const { transcript, resetTranscript } = useSpeechRecognition({ commands })

  useEffect(() => {
    setOverHearingData(transcript)
  }, [transcript])

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return null
  } else {
    SpeechRecognition.startListening({ continuous: true })

  }

  return (
    <div>
      <button onClick={SpeechRecognition.startListening}>Start</button>
      <button onClick={() => {
        SpeechRecognition.stopListening();
        createChartWithVoice(transcript);
      }}>Create Visualization</button>
      <Container>
        <p>{transcript}</p>
      </Container>
    </div>
  )
}