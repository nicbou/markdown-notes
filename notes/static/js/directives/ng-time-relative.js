(function(e){if("function"==typeof bootstrap)bootstrap("ng-time-relative",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeNgTimeRelative=e}else"undefined"!=typeof window?window.ngTimeRelative=e():global.ngTimeRelative=e()})(function(){var define,ses,bootstrap,module,exports;
return (function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0](function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
'use strict';

exports = module.exports = function(module) {
  module.

    constant('timeRelativeConfig', {
      calendar: {
        en: {
          lastDay : '[Yesterday], LT',
          sameDay : '[Today], LT',
          nextDay : '[Tomorrow], LT',
          lastWeek : 'dddd, LT',
          nextWeek : 'Next dddd, LT',
          sameElse : 'LL'
        }
      }
    }).

    directive('relative', ['$timeout', 'moment', directive]).

    run(function(moment, timeRelativeConfig) {
      angular.forEach(timeRelativeConfig.calendar, function(translation, lang) {
        moment.lang(lang, {calendar: translation});
      });
    });
};

exports.directive = directive;

if (angular) {
  var mod = angular.module('timeRelative', []);
  if (moment) {
    mod.constant('moment', moment);
    moment.lang('en', {});
  }
  exports(mod);
}

function directive($timeout, moment) {
  return {
    restrict: 'AC',
    scope: {
      datetime: '@'
    },
    link: function(scope, element, attrs) {
      var timeout;

      scope.$watch('datetime', function(dateString) {
        $timeout.cancel(timeout);

        var date = moment(dateString);
        if (!date) return;
        var to = function() { return moment(attrs.to); };
        var withoutSuffix = 'withoutSuffix' in attrs;

        if (!attrs.title)
          element.attr('title', date.format('LLLL'));

        function updateTime() {
          element.text(diffString(date, to()));
        }

        function diffString(a, b) {
          if (Math.abs(a.clone().startOf('day').diff(b, 'days', true)) < 1)
            return a.from(b, withoutSuffix);
          else
            return a.calendar(b);
        }

        function updateLater() {
          updateTime();
          timeout = $timeout(function() {
            updateLater();
          }, nextUpdateIn());
        }

        function nextUpdateIn() {
          var delta = Math.abs(moment().diff(date));
          if (delta < 45e3) return 45e3 - delta;
          if (delta < 90e3) return 90e3 - delta;
          if (delta < 45 * 60e3) return 60e3 - (delta + 30e3) % 60e3;
          return 3660e3 - delta % 3600e3;
        }

        element.bind('$destroy', function() {
          $timeout.cancel(timeout);
        });

        updateLater();
      });
    }
  };
}

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvc3RlcGhhbi9Db2RlL25nLXRpbWUtcmVsYXRpdmUvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtb2R1bGUpIHtcbiAgbW9kdWxlLlxuXG4gICAgY29uc3RhbnQoJ3RpbWVSZWxhdGl2ZUNvbmZpZycsIHtcbiAgICAgIGNhbGVuZGFyOiB7XG4gICAgICAgIGVuOiB7XG4gICAgICAgICAgbGFzdERheSA6ICdbWWVzdGVyZGF5XSwgTFQnLFxuICAgICAgICAgIHNhbWVEYXkgOiAnW1RvZGF5XSwgTFQnLFxuICAgICAgICAgIG5leHREYXkgOiAnW1RvbW9ycm93XSwgTFQnLFxuICAgICAgICAgIGxhc3RXZWVrIDogJ2RkZGQsIExUJyxcbiAgICAgICAgICBuZXh0V2VlayA6ICdOZXh0IGRkZGQsIExUJyxcbiAgICAgICAgICBzYW1lRWxzZSA6ICdMTCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLlxuXG4gICAgZGlyZWN0aXZlKCdyZWxhdGl2ZScsIFsnJHRpbWVvdXQnLCAnbW9tZW50JywgZGlyZWN0aXZlXSkuXG5cbiAgICBydW4oZnVuY3Rpb24obW9tZW50LCB0aW1lUmVsYXRpdmVDb25maWcpIHtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0aW1lUmVsYXRpdmVDb25maWcuY2FsZW5kYXIsIGZ1bmN0aW9uKHRyYW5zbGF0aW9uLCBsYW5nKSB7XG4gICAgICAgIG1vbWVudC5sYW5nKGxhbmcsIHtjYWxlbmRhcjogdHJhbnNsYXRpb259KTtcbiAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuZXhwb3J0cy5kaXJlY3RpdmUgPSBkaXJlY3RpdmU7XG5cbmlmIChhbmd1bGFyKSB7XG4gIHZhciBtb2QgPSBhbmd1bGFyLm1vZHVsZSgndGltZVJlbGF0aXZlJywgW10pO1xuICBpZiAobW9tZW50KSB7XG4gICAgbW9kLmNvbnN0YW50KCdtb21lbnQnLCBtb21lbnQpO1xuICAgIG1vbWVudC5sYW5nKCdlbicsIHt9KTtcbiAgfVxuICBleHBvcnRzKG1vZCk7XG59XG5cbmZ1bmN0aW9uIGRpcmVjdGl2ZSgkdGltZW91dCwgbW9tZW50KSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBQycsXG4gICAgc2NvcGU6IHtcbiAgICAgIGRhdGV0aW1lOiAnQCdcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgdmFyIHRpbWVvdXQ7XG5cbiAgICAgIHNjb3BlLiR3YXRjaCgnZGF0ZXRpbWUnLCBmdW5jdGlvbihkYXRlU3RyaW5nKSB7XG4gICAgICAgICR0aW1lb3V0LmNhbmNlbCh0aW1lb3V0KTtcblxuICAgICAgICB2YXIgZGF0ZSA9IG1vbWVudChkYXRlU3RyaW5nKTtcbiAgICAgICAgaWYgKCFkYXRlKSByZXR1cm47XG4gICAgICAgIHZhciB0byA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gbW9tZW50KGF0dHJzLnRvKTsgfTtcbiAgICAgICAgdmFyIHdpdGhvdXRTdWZmaXggPSAnd2l0aG91dFN1ZmZpeCcgaW4gYXR0cnM7XG5cbiAgICAgICAgaWYgKCFhdHRycy50aXRsZSlcbiAgICAgICAgICBlbGVtZW50LmF0dHIoJ3RpdGxlJywgZGF0ZS5mb3JtYXQoJ0xMTEwnKSk7XG5cbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlVGltZSgpIHtcbiAgICAgICAgICBlbGVtZW50LnRleHQoZGlmZlN0cmluZyhkYXRlLCB0bygpKSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBkaWZmU3RyaW5nKGEsIGIpIHtcbiAgICAgICAgICBpZiAoTWF0aC5hYnMoYS5jbG9uZSgpLnN0YXJ0T2YoJ2RheScpLmRpZmYoYiwgJ2RheXMnLCB0cnVlKSkgPCAxKVxuICAgICAgICAgICAgcmV0dXJuIGEuZnJvbShiLCB3aXRob3V0U3VmZml4KTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gYS5jYWxlbmRhcihiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUxhdGVyKCkge1xuICAgICAgICAgIHVwZGF0ZVRpbWUoKTtcbiAgICAgICAgICB0aW1lb3V0ID0gJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB1cGRhdGVMYXRlcigpO1xuICAgICAgICAgIH0sIG5leHRVcGRhdGVJbigpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG5leHRVcGRhdGVJbigpIHtcbiAgICAgICAgICB2YXIgZGVsdGEgPSBNYXRoLmFicyhtb21lbnQoKS5kaWZmKGRhdGUpKTtcbiAgICAgICAgICBpZiAoZGVsdGEgPCA0NWUzKSByZXR1cm4gNDVlMyAtIGRlbHRhO1xuICAgICAgICAgIGlmIChkZWx0YSA8IDkwZTMpIHJldHVybiA5MGUzIC0gZGVsdGE7XG4gICAgICAgICAgaWYgKGRlbHRhIDwgNDUgKiA2MGUzKSByZXR1cm4gNjBlMyAtIChkZWx0YSArIDMwZTMpICUgNjBlMztcbiAgICAgICAgICByZXR1cm4gMzY2MGUzIC0gZGVsdGEgJSAzNjAwZTM7XG4gICAgICAgIH1cblxuICAgICAgICBlbGVtZW50LmJpbmQoJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHRpbWVvdXQpO1xuICAgICAgICB9KTtcblxuICAgICAgICB1cGRhdGVMYXRlcigpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuIl19(1)
});
;