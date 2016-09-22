(function() {
  'use strict';

  var core = angular.module('core');

  // the expando directive handles most (if not all) of its functionalit within the
  // pre and post compile phases of the rendering phase. This is because it must
  // form itself around everything inside it and thus should be done prior to displaying
  // itself.
  core.directive('smpExpando', ['$timeout', function($timeout) {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      templateUrl: 'app/templates/core/t-expando.html',
      scope: true,
      compile: function(element, attr) {
        return {
          pre: function prelink(scope, element, attrs) {
            // the pre function figures out if the expando is open or close
            // it is assumed that all expandos start colapsed thus the Number
            // of toggles is incremented if it is open
            $timeout(function() {
              scope.open = (attr.open === 'true');
              scope.toggles = 0;
              if (!scope.open) scope.toggles += 1;
            }, 0);
          },
          post: function postLink(scope, element, attrs) {
            // the post functions figures out the size of the expando, and any other styles
            // it should be given
            $timeout(function() {
              // the elevation attribute describes the shadow that the element should have
              // applied to it
              scope.elevation = attr.elevation ? 'md-whiteframe-' + attr.elevation + 'dp' : '';
              // the target is the expando's content itself (excluding the toggling button)
              scope.target = attr.target;

              // Get element and its open height
              scope.toggleElem = scope.contentElem = element.find('[smp-expando-toggle]');
              scope.contentElem = angular.element(element.find('[smp-expando-content= ' + scope.target + ']'));

              // calculate the total padding height
              var contentContainer = scope.contentElem.find('.contentContainer');
              var paddingTop = contentContainer.css('padding-top');
              var paddingBottom = contentContainer.css('padding-bottom');
              scope.padding = (paddingTop && paddingBottom) ? Number(paddingTop.replace('px', '')) + Number(paddingBottom.replace('px', '')) : 0;

              // extra hight to pad bottom like top
              scope.contentHeight = scope.contentElem[0].clientHeight + scope.padding;

              // Give element the general css
              scope.toggleElem.css({
                'position': 'relative',
                'z-index': '110',
              });
              scope.contentElem.css({
                'position': 'relative',
                'z-index': '100',
                'overflow': 'hidden',
                'margin-top': 0,
                'transition': 'height 1s ease-in-out',
              });
              // do stuff to open or close it
              if (scope.open) {
                scope.toggles++;
                scope.contentElem.css({
                  'height': scope.contentHeight + 'px',
                });
              } else {
                scope.contentElem.css({
                  'height': 0,
                });
              }
            }, 0);
          }
        };
      }
    };
  }]);

  // the expando toggle handle the calls needed to expand and collapse the conent of the expando
  core.directive('smpExpandoToggle', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      scope: false,
      compile: function(element, attr) {
        return {
          pre: function prelink(scope, element, attrs) {
            // using the parents scope (this must be the expando itself)
            // figure out if the expando is open or closed
            $timeout(function() {
              scope.toggles = scope.$parent.toggles;
              scope.open = scope.$parent.open;
            }, 0);
          },
          post: function postLink(scope, element, attrs) {
            $timeout(function() {

              element.bind('click', function() {
                scope.$parent.doingAction = true;
                $timeout.cancel(scope.doingActionListener);

                // functionality to open and close expando
                if (!scope.$parent.open) { // if the expand is expanding
                  scope.$parent.contentElem.css({
                    'height': scope.$parent.contentHeight + 'px',
                  });
                } else { // if the expand is collapsing
                  scope.$parent.contentElem.css({
                    'height': 0,
                  });
                }

                // keep track of parents scope vars
                scope.$parent.toggles++;
                scope.$parent.open = !scope.$parent.open;
                scope.toggles++;
                scope.open = !scope.open;

                // since this is all in the parent scope we need to manually call apply (new digest cycle)
                scope.$parent.$apply();

                scope.doingActionListener = $timeout(function() {
                  scope.$parent.doingAction = false;
                }, 1000);
              });
            }, 0);
          }
        };
      }
    };
  }]);

  // the expando content handles resizing itself if the content has changed size within it
  core.directive('smpExpandoContent', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      scope: false,
      compile: function(element, attr) {
        return {
          post: function postlink(scope, element, attrs) {
            $timeout(function() {
              // used to only check every second even though the watch will get triggered every digest
              var checkedRecently = false;
              // every digest see if the height of the content has changed. If it has update the smp-expando-content's height
              scope.$watch(function() {
                if (!checkedRecently) {
                  checkedRecently = true;
                  if (scope.$parent.contentHeight) {
                    var newHeight = getHeight(element) + scope.$parent.padding;
                    if (scope.$parent.open && !scope.$parent.doingAction && newHeight && newHeight !== scope.$parent.contentHeight) {
                      updateHeight(scope.$parent, newHeight);
                    }
                  }
                  // wait for 1 second before resetting flag an allowing checks
                  $timeout(function() {
                    checkedRecently = false;
                  }, 1000);
                }
              });
            }, 0);
          },
        };
      }
    };
  }]);

  function updateHeight(elem, height) {
    elem.contentHeight = height;
    elem.contentElem.css({
      'height': height + 'px',
    });
  }
  // returns the height of the contentContainer
  function getHeight(element) {
    return element.find('.contentContainer').height();
  }
})();
