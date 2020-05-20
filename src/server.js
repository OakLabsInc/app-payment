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

app.post('/sendCart', function (req, res) {
    //console.log(req.body)
    let paymentPort = process.env.PAYMENT_PORT || 9001
    let terminalIp = process.env.TERMINAL_IP || "192.168.86.245"
    let request = {
      "cart": {
        "total": req.body.total.toString(),
        "taxRate": req.body.taxRate.toString(),
        "tax": req.body.tax.toString(),
        "grandTotal": req.body.grandTotal.toString()
      },
      "terminalIp": terminalIp
    }
    axios.post(`http://localhost:${paymentPort}`, request)
      .then(res => {
        console.log(`statusCode: ${res.statusCode}`)
        console.log(res)
      })
      .catch(error => {
        console.error(error)
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