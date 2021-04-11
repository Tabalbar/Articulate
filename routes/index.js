var express = require('express');
var router = express.Router();
const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'], forceNER: true });


manager.addDocument('en', 'show me a bar graph of ', 'graph.bar');
manager.addDocument('en', 'show me a bar graph of nominal and quantitative', 'graph.bar');
manager.addDocument('en', 'show me a bar graph of nominal nominal and quantitative', 'graph.bar');
manager.addDocument('en', 'show me quantitative and nominal', 'graph.bar');
manager.addDocument('en', 'show me quantitative nominal anf nominal', 'graph.bar');
manager.addDocument('en', 'What is the best way to represent quantitative and nominal', 'graph.bar');
manager.addDocument('en', 'What is the best way to represent quantitative nominal and nominal', 'graph.bar');
manager.addDocument('en', 'how do nominal and quantitative', 'graph.bar');
manager.addDocument('en', 'show me quantitative nominal nominal and nominal', 'graph.bar');
manager.addAnswer('en', 'graph.bar', 'bar');

manager.addDocument('en', 'show me a line graph of ', 'graph.line');
manager.addDocument('en', 'show me the ditribution of quantitative', 'graph.line');
manager.addDocument('en', 'for the months of temporal show me quantitative', 'graph.line');
manager.addDocument('en', 'show me the years of temporal and quantitative', 'graph.line');
manager.addDocument('en', 'show me quantitative and tempraol over time', 'graph.line');
manager.addDocument('en', 'for the months of temporal show me quantitative and nominal', 'graph.line');
manager.addDocument('en', 'show me the years of temporal nominal and quantitative', 'graph.line');
manager.addDocument('en', 'show me quantitative nominal and temporal over time', 'graph.line');
manager.addAnswer('en', 'graph.line', 'line');

manager.addDocument('en', 'show me a scatter plot of ', 'graph.scatter');
manager.addDocument('en', 'show me a scatter plot of quantitative and quantitative', 'graph.scatter');
manager.addDocument('en', 'show me a scatter plot of quantitative quantitative quantitative', 'graph.scatter');
manager.addDocument('en', 'how do i represent quantitative quantitative and quantitative', 'graph.scatter');
manager.addDocument('en', 'show me quantitative and quantitative sized by quantitative', 'graph.scatter');
manager.addDocument('en', 'what is the quantiative of quantitative', 'graph.scatter');
manager.addAnswer('en', 'graph.scatter', 'scatter');

manager.addDocument('en', 'show me a pie chart of ', 'graph.pie');
manager.addDocument('en', 'show me a pie chart of quantitative and nominal', 'graph.pie');
manager.addDocument('en', 'show me the percentage of quantitative and nominal', 'graph.pie');
manager.addDocument('en', 'what is the percentage of nominal and quantitative', 'graph.pie');
manager.addDocument('en', 'what percent of nominal does quantitative', 'graph.pie');
manager.addAnswer('en', 'graph.pie', 'pie');

manager.addDocument('en', 'show me a marginal histogram of', 'graph.marginalHistogram');
manager.addDocument('en', 'show me a marginal histogram of quantitative and quantitative', 'graph.marginalHistogram');
manager.addDocument('en', 'show me a heat map of quantitative and quantitative with bar charts', 'graph.marginalHistogram');
manager.addDocument('en', 'show me a heat map of quantitative and quantitative with bar charts on the side', 'graph.marginalHistogram');
manager.addAnswer('en', 'graph.marginalHistogram', 'marginalHistogram');

manager.addDocument('en', 'show me a heat map of quantitative and quantitative', 'graph.heatmap');
manager.addDocument('en', 'show me a heat map of quantitative and quantitative', 'graph.heatmap');
manager.addDocument('en', 'show me a 2D histogram of quantitative and quantitative', 'graph.heatmap');
manager.addAnswer('en', 'graph.heatmap', 'heatmap');

manager.addDocument('en', 'show me a area chart of ', 'graph.lineArea');
manager.addDocument('en', 'show me a area chart of temporal quantitative and nominal', 'graph.lineArea');
manager.addAnswer('en', 'graph.lineArea', 'lineArea');

manager.addDocument('en', 'show me a normalized area chart of ', 'graph.normalizedLineArea');
manager.addDocument('en', 'show me a normalized area chart of temporal quantitative and nominal ', 'graph.normalizedLineArea');
manager.addAnswer('en', 'graph.normalizedLineArea', 'normalizedLineArea');

manager.addDocument('en', 'show me a stacked bar chart of ', 'graph.stackedBar');
manager.addDocument('en', 'show me a stacked bar chart of of temporal quantitative and nominal', 'graph.stackedBar');
manager.addAnswer('en', 'graph.stackedBar', 'stackedBar');

manager.addDocument('en', 'show me a normalized stacked bar chart of ', 'graph.normalizedStackedBar');
manager.addDocument('en', 'show me a normalized stacked bar chart of of temporal quantitative and nominal', 'graph.normalizedStackedBar');
manager.addAnswer('en', 'graph.normalizedStackedBar', 'normalizedStackedBar');

