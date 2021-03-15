import React, { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Button, Grid, Input } from 'semantic-ui-react'
import { VegaLite } from 'react-vega'
import MaterialTable from 'material-table'
import XLSX from 'xlsx'

function App() {

  //data used for charts and table
  const [data, setData] = useState([])
  const [dataHeaders, setDataHeaders] = useState([])
  const [charts, setCharts] = useState([])

  const testingNode = async () => {
    const response = await fetch('http://localhost:5000/', {
      method: 'POST',

      body: JSON.stringify({ command: "see you later!" }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const body = await response.text();
    console.log(body)
  }
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
  const columns = [
    { title: 'Title', field: 'title' },
    { title: 'Author', field: 'authors' },
    { title: 'Page Count', field: 'num_pages' },
    { title: 'Rating', field: 'rating' }
  ];
  const data = [
    {
      id: 1,
      title: 'The Hunger Games',
      authors: 'Suzanne Collins',
      num_pages: 374,
      rating: 4.33
    },
    {
      id: 2,
      title: 'Harry Potter and the Order of the Phoenix',
      authors: 'J.K. Rowling',
      num_pages: 870,
      rating: 4.48
    },
    {
      id: 3,
      title: 'To Kill a Mockingbird',
      authors: 'Harper Lee',
      num_pages: 324,
      rating: 4.27
    },
    {
      id: 4,
      title: 'Pride and Prejudice',
      authors: 'Jane Austen',
      num_pages: 279,
      rating: 4.25
    },
    {
      id: 5,
      title: 'Twilight',
      authors: 'Stephenie Meyer',
      num_pages: 498,
      rating: 3.58
    },
    {
      id: 6,
      title: 'The Book Thief',
      authors: 'Markus Zusak',
      num_pages: 552,
      rating: 4.36
    }
  ];

  const processData = (data) => {
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
    for(let i = 0; i < headers.length; i++) {
      let obj = {title: headers[i], field: headers[i]}
      tmpHeaders.push(obj)
    }
    setData(list)
    setDataHeaders(headers)
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

    return (
      <>
        <br /><br />
        <Grid centered={true}>
          <Grid.Row>
            <Input placeholder={'...Enter query Here'} />
            <Button onClick={testingNode}>Create Visualization</Button>
            <Input type='file' onChange={laodData} />
          </Grid.Row>
          <Grid.Row>
            <VegaLite spec={spec} data={barData} />
          </Grid.Row>
          <Grid.Row>
            <MaterialTable columns={columns} data={data} title='Books Directory' />
          </Grid.Row>
        </Grid>

      </>
    );
  }

  export default App;
