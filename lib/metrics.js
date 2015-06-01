var mongo = require('../lib/mongo');

var messages = [];
var timingMetrics = [];
var byteMetrics =[];

function  byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

//Check metrics size and messages size
function checkMetricsLength(){
    if(messages.length>6){
        messages.splice(0,1)
    }
    if(byteMetrics.length>10){
        byteMetrics.splice(0,1);
    }
    if(timingMetrics.length>10){
        timingMetrics.splice(0,1);
    }
}

//pushes messages and metrics to array to render it on the client side
function pushMetrics(message){
    if(!message.status){
        messages.push(message);
        timingMetrics.push( new Date() - new Date (message.time ));
        byteMetrics.push(byteCount(message.message));

        mongo.insert({
            message:message,
            timingMetrics:timingMetrics[timingMetrics.length-1],
            byteMetrics:byteMetrics[byteMetrics.length-1]
        })
    }
}

function makeMetrics(message){
    checkMetricsLength(message);
    pushMetrics(message);
}

function getMetrics (){
    return {messages:messages, timingMetrics:timingMetrics, byteMetrics:byteMetrics}
}

function clearMetrics(){
    messages = [];
    timingMetrics = [];
    byteMetrics =[];
}

module.exports = {
    makeMetrics :makeMetrics,
    getMetrics:getMetrics,
    clearMetrics:clearMetrics
};