//comparison
// manager.addDocument('en', 'comparison', 'graph.comparison');
// manager.addDocument('en', 'show a bar chart with side by side values of quantitative and nominal', 'graph.comparison');
// manager.addDocument('en', 'show me a chart of quantitative and nominal', 'graph.comparison');
// manager.addDocument('en', 'show me a chart of nominal and quantitative', 'graph.comparison');
// manager.addDocument('en', 'i want to see how nominal and nominal compare to quantitative', 'graph.comparison');
// manager.addDocument('en', 'create a bar chart the shows how much each nominal is quantitative', 'graph.comparison');
// manager.addDocument('en', 'what is the quantitative of the different nominal', 'graph.comparison');
// manager.addDocument('en', 'make me a graph showing my nominal by quantitative of the whole', 'graph.comparison');
// manager.addDocument('en', 'for each nominal show a diagram of quantitative', 'graph.comparison');
// manager.addDocument('en', 'make me a benchmark graph of nominal showing the best performing quantitative', 'graph.comparison');
// manager.addDocument('en', 'show me a bar chart with nominal quantitative', 'graph.comparison');
// manager.addDocument('en', 'show me a chart with nominal nominal nominal and quantitative', 'graph.comparison');
// manager.addDocument('en', 'show me a chart with temporal nominal and quantitative', 'graph.comparison');
// manager.addDocument('en', 'show me a chart with temporal and quantitative', 'graph.comparison');
// manager.addDocument('en', 'compare of nominal', 'graph.comparison');

// //relationship
// manager.addDocument('en', 'relationship', 'graph.relationship');
// manager.addDocument('en', 'plot for each quantitative the correlation between quantitative and their quantitative', 'graph.relationship');
// manager.addDocument('en', 'make me a scatter plot for quantitaive and quantitative', 'graph.relationship');
// manager.addDocument('en', 'show me the relation between quantitative and quantitative in various quantitative', 'graph.relationship');
// manager.addDocument('en', 'make a bubble plot of quantitative per to median quantitative in quantitative', 'graph.relationship');
// manager.addDocument('en', 'make a chart showing quantitative quantitative against quantitative', 'graph.relationship');
// manager.addDocument('en', 'what is the relationship between quantitative and quantitative', 'graph.relationship');
// manager.addDocument('en', 'make a bubble chart with quantitative quantitative', 'graph.relationship');


// //distribution
// manager.addDocument('en', 'distribution', 'graph.distribution');
// manager.addDocument('en', 'show me the distribution of nominal', 'graph.distribution');
// manager.addDocument('en', 'using nominal distribution data make me a bar chart', 'graph.distribution');
// manager.addDocument('en', 'show histogram of nominal distribution', 'graph.distribution');
// manager.addDocument('en', 'show in a bar chart nominal distribution', 'graph.distribution');
// manager.addDocument('en', 'what is the nominal distribution for all nominal', 'graph.distribution');
// manager.addDocument('en', 'show me a scatter plot of quantitative and quantitative', 'graph.distribution');
// manager.addDocument('en', 'show in a scatter plot how does quantitative compare with quantitative', 'graph.distribution');
// manager.addDocument('en', 'show a bar chart for the quantitative and quantitative', 'graph.distribution');


// //composition
// manager.addDocument('en', 'show me the percentage of nominal and quantitative', 'graph.composition');
// manager.addDocument('en', 'show me the percentage of quantitative and ordinal', 'graph.composition');
// manager.addDocument('en', 'composition', 'graph.composition');


// //Iterate
// manager.addDocument('en', 'can you add', 'graph.iterate');


// //Model Answers
// //comparison
// manager.addAnswer('en', 'graph.comparison', 'comparison');

// //relationship
// manager.addAnswer('en', 'graph.relationship', 'relationship');

// //distribution
// manager.addAnswer('en', 'graph.distribution', 'distribution');

// //composition
// manager.addAnswer('en', 'graph.composition', 'composition');

// manager.addAnswer('en', 'graph.iterate', 'add');


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


// const findommands = require('../chartMaker/findCommands')
const nlp = require('compromise')

/* GET home page. */
router.post('/', async (req, res, next) => {
  let specs = [];
  const data = req.body.dataHead;
  const attributes = req.body.attributes

  let charts = []
  const command = req.body.command
  const normalizedCommand = normalizeCommand(command)
  const { generalizedCommand, synonymCommand } = generalizeCommand(command, attributes, data)

  const response = await manager.process('en', generalizedCommand)
  const headerMatrix = createVector(attributes, data)
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

  let chartObj = {
    charts: null,
    errMsg: 'no command found'
  }
  console.log(response)
  if (req.body.prevChart && response){
    chartObj = iterateGraph(response.answer, synonymCommand, attributes, data, headerMatrix, command)
  } else if (response) {
    chartObj = chartMaker(response.answer, synonymCommand, attributes, data, headerMatrix, command)
  }
  // console.log(response)

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
