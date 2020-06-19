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
  .run(function ($rootScope) {
    $rootScope._ = window.lodash
  })

app.controller('appController', function ($log, $sce, $timeout, $mdDialog, $scope, $http, $window, oak, _) {
 
  $scope.debug = false
  $scope.item = {}
  $scope.item.subtotal = 20.2
  $scope.item.taxRate = .085
  $scope.count = 2
  $scope.cart = []
  $scope.paymentSent = false
  let paymentStatus = "Transaction In Progress" 
  $scope.paymentStatus = paymentStatus

  $http.get('/env').then(function(success){
    $timeout(function(){
      $scope.env = success.data
      console.log("ENVIRONMENT: ", $scope.env)
    })
  }, function(error) {
    console.log("ERROR: ", error)
  })
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

    // This sends the cart to the node side for processing
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
    $scope.item.tax = parseFloat($scope.item.taxRate) * parseFloat($scope.item.subtotal)
    $scope.item.total = parseFloat($scope.item.subtotal) + parseFloat($scope.item.tax)
    let items=[]
    for(i=1;i<=$scope.count;i++){
      items.push({
        name: `Item ${i}`,
        subtotal: $scope.item.subtotal,
        taxRate: $scope.item.taxRate,
        total: $scope.item.total
      })
    }
    let subtotal = _(items).sumBy('subtotal')
    let tax = subtotal * $scope.item.taxRate
    let total = _(items).sumBy('subtotal') + tax

    $scope.cart = {
      'items': items,
      'total': subtotal,
      'tax': tax,
      'taxRate': $scope.item.taxRate,
      'grandTotal': total
    }
 
  }

  $scope.printReceipt = function(cart){
    console.log("Cart: ", cart)
    let items=[]
    for(var i=0;i<$scope.items_number;i++){
      items.push({
        name: `Item ${i}`,
        price: $scope.item.subtotal
      })
    }
    let subtotal = _(items).sumBy('total')
    let tax = subtotal * cart.taxRate
    let total = _(items).sumBy('total') + tax

    $http({
      method: 'POST',
      url: `http://localhost:${$scope.env.PORT}/print-receipt`,
      data: {
              'items': cart.items,
              'env': $scope.env,
              'subtotal': cart.total,
              'tax': cart.tax,
              'taxLabel': parseFloat($scope.item.taxRate * 100).toFixed(2) + "%",
              'total': cart.grandTotal
            }
    }).then(function successCallback (success) {
      console.log(success)
  
    }, function errorCallback (error) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    })
  }

  oak.on('payment-response', function(resObj){
    $timeout(function(){    
      $scope.paymentSent = false
      $scope.paymentStatus = resObj.data.status
      console.log("TERMINAL RESPONSE: ", resObj)
    })
  })
  oak.on('print-response', function(resObj){
    console.log("PRINT_RESPONSE: ", resObj)
    $timeout(function(){    
      $mdDialog.hide()
      $scope.paymentStatus = paymentStatus
    })
  })



  $scope.closePaymentStatus = function(){
    $mdDialog.hide()
    $scope.paymentStatus = paymentStatus
  }
  $scope.calculateTotal()
  
})
