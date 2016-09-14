var personalApp = angular.module('personalApp', [
  'ngRoute',
  'personalServices',
  'personalControllers',
  'personalDirectives',
  'ng.jsoneditor'
]);


personalApp.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.
    when('/manages', {
      templateUrl: 'public/personalApp/manages.html',
      controller: 'ManageCtr'
    }).
    when('/regions', {
      templateUrl: 'public/personalApp/regions.html',
      controller: 'RegionCtr'
    }).
    when('/regions/:region', {
      templateUrl: 'public/personalApp/buckets.html'
    }).
    when('/regions/:region/buckets/:bucket/profiles', {
      templateUrl: 'public/personalApp/profiles.html'
    }).
    when('/regions/:region/buckets/:bucket/profilesXmlEditor', {
      templateUrl: 'public/personalApp/xmleditor.html'
    }).
    when('/regions/:region/buckets/:bucket/backups/:id', {
      templateUrl: 'public/personalApp/backups.html'
    }).
    otherwise({
      redirectTo: '/regions'
    });
}]);

personalApp.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.interceptors.push('httpErrorInterceptor');
}]);

personalApp.config(['$compileProvider', function($compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
}]);
