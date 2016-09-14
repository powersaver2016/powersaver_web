var personalDirectives = angular.module('personalDirectives', []);

personalDirectives.directive('confirmClick', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      var msg = attr.confirmation || 'Are you sure?';
      var action = attr.confirmClick;
      element.bind('click', function () {
        if (window.confirm(msg)) {
          if (action) scope.$eval(action);
        }
      });
    }
  }
});