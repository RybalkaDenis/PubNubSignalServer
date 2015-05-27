angular.module('myApp').controller('ChatCtrl', function($rootScope, $scope, $modal, signalingServer, notify, chat, lodash){

    $scope.client = (Math.random()*10^0).toString()+(Math.random()*10^0).toString()+(Math.random()*10^0).toString();
    $scope.messages = [];
    $scope.timingMetrics = [0];

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

    signalingServer.initChannel({
        channel:$scope.client,
        callback:function(m){
            if(m.status == 200){
                var options = {
                    message:m,
                    template:'inviteModal.html'
                };
                if(m.from && !$scope.$modalInstance)
                $scope.showModal(options);
            }
            if(m.status == 201){
                notify({message: m.text });
                chat.join({
                    channel:m.from,
                    callback:function(message){
                        $scope.messages.push(message);
                        $scope.timingMetrics.push( new Date() - new Date (message.time ));
                        if($scope.messages.length>6){
                            $scope.messages.splice(0,1)
                        }
                        if($scope.timingMetrics.length>10){
                            $scope.timingMetrics.splice(1,1);
                        }
                    }
                });
               // $scope.close();
            }
            if(m.status == 204){
                notify({message: m.text });
                $scope.dismiss();
            }
        }
    });

    $scope.labels = [1,2,3,4,5,6,7,8,9,10];
    $scope.series = ['Delay in ms'];
    $scope.data = [
        $scope.timingMetrics
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


        $scope.acceptCall = function(){
          chat.join({
              channel:$scope.message.from,
              callback:function(message){
                  if(!message.status){
                      $scope.messages.push(message)
                      $scope.timingMetrics.push( new Date() - new Date (message.time ));
                  }
                  if($scope.messages.length>6){
                      $scope.messages.splice(0,1)
                  }
                  if($scope.timingMetrics.length>10){
                      $scope.timingMetrics.splice(1,1);
                  }
                  //inform messages are disallowed
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