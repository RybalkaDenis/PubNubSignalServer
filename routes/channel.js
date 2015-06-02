var chat = require('../lib/chat');
var metrics = require('../lib/metrics');
var chatSecure = require('../lib/chatSecure');
var i = 0;
chat.join({
    channel:'test',
    callback:function(m){
        i++;
        console.log(i+' packets received and delay '+ (new Date() - new Date(m.time))+' ms');
    }
});
var j = 0;
var timer = setInterval(function() {
    j++;
    if(j >= 500){
        clearInterval(timer)
    }
    console.log(j + ' packets was sent');
    chat.say({
    channel:'test',
    message:{
        text:'ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss',//80 bytes
        time: new Date()
    }

})},50);

chat.join({
    channel:'signaling server',
    callback: function(m){
        if(m.status == 200){ //Invitation
            chat.say({
                channel: m.to,
                message:m
            });
        }else if(m.status == 201){ //Accept call
            chat.say({
                channel: m.to,
                message:{
                    text: m.from+  ' accepted your call',
                    from: m.from,
                    status: 201
                }
            });
            metrics.clearMetrics();
            chat.join({
                channel:[m.to, m.from],
                callback:function(message){
                    metrics.makeMetrics(message);
                },
                error:function(err){
                    console.log(err,'error');
                }
            })
        }else if(m.status == 204){//Reject call
            chat.say({
                channel: m.to,
                message:{
                    text: m.from+' rejected your call',
                    from: m.from,
                    status:204
                }
            })
        }else if(m.status == 410){ //End call
            chat.say({
                channel: m.channel,
                message:{
                    text: m.from+' ended call',
                    from: m.from,
                    status:410
                }
            });
            chat.leave({ //Leave chat room
                channel: e.from
            })
        }else if(m.status == 411){ //Change channel to secure
            chat.leave({ //Leave chat room
                channel: [m.to, m.from, 'signaling server']

            })
            secureConnection()
        }
    }
});

function secureConnection(){
    chat.join({
        channel:'signaling server',
        callback: function(m){
            if(m.status == 200){ //Invitation
                chat.say({
                    channel: m.to,
                    message:m
                });
            }else if(m.status == 201){ //Accept call
                chat.say({
                    channel: m.to,
                    message:{
                        text: m.from+  ' accepted your call',
                        from: m.from,
                        status: 201
                    }
                });
                metrics.clearMetrics();
                chat.join({
                    channel:[m.to, m.from],
                    callback:function(message){
                        metrics.makeMetrics(message);
                    },
                    error:function(err){
                        console.log(err,'error');
                    }
                })
            }else if(m.status == 204){//Reject call
                chat.say({
                    channel: m.to,
                    message:{
                        text: m.from+' rejected your call',
                        from: m.from,
                        status:204
                    }
                })
            }else if(m.status == 410){ //End call
                chat.say({
                    channel: m.channel,
                    message:{
                        text: m.from+' ended call',
                        from: m.from,
                        status:410
                    }
                });
                chat.leave({ //Leave chat room
                    channel: e.from
                })
            }else if(m.status == 411){ //Change channel to secure
                chat.leave({ //Leave chat room
                    channel: [m.to, m.from, 'signaling server']

                })
                secureConnection()
            }
        }
    });
}