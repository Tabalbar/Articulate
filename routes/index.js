var express = require('express');
var router = express.Router();
const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'], forceNER: true });


manager.addDocument('en', 'I want to see the comparison of nominal and quantitative', 'bar');
manager.addDocument('en', 'show me a a comparison of nominal and quantitative', 'bar');
manager.addDocument('en', 'show me the distribution of nominal', 'bar');
manager.addDocument('en', 'show me a graph with nominal nominal and quantitative', 'bar');
manager.addDocument('en', 'show me the data for nominal nominal and quantitative', 'bar');
manager.addAnswer('en', 'bar', 'bar');

manager.addDocument('en', 'I want to see the comparison of quantitative over time', 'line');
manager.addDocument('en', 'show me the comparison of quantitative over temporal', 'line');
manager.addDocument('en', 'Show me the temoral over the years of nominal and quantitative', 'line');
manager.addAnswer('en', 'line', 'line');

manager.addDocument('en', 'Show me the relationship of quantitative and quantitative', 'scatter');
manager.addDocument('en', 'I want to see quantitative by quantitative', 'scatter');
manager.addDocument('en', 'show me quantiative by quantitative', 'scatter');
manager.addAnswer('en', 'scatter', 'scatter');

manager.addDocument('en', 'show me the distribution of quantitative and quantitative', 'heatmap');
manager.addDocument('en', 'show me a 2D heatmap', 'heatmap');
manager.addAnswer('en', 'heatmap', 'heatmap');

manager.addDocument('en', 'I want to see the difference of nominal by quantitative quantitative and quantitative', 'parallelCoordinates');
manager.addAnswer('en', 'parallelCoordinates', 'parallelCoordinates');

// Train and save the model.
(async () => {
  await manager.train();
  manager.save();
})();

const chartMaker = require('../chartMaker/chartMaker')
const createVector = require('../chartMaker/createVector')
const normalizeCommand = require('../chartMaker/normalizeCommand')
const generalizeCommand = require('../chartMaker/generalizeCommand')
const countVector = require('../chartMaker/countVector')
const ExplicitChart = require('../chartMaker/specifications/ExplicitChart')
const chartOptions = require('../chartMaker/specifications/chartOptions')

// const findommands = require('../chartMaker/findCommands')
const nlp = require('compromise')

/* GET home page. */
router.post('/', async (req, res, next) => {
  const data = req.body.dataHead;
  const attributes = req.body.attributes
  const transcript = req.body.overHearingData
  const synonymAttributes = req.body.synonymAttributes
  const featureAttributes = req.body.featureAttributes
  const randomChart = req.body.randomChart
  const currentCharts = req.body.currentCharts
  const command = req.body.command
  const normalizedCommand = normalizeCommand(command)
  const { generalizedCommand, synonymCommand } = generalizeCommand(normalizedCommand, attributes, data)
  let explicitChart = ExplicitChart(normalizedCommand)

  const response = await manager.process('en', generalizedCommand)
  const headerMatrix = createVector(attributes, data)
  const { headerFreq } = countVector(transcript, featureAttributes, synonymAttributes, data)

  if(randomChart) {
    explicitChart = chartOptions[Math.floor(Math.random() * chartOptions.length)].mark
  }
  let chartObj = []
  console.log(synonymCommand)
  if (explicitChart) {

    let chart = chartMaker.chartMaker(explicitChart, synonymCommand, attributes, data, headerMatrix, command, headerFreq, randomChart)

    chartObj.push(chart)
  } else {
    for (let i = 0; i < response.classifications.length; i++) {
      if (response.classifications[i].score > .1) {
        console.log(response.classifications[i].intent)
        chartObj.push(chartMaker.chartMaker(response.classifications[i].intent, synonymCommand, attributes, data, headerMatrix, command, headerFreq))

      }
    }
  }
  for(let i = 0; i < chartObj.length; i++) {
    console.log(JSON.stringify(chartObj[i]))

    for(let j = 0; j < currentCharts.length; j++ ) {
      if(JSON.stringify(chartObj[i].charts.spec) === JSON.stringify(currentCharts[j].spec) && chartObj[i].errMsg == "") {
        chartObj[i].errMsg = "Graph is already created"
      } else {
      }
    }

  }
  res.send({ chartObj, headerFreq })
  res.status(201);
  res.json();

});

const createMatrixForAll = require('../chartMaker/createMatrixForAll')

router.post('/addHeaders', async (req, res, next) => {
  const headers = req.body.headers
  const data = req.body.data

  nlp.extend((Doc, world) => {
    // add methods to run after the tagger
    const nlpHeaders = req.body.headers

    world.postProcess(doc => {
      nlpHeaders.forEach(header => {
        doc.match(header).tag('#Noun')
        doc.match(header + 's').tag('#Noun')

      });
    })
  })
  const { featureMatrix, synonymMatrix } = createMatrixForAll(headers, data)
  res.send({ synonymMatrix, featureMatrix })
  res.status(201);
  res.json();
})

module.exports = router;
