angular.module('myApp').controller('ChatCtrl',function($scope, $modal){

    $scope.showModal = function(options){
        $scope.$modalInstance = $modal.open({
            templateUrl:'modalTemplate.html',
            scope:$scope,
            size:'sm',
            controller:'ModalCtrl'
        });
    }
});

angular.module('myApp').controller('ModalCtrl',['$scope','$modalInstance', 'chat','channels',
    function($scope, $modalInstance, chat, channels){
    $scope.client = '';
    $scope.channels = [];

    $scope.pushNumber = function(number){
        if($scope.client.length < 4)
            $scope.client +=number
    };

    $scope.deleteNumber = function(){
        if($scope.client.length !== 0)
            $scope.client = $scope.client.substring(0,$scope.client.length-1);
    };

        channels.get()
            .success(function (data) {
                $scope.channels = data.results;

                for (var i = 0; i < $scope.channels.length; i++) {

                    $scope.channels[i].messages = [];

                    (function (ii) {
                        chat.join({
                            roomName: $scope.channels[ii].name,
                            callback: function (m) {
                                channelCallback(m, $scope.channels[ii]);
                            }
                        });
                    })(i);

                }

                if ($scope.channels.length > 0) {
                    $scope.activeChannel = $scope.channels[0];
                }

            })
            .error(function () {
                alert('error');
            });

        function channelCallback(msg, room) {
            if (!msg.name) {
                msg.name = "Anonymous";
            }
            channels.messages.push(msg);
        }

        $scope.makeCall = function(){
            chat.join(
                { name:'signaling server',
                  callback: function(message){
                if(message.status == 200 && message.client == $scope.client){
                    chat.join($scope.client, function(message){
                       $scope.messages.push(message.text);
                    });
                }else if(message.status == 403 && message.client == $scope.client){
                    alert('Subscriber rejected your call')
                }else if(message.status == 410 && message.client == $scope.client){

                }
            }});
        };

        $scope.connectToSignalingServer = function(){

        };

        $scope.rejectCall = function(){
            chat.publish({
                channel:'signaling server',
                status:403,
                client:$scope.client
            })
        };


        $scope.acceptCall = function(){
          chat.join({
              channel:'',
              callback:function(message){
                  $scope.messages.push(message)
              }
          })
        };

        $scope.endCall = function(){
            $scope.rejectCall();
            channels.leave({
                channel:''
            });
        };


}]);