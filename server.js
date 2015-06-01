var express = require('express');
var routes = require('./routes');
var app = express();


app.use(express.static('app'));
app.get('/',routes.static.index);
app.get('/metrics', routes.api.metrics.sendMetrics);
app.delete('/metrics', routes.api.metrics.deleteMetrics);
app.get('/allmetrics', routes.api.metrics.getAllMetrics);


var server = app.listen(3000, function(){
   console.log('Visit  http://localhost:', server.address().port);
});