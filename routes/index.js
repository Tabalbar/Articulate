var express = require('express');
var router = express.Router();
const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'], forceNER: true });

//Training the model
// Comparison
manager.addDocument('en', 'comparison', 'graph.comparison');
manager.addDocument('en', 'compare', 'graph.comparison');

//relationship
manager.addDocument('en', 'relationship', 'graph.relationship');

//distribution
manager.addDocument('en', 'distribution', 'graph.distribution');

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
// const findommands = require('../chartMaker/findCommands')
const nlp = require('compromise')

/* GET home page. */
router.post('/', async (req, res, next) => {
  let specs = [];
  // const commands = findommands(req.body.command)
  const data = req.body.dataHead;
  const attributes = req.body.attributes
  let charts = []
  // for(let i = 0; i < commands.length; i++){
  //   const response = await manager.process('en', commands[i])
  //   if(response){
  //     charts.push(chartMakerWithAnswer(response.answer, commands[i], attributes, data))
  //   }

  // }
  const command = req.body.command
  const response = await manager.process('en', command)
  let chartObj = {
    charts: null,
    errMsg: ''
  }
  if (response) {
    chartObj = chartMakerWithAnswer(response.answer, command, attributes, data)
  }
  console.log(chartObj)


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
