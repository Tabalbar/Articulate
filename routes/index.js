var express = require('express');
var router = express.Router();
const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'], forceNER: true });

//Training the model
// Comparison
manager.addDocument('en', 'comparison', 'graph.comparison');
manager.addDocument('en', 'show a bar chart with side by side values of quantitative and nominal', 'graph.comparison');
manager.addDocument('en', 'show me a chart of quantitative and nominal', 'graph.comparison');
manager.addDocument('en', 'i want to see how nominal and nominal compare to quantitative', 'graph.comparison');
manager.addDocument('en', 'create a bar chart the shows how much each nominal is quantitative', 'graph.comparison');
manager.addDocument('en', 'what is the quantitative of the different nominal', 'graph.comparison');
manager.addDocument('en', 'make me a graph showing my nominal by quantitative of the whole', 'graph.comparison');
manager.addDocument('en', 'for each nominal show a diagram of quantitative', 'graph.comparison');
manager.addDocument('en', 'make me a benchmark graph of nominal showing the best performing quantitative', 'graph.comparison');
manager.addDocument('en', 'show me a bar chart with nominal quantitative', 'graph.comparison');
manager.addDocument('en', 'compareof nominal', 'graph.comparison');

//relationship
manager.addDocument('en', 'relationship', 'graph.relationship');
manager.addDocument('en', 'plot for each quantitative the correlation between quantitative and their quantitative', 'graph.relationship');
manager.addDocument('en', 'make me a scatter plot for quantitaive and quantitative', 'graph.relationship');
manager.addDocument('en', 'show me the relation between quantitative and quantitative in various quantitative', 'graph.relationship');
manager.addDocument('en', 'make a bubble plot of quantitative per to median quantitative in quantitative', 'graph.relationship');
manager.addDocument('en', 'make a chart showing quantitative quantitative against quantitative', 'graph.relationship');
manager.addDocument('en', 'what is the relationship between quantitative and quantitative', 'graph.relationship');
manager.addDocument('en', 'make a bubble chart with quantitative quantitative', 'graph.relationship');


//distribution
manager.addDocument('en', 'distribution', 'graph.distribution');
manager.addDocument('en', 'show me the distribution of nominal', 'graph.distribution');
manager.addDocument('en', 'using nominal distribution data make me a bar chart', 'graph.distribution');
manager.addDocument('en', 'show histogram of nominal distribution', 'graph.distribution');
manager.addDocument('en', 'show in a bar chart nominal distribution', 'graph.distribution');
manager.addDocument('en', 'what is the nominal distribution for all nominal', 'graph.distribution');
manager.addDocument('en', 'show me a scatter plot of quantitative and quantitative', 'graph.distribution');
manager.addDocument('en', 'show in a scatter plot how does quantitative compare with quantitative', 'graph.distribution');
manager.addDocument('en', 'show a bar chart for the quantitative and quantitative', 'graph.distribution');


//composition
manager.addDocument('en', 'composition', 'graph.composition');


//Model Answers
//comparison
manager.addAnswer('en', 'graph.comparison', 'comparison');

//relationship
manager.addAnswer('en', 'graph.relationship', 'relationship');

//distribution
manager.addAnswer('en', 'graph.distribution', 'distribution');

//composition
manager.addAnswer('en', 'graph.composition', 'composition');

// Train and save the model.
(async () => {
  await manager.train();
  manager.save();
  const response = await manager.process('en', 'I should go now');
})();

const chartMakerWithAnswer = require('../chartMaker/chartMakerWithAnswer')
const createVector = require('../chartMaker/createVector')
const normalizeCommand = require('../chartMaker/normalizeCommand')
const generalizeCommand = require('../chartMaker/generalizeCommand')

// const findommands = require('../chartMaker/findCommands')
const nlp = require('compromise')

/* GET home page. */
router.post('/', async (req, res, next) => {
  let specs = [];
  // const commands = findommands(req.body.command)
  const data = req.body.dataHead;
  const attributes = req.body.attributes
  let charts = []
  const command = req.body.command
  const generalizedCommand = generalizeCommand(command,attributes, data)
  const normalizedCommand = normalizeCommand(command)

  const response = await manager.process('en', generalizedCommand)
  console.log(response.answer)
  const headerMatrix = createVector(attributes, data)
  nlp.extend((Doc, world) => {
    const headers = req.body.headers
    // add methods to run after the tagger
    world.postProcess(doc => {
      headerMatrix.forEach(firstD => {
        firstD.forEach(noun=> {
          doc.match(noun).tag('#Noun')
        })
      });
    })
  })

  let chartObj = {
    charts: null,
    errMsg: ''
  }
  if (response) {
    chartObj = chartMakerWithAnswer(response.answer, command, attributes, data, headerMatrix)
  }


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
