var pubnub = require('pubnub')
.init({
   publish_key :'demo',
   subscribe_key:'demo'
});


module.exports ={
    say: function (s) {
        pubnub.publish({
            channel: s.channel,
            message: s.message
        });
    },
    join: function (j) {
        pubnub.subscribe({
            channel: j.channel,
            callback: j.callback
        });
    },
    leave: function (l) {
        pubnub.unsubscribe({
            channel: l.channel
        });
    }
}