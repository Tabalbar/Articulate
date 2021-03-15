import React, { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Input } from 'semantic-ui-react'
import { VegaLite } from 'react-vega'
import MaterialTable from 'material-table'
import XLSX from 'xlsx'

function App() {

  //data used for charts and table
  const [data, setData] = useState([])
  const [dataHeaders, setDataHeaders] = useState([])
  const [charts, setCharts] = useState([])
  const [command, setCommand] = useState('')
  const [dataHead, setDataHead] = useState([])
  const [attributes, setAttributes] = useState([])

  const spec = {
    width: 400,
    height: 200,
    mark: 'bar',
    encoding: {
      x: { field: 'a', type: 'ordinal' },
      y: { field: 'b', type: 'quantitative' },
    },
    data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
  }

  const barData = {
    table: [
      { a: 'A', b: 28 },
      { a: 'B', b: 55 },
      { a: 'C', b: 43 },
      { a: 'D', b: 91 },
      { a: 'E', b: 81 },
      { a: 'F', b: 53 },
      { a: 'G', b: 19 },
      { a: 'H', b: 87 },
      { a: 'I', b: 52 },
    ],
  }

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

      body: JSON.stringify({ headers: headers}),
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
    const value = e.target.value;
    setCommand(value)
  }

  const createCharts = async () => {
    const response = await fetch('http://localhost:5000/', {
      method: 'POST',

      body: JSON.stringify({ command: command, attributes: attributes, dataHead: dataHead }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const body = await response.text();
    const responseObj = JSON.parse(body)
    console.log(responseObj)
  }

  return (
    <>
      <br /><br />
      <Grid centered={true}>
        <Grid.Row>
          <Form onSubmit={createCharts}>
            <Input placeholder={'...Enter query Here'} onChange={handleChange} />
            <Button onClick={createCharts}>Create Visualization</Button>
            <Input type='file' onChange={laodData} />
          </Form>
        </Grid.Row>
        <Grid.Row>
          {
            charts.length ?
              charts.map(element => {
                return (
                  <>
                    <VegaLite spec={spec} data={barData} />
                  </>
                )
              })
              :
              null
          }
        </Grid.Row>
        <Grid.Row>
          <MaterialTable columns={dataHeaders} data={data} title='' />
        </Grid.Row>
      </Grid>

    </>
  );
}

export default App;