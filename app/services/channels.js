
angular.module('myApp').factory('channels', ['$http', function ($http) {

    var appKey = 'Sbww2ApeluUulvolRLdkwI73A1ca4xA5mMak6vXE',
        apiKey = 'TvsLnnwZKH87aaT7LKCHXcofAbhhl0wBFcSroXFN',
        url = 'https://api.parse.com/1/classes/rooms',
        headers = {
            'X-Parse-Application-Id': appKey,
            'X-Parse-REST-API-Key': apiKey
        };
    var channels = [];

    return {
        get: function () {
            return $http({
                method: 'GET',
                url: url,
                headers: headers
            });
        },
        open: function (name) {
            return $http({
                method: 'POST',
                url: url,
                headers: headers,
                data: {
                    name: name
                }
            });
        },
        close:function(id){
            return $http({
                method:'DELETE',
                url:url+'/'+id,
                headers:headers
            })
        },
        add:function(c){
            channels.push(c);
            console.log(channels);
        }
    };
} ]);