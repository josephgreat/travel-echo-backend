#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const modelsDir = path.resolve('src/models')

// Main function to create the model
const createModel = (modelName) => {
  if (!modelName) {
    console.error('Error: Please provide a model name.')
    process.exit(1)
  }

  const model = modelName[0].toUpperCase() + modelName.slice(1) // Capitalize first letter
  const modelLowercase = modelName.toLowerCase() // Convert to lowercase
  const modelPath = path.join(modelsDir, `${modelLowercase}.model.js`) // Path for the model file

  const modelTemplate = `
// ${modelLowercase}.model.js
const { Schema, model } = require('mongoose');

const ${model}Schema = new Schema({
  // Define schema for ${model}
});

module.exports = model('${model}', ${model}Schema);
`

  // Create the models directory if it doesn't exist
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true })
    console.log(`Created directory: ${modelsDir}`)
  }

  // Create the model file
  if (!fs.existsSync(modelPath)) {
    fs.writeFileSync(modelPath, modelTemplate.trim())
    console.log(`Created file: ${modelPath}`)
  } else {
    console.log(`File already exists: ${modelPath}`)
  }
}

// Get the model name from the command-line arguments
const args = process.argv.slice(2)
const modelName = args[0]

createModel(modelName)
