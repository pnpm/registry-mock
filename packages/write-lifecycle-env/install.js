'use strict'
const fs = require('fs')

const content = JSON.stringify(process.env, null, 2)
fs.writeFileSync(`env.json`, content, 'utf8')
