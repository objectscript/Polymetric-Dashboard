(function() {
  'use strict';

  // initialize all the modules used
  angular.module('core', []);
  angular.module('overlay', []);
  angular.module('visualizers', []);
  angular.module('tabs', []);
  angular.module('showcase', []);
  angular.module('filters', []);

  var DashboardApp = angular.module('Dashboard', [
    'ngMaterial', 'ngMessages', 'ngAnimate', 'ngSanitize', 'angular-bind-html-compile', 'ngStorage', /* Angular modules */
    'dashboardApi', 'Widgets', /* services  */
    'tabs', 'showcase', /* controller/directive modules for content on specific pages */
    'core', 'visualizers', 'filters', /* controller/directive modules for shared app content across pages */
    'overlay' /* controller/directive modules for content overlaying pages */
  ]);

  // defninition of the theme of the app (most of these colors are not used by default, but cannot hurt to be here)
  DashboardApp.config(function($mdThemingProvider) {
    var customPrimary = {
      50: '#76aacb',
      100: '#639fc5',
      200: '#5194be',
      300: '#4387b2',
      400: '#3c799f',
      500: '#356B8D',
      600: '#2e5d7a',
      700: '#274f68',
      800: '#204155',
      900: '#193343',
      A100: '#88b6d2',
      A200: '#9bc1d9',
      A400: '#aecde0',
      A700: '#122530',
      contrastDefaultColor: 'light' // whether, by default, text (contrast)
    };
    $mdThemingProvider
      .definePalette('customPrimary',
        customPrimary);

    var customAccent = {
      50: '#ffcc80',
      100: '#ffc166',
      200: '#ffb74d',
      300: '#ffad33',
      400: '#ffa21a',
      500: '#FF9800',
      600: '#e68900',
      700: '#cc7a00',
      800: '#b36a00',
      900: '#995b00',
      A100: '#ffd699',
      A200: '#ffe0b3',
      A400: '#ffeacc',
      A700: '#804c00',
      contrastDefaultColor: 'light'
    };
    $mdThemingProvider
      .definePalette('customAccent',
        customAccent);

    var customWarn = {
      50: '#fbb4af',
      100: '#f99d97',
      200: '#f8877f',
      300: '#f77066',
      400: '#f55a4e',
      500: '#F44336',
      600: '#f32c1e',
      700: '#ea1c0d',
      800: '#d2190b',
      900: '#ba160a',
      A100: '#fccbc7',
      A200: '#fde1df',
      A400: '#fff8f7',
      A700: '#a21309'
    };
    $mdThemingProvider
      .definePalette('customWarn',
        customWarn);

    var customBackground = {
      50: '#ffffff',
      100: '#ffffff',
      200: '#ffffff',
      300: '#f6f6f6',
      400: '#eaeaea',
      500: '#ddd',
      600: '#d0d0d0',
      700: '#c3c3c3',
      800: '#b7b7b7',
      900: '#aaaaaa',
      A100: '#ffffff',
      A200: '#ffffff',
      A400: '#ffffff',
      A700: '#9d9d9d'
    };
    $mdThemingProvider
      .definePalette('customBackground',
        customBackground);

    $mdThemingProvider.theme('default')
      .primaryPalette('customPrimary')
      .accentPalette('customAccent', {
        'default': '500'
      })
      .warnPalette('customWarn')
      .backgroundPalette('customBackground');
  });
})();
