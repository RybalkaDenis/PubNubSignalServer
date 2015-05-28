angular.module('myApp').factory('signalingServer', ['chat','channels','$rootScope','lodash', function (chat, channels, $rootScope, lodash) {

   return{
        connect: function(c){
            chat.join({
                channel: 'signaling server',
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
                        chat.publish({
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
                    }
                }
            });

        },
       initChannel:function(c){
           chat.join({
               channel: c.channel,
               callback: c.callback
           });
           channels.add(c.from);
       }

   }
}]);