var metrics = require('../lib/metrics');
var mongo = require('../lib/mongo');

function sendMetrics(req, res, next){
 var oneMetric =  metrics.getMetrics();
 res.status(200);
 res.send(oneMetric);
}

function getAllMetrics(req,res, next){
    mongo.getAll(function(err, results){
        if(err) throw err;
        res.status(200);
        res.send(results);
    });

}

function deleteMetrics(req, res, next){
    mongo.dropDataBase(function(err, results){
        if(err) throw err;
        res.status(200);
        res.send(results);
    });
}

module.exports ={
  sendMetrics:sendMetrics,
  getAllMetrics:getAllMetrics,
  deleteMetrics:deleteMetrics
};