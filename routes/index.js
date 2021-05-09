var express = require('express');
var router = express.Router();
const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'], forceNER: true });


manager.addDocument('en', 'show me a bar graph of ', 'bar');
manager.addDocument('en', 'show me a histogram of quantitative', 'bar');
manager.addDocument('en', 'show me a bar graph of nominal and quantitative', 'bar');
manager.addDocument('en', 'show me a bar graph of nominal nominal nominal and quantitative', 'bar');
manager.addDocument('en', 'show me a bar graph of quantitative nominal nominal and nominal', 'bar');
manager.addDocument('en', 'show me a graph of nominal nominal and quantitative', 'bar');
manager.addDocument('en', 'show me quantitative and nominal', 'bar');
manager.addDocument('en', 'show me quantitative nominal and nominal', 'bar');
manager.addDocument('en', 'show me quantitative nominal nominal and nominal', 'bar');
manager.addAnswer('en', 'bar', 'bar');

manager.addDocument('en', 'show me a line graph of ', 'line');
manager.addDocument('en', 'can i see a line chart of quantitative ', 'line');
manager.addDocument('en', 'show me the ditribution of quantitative', 'line');
manager.addDocument('en', 'what is the ditribution of quantitative', 'line');
manager.addDocument('en', 'for the months of temporal show me quantitative', 'line');
manager.addDocument('en', 'show me the years of temporal and quantitative', 'line');
manager.addDocument('en', 'show me quantitative and nominal over time', 'line');
manager.addDocument('en', 'show me the years of temporal nominal and quantitative', 'line');
manager.addDocument('en', 'show me quantitative nominal and temporal over time', 'line');
manager.addAnswer('en', 'line', 'line');

manager.addDocument('en', 'show me a scatter plot of ', 'scatter');
manager.addDocument('en', 'show me a scatter plot of quantitative and quantitative', 'scatter');
manager.addDocument('en', 'show me a scatter plot of quantitative quantitative quantitative', 'scatter');
manager.addDocument('en', 'how do i represent quantitative quantitative and quantitative', 'scatter');
manager.addDocument('en', 'show me quantitative and quantitative sized by quantitative', 'scatter');
manager.addDocument('en', 'what is the quantiative of quantitative', 'scatter');
manager.addAnswer('en', 'scatter', 'scatter');

manager.addDocument('en', 'show me a pie chart of ', 'pie');
manager.addDocument('en', 'show me a pie chart of quantitative and nominal', 'pie');
manager.addDocument('en', 'show me the percentage of quantitative and nominal', 'pie');
manager.addDocument('en', 'what is the percentage of nominal and quantitative', 'pie');
manager.addDocument('en', 'what percent of nominal does quantitative', 'pie');
manager.addAnswer('en', 'pie', 'pie');

manager.addDocument('en', 'show me a marginal of', 'marginalHistogram');
manager.addDocument('en', 'show me a marginal of quantitative and quantitative', 'marginalHistogram');
manager.addDocument('en', 'show me a heat map of quantitative and quantitative with bar charts', 'marginalHistogram');
manager.addDocument('en', 'show me a heat map of quantitative and quantitative with bar charts on the side', 'marginalHistogram');
manager.addAnswer('en', 'marginalHistogram', 'marginalHistogram');

manager.addDocument('en', 'show me a heat map of quantitative and quantitative', 'heatmap');
manager.addDocument('en', 'show me a heat map of quantitative and quantitative', 'heatmap');
manager.addDocument('en', 'show me a 2D histogram of quantitative and quantitative', 'heatmap');
manager.addAnswer('en', 'heatmap', 'heatmap');

manager.addDocument('en', 'show me a area chart of ', 'lineArea');
manager.addDocument('en', 'show me a area chart of temporal quantitative and nominal', 'lineArea');
manager.addAnswer('en', 'lineArea', 'lineArea');

manager.addDocument('en', 'show me a chart where temporal quantitative and nominal', 'normalizedLineArea');
manager.addDocument('en', 'show me a normalized of temporal quantitative and nominal ', 'normalizedLineArea');
manager.addAnswer('en', 'normalizedLineArea', 'normalizedLineArea');

manager.addDocument('en', 'show me a stacked ', 'stackedBar');
manager.addDocument('en', 'show me a stacked of temporal quantitative and nominal', 'stackedBar');
manager.addAnswer('en', 'stackedBar', 'stackedBar');

manager.addDocument('en', 'show me a normalized stacked bar chart of ', 'normalizedStackedBar');
manager.addDocument('en', 'show me a normalized stacked bar chart of temporal quantitative and nominal', 'normalizedStackedBar');
manager.addAnswer('en', 'normalizedStackedBar', 'normalizedStackedBar');

manager.addDocument('en', 'show me the stock trend', 'candleStick');
manager.addAnswer('en', 'candleStick', 'candleStick');

manager.addDocument('en', 'show me parallel coordniates for', 'parallelCoordinates');
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
  const response = await manager.process('en', generalizedCommand)
  const headerMatrix = createVector(attributes, data)

  const {headerFreq, filterFreq} = countVector(transcript, headerMatrix, data)


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
  for(let i = 0; i < response.classifications.length; i++) {
    if(response.classifications[i].score > .1) {

      chartObj.push(chartMaker.chartMaker(response.classifications[i].intent, synonymCommand, attributes, data, headerMatrix, command, headerFreq))

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
