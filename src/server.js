const oak = require('oak')
oak.catchErrors()
const express = require('express')
const stylus = require('stylus')
const bodyParser = require('body-parser')
const axios = require('axios')

const { join } = require('path')
const _ = require('lodash')

const app = express()
const port = process.env.PORT ? _.toNumber(process.env.PORT) : 9000

require('dotenv').config()

let publicPath = join(__dirname, 'public')
let viewsPath = join(__dirname, 'views')
console.log(process.env.TZ)
app.set('views', viewsPath)
app.set('view engine', 'pug')
app.use(stylus.middleware({
    src: viewsPath,
    dest: join(publicPath, 'css')
}))
app.use(bodyParser.json());
app.use(express.static(publicPath))

app.listen(port, function () {
    oak.on('ready', () => loadWindow())
})

app.get('/', function (req, res) {
  res.render('index')
})

app.get('/env', function(req, res) {
  let env = {...process.env}
  console.log("ENV: ", env)
  res.json(env)
})

app.post('/sendCart', function (req, res) {
    //console.log(req.body)
    let paymentPort = process.env.PAYMENT_PORT || 8003
    let paymentHost = process.env.HOST || "localhost"
    let terminalIp = process.env.TERMINAL_IP || "192.168.86.43"
    let request = {
      "cart": {
        "total": req.body.total.toString(),
        "taxRate": req.body.taxRate.toString(),
        "tax": req.body.tax.toString(),
        "grandTotal": req.body.grandTotal.toString()
      },
      "terminalIp": terminalIp
    }
    // console.log(request)
    axios.post(`http://${paymentHost}:${paymentPort}`, request)
      .then(res => {
        console.log(`statusCode: ${res.statusCode}`)
        console.log("paymentResponse: ", res)
        window.send('paymentResponse', res)
      })
      .catch(error => {
        console.error(error)
      })
  res.json({
    message: "Object Sent to payment component",
    cart: request
  })

    
})

app.post('/printer-attributes', async function(req, res) {
  let printers = await printer.getPrinterAttributes(printerName, function(name, ppd){
    res.json({
      message: "Sent To Printer",
      data: {
        ppd: ppd,
        name: name
      }
    })
  })
})

app.post('/print-receipt', async function(req, res) {
  console.log("Print request", req.body)
  req.body.service = service
  
  let receipt = await printer.printReceipt(printerName, req.body, function(data){
    res.json({
      message: "Receipt Sent To Printer",
      data: data
    })
  })
})

async function loadWindow () {
    console.log({
      message: `Started on port ${port}`
    })

    window = oak.load({
      url: `http://localhost:${port}/`,
      ontop: false,
      insecure: true,
      flags: ['enable-vp8-alpha-playback'],
      sslExceptions: ['localhost'],
      background: '#ffffff',
      scripts: [
        {
          name: 'lodash',
          path: 'lodash'
        },
        {
          name: 'uuid',
          path: 'uuid'
        }
      ]
    })



  }