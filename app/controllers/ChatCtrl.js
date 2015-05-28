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
        $scope.messages.push({
            channel:$scope.client,
            message:$scope.text
        });

        if($scope.messages.length>6){
            $scope.messages.splice(0,1)
        }
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
        callback:function(m){
            if(m.status == 200){ //Asc  subscriber for a communication
                var options = {
                    message:m,
                    template:'inviteModal.html'
                };
                if(m.from && !$scope.$modalInstance)
                $scope.showModal(options);
            }
            if(m.status == 201){ //Accept call
                notify({message: m.text });
                chat.join({
                    channel:m.from,
                    callback:function(message){
                        $scope.messages.push(message);
                        $scope.timingMetrics.push( new Date() - new Date (message.time ));
                        $scope.byteMetrics.push($scope.byteCount(message.message));

                        if($scope.messages.length>6){
                            $scope.messages.splice(0,1)
                        }
                        if($scope.timingMetrics.length>10){
                            $scope.timingMetrics.splice(0,1);
                        }
                        if($scope.byteMetrics.length>10){
                            $scope.byteMetrics.splice(0,1);
                        }
                    }
                });
               // $scope.close();
            }
            if(m.status == 204){ //Leave channel
                notify({message: m.text });
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
                  //inform messages are disallowed
                  if(!message.status){
                      $scope.messages.push(message);
                      $scope.timingMetrics.push( new Date() - new Date (message.time ));
                      $scope.byteMetrics.push($scope.byteCount(message.message));
                  }
                  if($scope.messages.length>6){
                      $scope.messages.splice(0,1)
                  }
                  if($scope.timingMetrics.length>10){
                      $scope.timingMetrics.splice(0,1);
                  }
                  if($scope.byteMetrics.length>10){
                      $scope.byteMetrics.splice(0,1);
                  }
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