angular.module('myApp').controller('ChatCtrl',function($rootScope, $scope, $modal, signalingServer){

    $scope.client = (Math.random()*10^0).toString()+(Math.random()*10^0).toString()+(Math.random()*10^0).toString();

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

    $scope.startACall = function(){
        var options = {
            template :'modalTemplate.html'
        }
        $scope.showModal(options);
    }

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
                $scope.showModal(options);
            }
            if(m.status == 201){
                 options = {
                    message:m,
                    template:'acceptModal.html'
                };
                $scope.showModal(options);
            }
            if(m.status == 204){
                options = {
                    message:m,
                    template:'rejectModal.html'
                };
                $scope.showModal(options);
            }
        }
    });
});

angular.module('myApp').controller('ModalCtrl',['$scope','$modalInstance', 'chat','channels', 'signalingServer', 'message',
    function($scope, $modalInstance, chat, channels, signalingServer, message){

    $scope.message = message;
    $scope.messages = [];
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
        };


        $scope.acceptCall = function(){
          chat.join({
              channel:$scope.message.from,
              callback:function(message){
                  $scope.messages.push(message)
              }
          });

          chat.say({
              channel:'signaling server',
              message:{
                  status:201,
                  from:$scope.client,
                  to:$scope.message.from
              }
          })
        };


}]);