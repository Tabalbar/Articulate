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

manager.addDocument('en', 'show me the composition of quantitative', 'pie');
manager.addDocument('en', 'I want to see the quantitative and nominal', 'pie');
manager.addDocument('en', 'show me the percentage of quantitative and nominal', 'pie');
manager.addAnswer('en', 'pie', 'pie');

manager.addDocument('en', 'can you show me a marginal heat map', 'marginalHistogram');
manager.addDocument('en', 'I want to see the distribution of quantitative and quantitative', 'marginalHistogram');
manager.addDocument('en', 'show me a graph with extra bars on the side', 'marginalHistogram');
manager.addDocument('en', 'show me a heat map of quantitative and quantitative with bar charts on the side', 'marginalHistogram');
manager.addAnswer('en', 'marginalHistogram', 'marginalHistogram');

manager.addDocument('en', 'show me the distribution of quantitative and quantitative', 'heatmap');
manager.addDocument('en', 'show me a 2D heatmap', 'heatmap');
manager.addAnswer('en', 'heatmap', 'heatmap');

manager.addDocument('en', 'Show me the area under the curve for temporal quantitative and temoral', 'lineArea');
manager.addDocument('en', 'show me the quantitative and nominal over time', 'lineArea');
manager.addAnswer('en', 'lineArea', 'lineArea');

// manager.addDocument('en', 'show me a normalized graph with quantitative and nominal over time', 'normalizedLineArea');
// manager.addDocument('en', 'show me a normalized of temporal quantitative and nominal ', 'normalizedLineArea');
// manager.addAnswer('en', 'normalizedLineArea', 'normalizedLineArea');

// manager.addDocument('en', 'show me a stacked bar', 'stackedBar');
// manager.addAnswer('en', 'stackedBar', 'stackedBar');

// manager.addDocument('en', 'show me a normalized stacked bar chart of ', 'normalizedStackedBar');
// manager.addDocument('en', 'show me a normalized stacked bar chart of temporal quantitative and nominal', 'normalizedStackedBar');
// manager.addAnswer('en', 'normalizedStackedBar', 'normalizedStackedBar');

manager.addDocument('en', 'show me the stock trend', 'candleStick');
manager.addAnswer('en', 'candleStick', 'candleStick');

manager.addDocument('en', 'I want to see the difference of nominal by quantitative quantitative and quantitative', 'parallelCoordinates');
manager.addAnswer('en', 'parallelCoordinates', 'parallelCoordinates');

// Train and save the model.
(async () => {
  await manager.train();
  manager.save();
  const response = await manager.process('en', 'I should go now');
})();

const chartMakerWithAnswer = require('../chartMaker/chartMakerWithAnswer')
const chartMaker = require('../chartMaker/chartMaker')
const createVector = require('../chartMaker/createVector')
const normalizeCommand = require('../chartMaker/normalizeCommand')
const generalizeCommand = require('../chartMaker/generalizeCommand')
const iterateGraph = require('../chartMaker/iterateGraph')
const countVector = require('../chartMaker/countVector')
const ExplicitChart = require('../chartMaker/specifications/ExplicitChart')

// const findommands = require('../chartMaker/findCommands')
const nlp = require('compromise')

/* GET home page. */
router.post('/', async (req, res, next) => {
  let specs = [];
  const data = req.body.dataHead;
  const attributes = req.body.attributes


  const transcript = req.body.overHearingData

  let charts = []
  const command = req.body.command
  const normalizedCommand = normalizeCommand(command)
  const { generalizedCommand, synonymCommand } = generalizeCommand(normalizedCommand, attributes, data)

  const explicitChart = ExplicitChart(normalizedCommand)
  const response = await manager.process('en', generalizedCommand)
  const headerMatrix = createVector(attributes, data)

  const { headerFreq, filterFreq } = countVector(transcript, headerMatrix, data)
  console.log(generalizedCommand)
  nlp.extend((Doc, world) => {
    const headers = req.body.headers
    // add methods to run after the tagger
    world.postProcess(doc => {
      headerMatrix.forEach(firstD => {
        firstD.forEach(noun => {
          doc.match(noun).tag('#Noun')
          doc.match(noun + 's').tag('#Noun')
        })
      });
    })
  })

  // let chartObj = {
  //   charts: null,
  //   errMsg: 'no command found'
  // }
  let chartObj = []
  if (explicitChart) {
    let chart = chartMaker.chartMaker(explicitChart, synonymCommand, attributes, data, headerMatrix, command, headerFreq)
    chartObj.push( chart)
    console.log(chart)
  } else {
    for (let i = 0; i < response.classifications.length; i++) {
      if (response.classifications[i].score > .1) {

        chartObj.push(chartMaker.chartMaker(response.classifications[i].intent, synonymCommand, attributes, data, headerMatrix, command, headerFreq))

      }
    }
  }

  // if (req.body.prevChart && response) {
  //   chartObj = iterateGraph(response.answer, synonymCommand, attributes, data, headerMatrix, command)
  // } else if (response) {
  //   chartObj = chartMaker(response.answer, synonymCommand, attributes, data, headerMatrix, command)
  // }
  res.send({ chartObj })
  res.status(201);
  res.json();

});


router.post('/addHeaders', async (req, res, next) => {
  nlp.extend((Doc, world) => {
    const headers = req.body.headers
    // add methods to run after the tagger
    world.postProcess(doc => {
      doc.match('light the lights').tag('#Verb . #Plural')
      headers.forEach(header => {
        doc.match(header).tag('#Noun')
      });
    })
  })

  res.status(201);
  res.json();
})

module.exports = router;
