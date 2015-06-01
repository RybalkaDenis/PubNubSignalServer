angular.module('myApp').controller('ChatCtrl', function($rootScope, $scope, $modal, signalingServer, notify, chat, $http, $interval,$window, $state){

    $scope.client = (Math.random()*10^0).toString()+(Math.random()*10^0).toString()+(Math.random()*10^0).toString();
    $scope.messages = [];
    $scope.timingMetrics = [];
    $scope.byteMetrics = [];
    $scope.scale=[0];
    $scope.messageSize = '';
    $scope.interval = '';
    $scope.text ='';
    $scope.timer = '';

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
    $scope. byteCount = function (s) {
        return encodeURI(s).split(/%..|./).length - 1;
    };


    $scope.makeMessage = function(size){
        if(size-$scope.byteCount($scope.text)>=100){
            //Add 100 bytes to message
            $scope.text +='ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss';
            $scope.makeMessage(size)
        }else if(size-$scope.byteCount($scope.text)>=10){
            $scope.text+='ssssssssss';
            $scope.makeMessage(size)
        }else if(size-$scope.byteCount($scope.text)>=1) {
            $scope.text += 's';
            $scope.makeMessage(size)
        }
        return $scope.text;
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

    //Scale charts on key press
    $scope.scaleCharts = function(scale){
        $scope.scale[0] = Math.ceil(($scope.timingMetrics.reduce(function(a,b){
            return a+b;
        })/$scope.timingMetrics.length-1)*scale);
    };

    //Public message in channel and push it to array that will be rendered to user
    $scope.sendMessage = function(){
        if(!$scope.messageSize){
            notify({message: 'Set message size`' });
            return
        }
        if(!$rootScope.connection){
            notify({message: 'There is no active connection' });
            return
        }
        chat.say({
            channel:$scope.client,
            message: {
                channel: $scope.client,
                message: $scope.makeMessage($scope.messageSize),
                time: new Date()
            }
        });
        $scope.text = '';
        $http.get('/metrics')
            .success(function(response){
                $scope.messages = response.messages;
                $scope.timingMetrics =response.timingMetrics;
                $scope.byteMetrics = response.byteMetrics;
            })
            .error(function(){
                console.log('Error has occurred')
            });
    };


    //Open/close stream with messages
    $scope.streamMessages = function(){

        if(!$scope.interval){
            notify({message: 'Set streaming interval`' });
            return
        }
        if($scope.timer){
            $interval.cancel($scope.timer);
            $scope.timer = null;
            notify({message: 'Stream is closed'});
            return
        }else{
            $scope.timer = $interval($scope.sendMessage, $scope.interval);
            notify({message: 'Stream is open' });
        }
    };

    //Get metrics from mongoDB
    $scope.getMetrics = function(){
        $http.get('/allmetrics')
            .success(function(response){
                $scope.metricRows = response;
                $state.go('main.metrics');

            })
    };

    //Drop data base clear metrics collection in mongoDb
    $scope.dropDataBase = function(){
        var isSure = confirm('Do you want to drop database?');
        if(isSure){
            $http.delete('/metrics')
                .success(function(response){
                    if(response.ok == 1){
                        notify({message: 'You\'ve deleted '+response.n+' messages from database' });
                    }
                })
        }
    };

    //Send request to signaling server
    $scope.startACall = function(){
        var options = {
            template :'modalTemplate.html'
        };
        $scope.showModal(options);
    };

    //Init pub-nub random channel assign callback to it
    signalingServer.initChannel({
        channel:$scope.client,
        callback:function(message){

            if(message.status == 200){ //Asc  subscriber for a communication
                $scope.inviteToChat(message);

            }else if(message.status == 201){ //Accept call
                $rootScope.connection = true;
                notify({message: message.text });
                chat.join({
                    channel:[message.from,$scope.client],
                    callback:function(message){
                        $http.get('/metrics')
                            .success(function(response){
                                $scope.messages = response.messages;
                                $scope.timingMetrics = response.timingMetrics;
                                $scope.byteMetrics = response.byteMetrics;
                            })
                            .error(function(){
                                console.log('Error has occurred')
                            })
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
    $scope.series = ['Delay in ms', 'Byte length of the message', 'Scale'];

    $scope.$watch('messages',function(){
        $scope.data = [
            $scope.timingMetrics,
            $scope.byteMetrics,
            $scope.scale
        ];
    })
});

angular.module('myApp').controller('ModalCtrl',['$scope','$modalInstance', 'chat','message', '$http', '$rootScope',
    function($scope, $modalInstance, chat, message, $http, $rootScope){

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
            $rootScope.connection = true;
          chat.join({
              channel:[message.from,$scope.client],
              callback:function(message){

                  $http.get('/metrics')
                      .success(function(response){
                          $scope.messages = response.messages;
                          $scope.timingMetrics = response.timingMetrics;
                          $scope.byteMetrics = response.byteMetrics;
                      })
                      .error(function(){
                          console.log('Error has occurred')
                      })
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