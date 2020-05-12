const oak = require('oak')
oak.catchErrors()
const request = require('request')
const express = require('express')
const stylus = require('stylus')
const bodyParser = require('body-parser')

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

app.get('/send-cart', function (req, res) {
    console.log(req)
    let paymentPort = process.env.PAYMENT_PORT || 9001
    
    request.post(
      `http://localhost:${paymentPort}`,
      {
        json: {
          total: cartTotal,
          tax: cartTax
        }
      },
      (error, res, body) => {
        if (error) {
          console.error(error)
          return
        }
        console.log(`statusCode: ${res.statusCode}`)
        console.log(body)
      }
    )
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