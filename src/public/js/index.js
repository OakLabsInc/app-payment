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

app.controller('appController', function ($log, $sce, $timeout, $mdDialog, $scope, $http, $window, oak, _) {
 
 
  $scope.cart = {}
  $scope.cart.total = 20.2
  $scope.cart.taxRate = .085

  $scope.paymentSent = false
  let paymentStatus = "Transaction In Progress" 
  $scope.paymentStatus = paymentStatus

  $scope.sendCart = function(cart, ev) {
    $scope.paymentSent = true
    $mdDialog.show({
      scope: $scope,
      preserveScope: true,
      contentElement: '#transactionInProgress',
      parent: window.angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      fullscreen: false
    })
    $http({
      method: 'POST',
      url: `http://localhost:${$scope.env.PORT}/sendCart`,
      data: $scope.cart
    }).then(function(success) {
      console.log("REQUEST SENT : ", success)
    }, function(error) {
      console.log("ERROR: ", error)
    })
  }
  $scope.calculateTotal = function() {
    $scope.cart.tax = parseFloat($scope.cart.taxRate) * parseFloat($scope.cart.total)
    $scope.cart.grandTotal = parseFloat($scope.cart.total) + parseFloat($scope.cart.tax)
  }

  $scope.printReceipt = function(cart){
    console.log("Cart: ", cart)
    let subtotal = _(cart).sumBy('total')
    let tax = subtotal * .086
    let total = _(cart).sumBy('total') + tax
    $http({
      method: 'POST',
      url: `http://localhost:${$scope.env.PORT}/print-receipt`,
      data: {
              'cart': cart,
              'env': $scope.env,
              'subtotal': subtotal,
              'tax': tax,
              'total': total
            }
    }).then(function successCallback (success) {
      console.log(success)
  
    }, function errorCallback (error) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    })
  }

  oak.on('paymentResponse', function(resObj){
    $timeout(function(){    
      $scope.paymentSent = false
      $scope.paymentStatus = resObj.data.status
      console.log("TERMINAL RESPONSE: ", resObj)
    })
  })

  oak.on('env-sent',function(obj){
        
    $timeout(function(){
      $scope.env = obj
      console.log("ENVIRONMENT: ", $scope.env)
    })
  })


  $scope.closePaymentStatus = function(){
    $mdDialog.hide()
    
  }
  $scope.calculateTotal()
  oak.ready()
  $http.get('/env').then(function(success){
    $timeout(function(){
      $scope.env = success.data
    })
  }, function(error) {

  })
})
