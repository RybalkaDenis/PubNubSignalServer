var fs = require('fs');
module.exports = {
    api:{
        channel:require('./channel'),
        metrics:require('./metrics')
    },
    static:{
        index:function(){
            fs.createReadStream(__dirname+'/app/index.html').pipe(res);
        }
    }
};
