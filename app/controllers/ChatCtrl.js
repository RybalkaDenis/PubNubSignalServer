angular.module('myApp').controller('ChatCtrl', function($rootScope, $scope, $modal, signalingServer, notify, chat, lodash){

    $scope.client = (Math.random()*10^0).toString()+(Math.random()*10^0).toString()+(Math.random()*10^0).toString();
    $scope.messages = [];
    $scope.timingMetrics = [];
    $scope.byteMetrics = [];


    //Show modal windows size and template can be passed in options
    $scope.showModal = function(options){
        $scope.$modalInstance = $modal.open({
            templateUrl:options.template,
            scope:$scope,
            size:'sm',
            controller:'ModalCtrl',
            resolve:{
                message : function(){
                    return options.message || null;
                }
            }
        });
    };

    //Determine byte length of a string
    $scope.byteCount = function(s) {
        return encodeURI(s).split(/%..|./).length - 1;
    };

    //Check metrics size and messages size
    $scope.checkMetricsLength = function(){
        if($scope.messages.length>6){
            $scope.messages.splice(0,1)
        }
        if($scope.byteMetrics.length>10){
            $scope.byteMetrics.splice(0,1);
        }
        if($scope.timingMetrics.length>10){
            $scope.timingMetrics.splice(0,1);
        }
    };

    //pushes messages and metrics to array to render it on the client side
    $scope.pushMetrics = function(message){
        console.log(message, 'push metrics');
        if(!message.status){
            $scope.messages.push(message);
            $scope.timingMetrics.push( new Date() - new Date (message.time ));
            $scope.byteMetrics.push($scope.byteCount(message.message));
        }
        if(message.status == 444){
            $scope.messages.push(message);
            $scope.timingMetrics.push(message.time);
            $scope.byteMetrics.push($scope.byteCount(message.message));
        }
    };

    //Send response with metrics
    $scope.responseMetrics = function(message){
        console.log(message, 'response');
        if(!message.status) {
            chat.say({
                channel: $scope.client,
                message: {
                    time: new Date() - new Date (message.time ),
                    message: message.message,
                    status: 444,
                    channel:$scope.client
                }
            });
        }
    };

    //Invite user to chat
    $scope.inviteToChat = function(message){
        var options = {
            message:message,
            template:'inviteModal.html'
        };
        if(message.from && !$scope.$modalInstance)
            $scope.showModal(options);
    };


    //Public message in channel and push it to array that will be rendered to user
    $scope.sendMessage = function(){
        chat.say({
            channel:$scope.client,
            message: {
                channel: $scope.client,
                message: $scope.text,
                time: new Date()
            }
        });
        $scope.text = '';
    };

    //Send request to signaling server
    $scope.startACall = function(){
        var options = {
            template :'modalTemplate.html'
        };
        $scope.showModal(options);
    };

    signalingServer.connect({
        channel:'signaling server',
        from:$scope.client
    });

    //Init pub-nub random channel assign callback to it
    signalingServer.initChannel({
        channel:$scope.client,
        callback:function(message){

            if(message.status == 200){ //Asc  subscriber for a communication
                $scope.inviteToChat(message);

            }else if(message.status == 201){ //Accept call
                notify({message: message.text });
                chat.join({
                    channel:message.from,
                    callback:function(message){
                        $scope.checkMetricsLength(message);
                        $scope.pushMetrics(message);
                        $scope.responseMetrics(message);
                    }
                });
            }
            if(message.status == 204){ //reject answer
                notify({message: message.text });
                $scope.dismiss();
            }
        }
    });


    //Chart.js-AngularJs charts
    $scope.labels = [1,2,3,4,5,6,7,8,9,10];
    $scope.series = ['Delay in ms', 'Byte length of the message'];
    $scope.data = [
        $scope.timingMetrics,
        $scope.byteMetrics
    ];
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };

});

angular.module('myApp').controller('ModalCtrl',['$scope','$modalInstance', 'chat','message',
    function($scope, $modalInstance, chat, message){

    $scope.message =message;
    $scope.to = '';


    $scope.pushNumber = function(number){
        if($scope.to.length < 3)
            $scope.to +=number
    };

    $scope.deleteNumber = function(){
        if($scope.to.length !== 0)
            $scope.to = $scope.to.substring(0,$scope.to.length-1);
    };

    //Init a call to signaling server, asking for a communication with other user
        $scope.makeCall = function(){
           chat.say({
               channel:'signaling server',
                message:{
                    text:$scope.text || null,
                    status:200,
                    to:$scope.to,
                    from:$scope.client
                }
            });
        };

        //reject incoming call
        $scope.rejectCall = function(){
            chat.say({
                channel:'signaling server',
                message:{
                    from:$scope.client,
                    status:204,
                    to:$scope.message.from
                }
            });
            $scope.dismiss();
        };

        //accept incoming call subscribe to user channel for communication
        $scope.acceptCall = function(){
          chat.join({
              channel:$scope.message.from,
              callback:function(message){
                  $scope.checkMetricsLength(message);
                  $scope.pushMetrics(message);
                  $scope.responseMetrics(message);
              }
          });
          chat.say({
              channel:'signaling server',
              message:{
                  status:201,
                  from:$scope.client,
                  to:$scope.message.from
              }
          });
            $scope.dismiss();
        };

    $scope.dismiss = function(){
        $modalInstance.dismiss();
    };
    $scope.close = function(){
        $modalInstance.close();
    };

}]);