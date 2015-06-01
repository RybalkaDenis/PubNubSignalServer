angular.module('pubNub', [])
    .factory('pubNub', ['$rootScope', function ($rootScope) {

        var pubNub,
            keys;

        if (!PUBNUB) {
            throw 'The pubnub javascript SDK must be referenced first.';
        }

        pubNub = PUBNUB;

        keys = {
            publishKey: 'demo',
            subscribeKey: 'demo'
        };

        pubNub.init(keys);

        return {
            subscribe: function (s) {
                pubNub.subscribe({
                    channel: s.channel,
                    callback: function (m) {
                        $rootScope.$apply(function () {
                            s.callback(m);
                        });
                    }
                });
            },
            publish: function (p) {
                console.log(p, 'pubnub')
                pubNub.publish({
                    channel: p.channel,
                    message: p.message
                });
            },
            unsubscribe: function (u) {
                pubNub.unsubscribe({
                    channel: u.channel
                });
            },
            getUiid :function(){
                return pubNub.uiid(function(uiid){
                    return uiid;
                })
            }
        };
    }]);