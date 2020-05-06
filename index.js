#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const commandLineArgs = require('command-line-args')

const optionDefinitions = [
  { name: 'secretKey', alias: 's', type: String, defaultValue: '' },
  { name: 'path', alias: 'p', type: String, defaultValue: './skus.json' },
  { name: 'coin', alias: 'c', type: Boolean }
]
const options = commandLineArgs(optionDefinitions)

const stripe = require('stripe')(options.secretKey || process.env.STRIPE_SECRET_KEY)

async function fetchStripeSkusJson(savePath, coin) {
  let skus = await stripe.skus.list({ limit: 100 })

  if (coin) {
    skus.data = skus.data.map(function (sku) {
      sku.coin = parseInt(sku.attributes.name.replace(/[^0-9]/g, ''))
      return sku
    })
  }

  const jsonData = JSON.stringify(skus.data)
  fs.mkdirSync(path.parse(savePath).dir, { recursive: true })
  fs.writeFileSync(savePath, jsonData)
}

async function main() {
  await fetchStripeSkusJson('./' + options.path, options.coin)
}
main()
