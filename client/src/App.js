import React, { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Input, Header } from 'semantic-ui-react'
import { VegaLite } from 'react-vega'
import MaterialTable from 'material-table'
import XLSX from 'xlsx'
import UseVoice from './UseVoice';
import DraggableGraph from './components/DraggableGraph';
import InputBar from './components/InputBar';
import StreamGraph from './components/StreamGraph'
import { noCharts } from './assistantOptions/AssistantReplies'
import WordCloud from './components/WordCloud'
import Dictaphone from './components/Dictaphone'
import DraggablePlotly from './components/DraggablePlotly'

function App() {
  //data used for charts and table
  const [data, setData] = useState([])
  const [dataHeaders, setDataHeaders] = useState([])
  const [charts, setCharts] = useState([])
  const [command, setCommand] = useState('')
  const [dataHead, setDataHead] = useState([])
  const [attributes, setAttributes] = useState([])
  const [errMsg, setErrMsg] = useState('')
  const [prevChart, setPrevChart] = useState([])

  const [overHearingData, setOverHearingData] = useState('')
  const [synonymAttributes, setSynonymAttributes] = useState([])
  const [featureAttributes, setFeatureAttributes] = useState([])

  const [overHearingText, setOverHearingText] = useState("")
  const [plotlyCharts, setPlotlyCharts] = useState([])

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
    let numChartReturned = 0;
    let tmpText = ""
    setPrevChart(chartObj)

    for (let i = 0; i < chartObj.length; i++) {
      if (chartObj[i].errMsg === '' && chartObj[i].charts !== null) {
        setCharts(prev => [chartObj[i].charts, ...prev])
        numChartReturned++
      } else if (chartObj[i].plotly) {
        setPlotlyCharts(prev => [chartObj[i], ...prev])
        numChartReturned++
      } else {
        setErrMsg(prev => prev + chartObj[i].errMsg + "\n")
        tmpText += chartObj[i].errMsg
      }

    }
    if (chartObj.length == 0) {
      tmpText = noCharts[Math.floor(Math.random() * 3)]
      setErrMsg(tmpText)
    } else {
      setErrMsg(prev => prev + "Returned " + numChartReturned + " charts")
      tmpText += "Returned " + numChartReturned + " chart(s)"
    }

    UseVoice(tmpText)
  }
  console.log(plotlyCharts)
  console.log(charts)


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
    let numChartReturned = 0;
    let tmpText = ""
    setPrevChart(chartObj)
    for (let i = 0; i < chartObj.length; i++) {
      if (chartObj[i].errMsg === '' && chartObj[i].charts !== null) {
        setCharts(prev => [chartObj[i].charts, ...prev])
        numChartReturned++
      } else if (chartObj[i].plotly) {
        setPlotlyCharts(prev => [chartObj[i], ...prev])
        numChartReturned++
      } else {
        setErrMsg(prev => prev + chartObj[i].errMsg + "\n")
        tmpText += chartObj[i].errMsg
      }
    }
    if (chartObj.length == 0) {
      tmpText = noCharts[Math.floor(Math.random() * 3)]
      setErrMsg(tmpText)
    } else {
      setErrMsg(prev => prev + "Returned " + numChartReturned + " charts")
      tmpText += "Returned " + numChartReturned + " chart(s)"
    }
    let utterance = UseVoice(tmpText)
    return utterance
  }

  const clearGraphs = () => {
    setCharts([])
    setPlotlyCharts([])
    setErrMsg("")
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
      <div style={{ position: "absolute" }}>
        {
          plotlyCharts.length ?
          plotlyCharts.map((element, index) => {
              return (
                <>
                  <DraggablePlotly
                    chart={element}
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

