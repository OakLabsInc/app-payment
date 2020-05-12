window.oak.disableZoom()

window.reload = function () {
  window.oak.reload()
}

var app = window.angular
  .module('demoApp', ['ngMaterial'])
  .constant('oak', window.oak)
  .constant('_', window._)

  .config(function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['self'])
  })

app.controller('appController', function ($log, $sce, $timeout, $scope, $http, $window, oak, _) {
 
 
  $scope.cart = {}
  $scope.cart.total = 20.2
  $scope.cart.taxRate = .085

  $scope.sendCart = function(cart) {
    $http({
      method: 'POST',
      url: 'http://localhost:9000/sendCart',
      data: $scope.cart
    }).then(function(success) {
      console.log("SUCCESS: ", success)
    }, function(error) {
      console.log("ERROR: ", error)
    })
  }
  $scope.calculateTotal = function() {
    $scope.cart.tax = parseFloat($scope.cart.taxRate) * parseFloat($scope.cart.total)
    $scope.cart.grandTotal = parseFloat($scope.cart.total) + parseFloat($scope.cart.tax)
  }
  $scope.calculateTotal()
  oak.ready()
})
