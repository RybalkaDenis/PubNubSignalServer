angular.module('myApp').factory('chat', ['pubNub', function (pubNub){

    return {
        say: function (s) {
            console.log(s, 'chat')
            pubNub.publish({
                channel: s.channel,
                message: s.message
            });
        },
        join: function (j) {
            pubNub.subscribe({
                channel: j.channel,
                callback: j.callback
            });
        },
        leave: function (l) {
            pubNub.unsubscribe({
                channel: l.channel
            });
        }
    };

} ]);