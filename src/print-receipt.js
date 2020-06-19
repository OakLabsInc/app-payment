const ipp = require('ipp');
const PDFDocument = require('pdfkit');
const concat = require("concat-stream")
const { join } = require('path')
const fs = require('fs')
const printer = require(join(__dirname, 'print-receipt'))
const printerName = process.env.PRINTER_NAME || "http://localhost:631/printers/TM-T88V"

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

let top = 10
let left = 10
let lineWidth = 200
let lineHeight = 20

function generateHr(doc) {
  doc.strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(left, top)
      .lineTo(lineWidth, top)
      .stroke()
  top += (lineHeight / 2)
}

function generateImage(doc, imageUrl, x) {
  doc.image(imageUrl, (x / 2), top, {width: x} )
  top += x
}

function itemLine(doc, name, price){
  let newPrice = formatCurrency(price)
  doc.text(name, left, top )
  doc.moveUp()
  doc.text(newPrice,{align:'right', width: (lineWidth - left)} )
  top += lineHeight
}

function emptyText(doc)
{
  doc.text(" ")
  doc.moveDown()
}

function formatCurrency(price) {
  let newPrice = parseFloat(price).toFixed(2).toString()
  return "$" + newPrice
}

async function printReceipt (printerName, data, cb) {

  let doc = new PDFDocument({margin:0});
  let items = data.items
  let subtotal = data.subtotal
  let tax = data.tax
  let taxRate = data.taxRate
  let taxLabel = data.taxLabel
  let total = data.total

  let logoUrl = join(__dirname, "public", "images","printer-logo.png")
  let qrcodeUrl = join(__dirname, "public", "images","printer-qrcode.png")
  console.log(logoUrl, qrcodeUrl)

  doc.fontSize(10)
  generateHr(doc)
  emptyText(doc)
  emptyText(doc)
  generateImage(doc,logoUrl, 100)
  generateHr(doc)
  for(i in items) {
    itemLine(doc, capitalize(items[i].name) , items[i].subtotal)
  }

  generateHr(doc)
  itemLine(doc, `Tax ${taxLabel}`, tax)
  itemLine(doc, "Total", total)
  emptyText(doc)
  generateHr(doc)
  generateImage(doc,qrcodeUrl, 100)
  emptyText(doc)
  emptyText(doc)
  generateHr(doc)

  doc.pipe(concat(function (data) {
    var printer = ipp.Printer(printerName);
    var msg = {
      "operation-attributes-tag": {
        "requesting-user-name": "Demo Receipt",
        "job-name": "receipt.pdf",
        "document-format": "application/pdf"
      }
      , data: data
    };
    printer.execute("Print-Job", msg, function(err, res){
      console.log(err);
      console.log(res);
    });
  }));
  doc.end();
  cb()
}

async function getPrinterAttributes(name, cb) {
  var printer = ipp.Printer(name);
  printer.execute("Get-Printer-Attributes", null, function(err, res){
    if (err){
      cb(name, err)
    }
    cb(name, res)
  });
}



module.exports.printReceipt = printReceipt
module.exports.getPrinterAttributes = getPrinterAttributes