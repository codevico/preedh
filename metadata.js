const fs = require('fs')
const process = require('child_process')

const date = new Date()
const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
const commitHash = process.execSync('git rev-parse --short HEAD').toString().trim()
const metadata = {
    date: formattedDate,
    commit: commitHash
}
fs.writeFileSync('metadata.json', JSON.stringify(metadata))