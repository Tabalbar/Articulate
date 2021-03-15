var express = require('express');
var router = express.Router();
var express = require('express');

const app = express()
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");

  res.send({express: "Hello from Express"})
});

module.exports = router;
