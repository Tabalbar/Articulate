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

/* GET home page. */
router.post('/', async (req, res, next) => {

  const response = await manager.process('en', req.body.command)
  res.send({ body: response.answer })
});

module.exports = router;
