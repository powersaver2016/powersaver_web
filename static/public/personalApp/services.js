var personalServices = angular.module('personalServices', ['ngResource']);

personalServices.factory('Region', ['$resource', function ($resource) {
  return $resource('personal/regions/:region', {}, {});
}]);

personalServices.factory('GerritProfile', ['$resource', function ($resource) {
  return $resource(
    'manage/gerrit',
    {change: '@change'},
    {
      updateByChange: {method: 'PUT', url: 'manage/gerrit/changes/:change', params: {change: '@change', env: '@env'}, isArray: false},
      reset: {method: 'POST', url: 'manage/gerrit/reset', isArray: false}
    }
  );
}]);

personalServices.factory('Relation', ['$resource', function ($resource) {
  return $resource('personal/regions/:region/users/:username', {region: '@region'}, {});
}]);

personalServices.factory('Sid', ['$resource', function ($resource) {
  return $resource(
    'personal/regions/:region/sids/:sid',
    {region: '@region'},
    {
      update: {method: 'PUT', url: 'personal/regions/:region/sids/:sid', params: {region: '@region', sid: '@sid'}}
    }
  );
}]);

personalServices.factory('Bucket', ['$resource', function ($resource) {
  return $resource('personal/regions/:region/buckets/:bucket', {region: '@region'}, {});
}]);

personalServices.factory('Backup', ['$resource', function ($resource) {
  return $resource('personal/regions/:region/buckets/:bucket/backups/:id', {region: '@region', bucket: '@bucket'}, {});
}]);
personalServices.factory('Profile', ['$resource', function ($resource) {
  return $resource(
    'personal/regions/:region/buckets/:bucket/profiles/:priority',
    {region: '@region', bucket: '@bucket'},
    {
      query: {method: 'GET', params: {regions: '@region', buckets: '@bucket'}, isArray: false},
      update: {method: 'POST', url: 'personal/regions/:region/buckets/:bucket/profiles', params: {region: '@region', bucket: '@bucket'}},
      updateFile: {method: 'POST', url: 'personal/regions/:region/buckets/:bucket/fileProfiles', params: {region: '@region', bucket: '@bucket'}},
      getContent: {method: 'POST', url: 'personal/regions/:region/buckets/:bucket/profileContent', params: {region: '@region', bucket: '@bucket'}, isArray: true},
      getFileContent: {method: 'POST', url: 'personal/regions/:region/buckets/:bucket/fileProfileContent', params: {region: '@region', bucket: '@bucket'}, isArray: true},
      deleteAll: {method: 'DELETE', url: 'personal/regions/:region/buckets/:bucket/profiles', params: {region: '@region', bucket: '@bucket'}}
    }
  );
}]);

personalServices.factory('Count', ['$resource', function ($resource) {
  return $resource(
    'personal/regions/:region/buckets/:bucket/counts/:type',
    {region: '@region', bucket: '@bucket'},
    {
      update: {method: 'PUT', url: 'personal/regions/:region/buckets/:bucket/counts/:type/:count', params: {region: '@region', bucket: '@bucket', type: '@type', count:'@count'}},
      updateAll: {method: 'POST', url: 'personal/regions/:region/buckets/:bucket/counts', params: {region: '@region', bucket: '@bucket'}}
    }
  );
}]);

personalServices.factory('httpErrorInterceptor', ['$q', '$log', function ($q, $log) {
  return {
    'response': function (response) {
      $log.debug(response.data);
      return response;
    },

    'responseError': function (rejection) {
      $log.warn(rejection.data);
      alert(rejection.data);
      return $q.reject(rejection);
    }
  }
}]);
