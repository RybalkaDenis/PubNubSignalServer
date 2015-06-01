var MongoClient = require('mongodb').MongoClient;


var url = 'mongodb://localhost:27017/pubnub';


function insert(data){
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection('metrics');
        collection.insert(data, function(err, doc){

        });
    });
}

function getAll(callback){
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection('metrics');

        collection.find().toArray(function(err, results){
            callback(null, results)
        });
    });
}

function dropDataBase(callback){
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection('metrics');
        collection.remove({},function(err, results){
              callback(err, results)
        });
    });
}

module.exports = {
    insert:insert,
    getAll:getAll,
    dropDataBase:dropDataBase
};