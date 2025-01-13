#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const domainsDir = path.resolve('src/domains');

// Helper function to create a folder if it doesn't exist
const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Created folder: ${folderPath}`);
  }
};

// Main function to create the domain
const createDomain = (domainName) => {
  if (!domainName) {
    console.error('Error: Please provide a domain name.');
    process.exit(1);
  }

  const domain = domainName.toLowerCase(); // Convert to lowercase
  const domainPath = path.join(domainsDir, domain);

  // Paths for the files and services folder
  const controllerPath = path.join(domainPath, `${domain}.controller.js`);
  const routesPath = path.join(domainPath, `${domain}.routes.js`);
  const servicesFolderPath = path.join(domainPath, 'services');

  // Create the domain folder and services subfolder
  createFolder(domainPath);
  createFolder(servicesFolderPath);

  // Template for controller file
  const controllerTemplate = `
// ${domain}.controller.js
module.exports = {
  // Controller methods for ${domain}
}
`;

const domainControllerName = `${domain[0].toUpperCase() + domain.slice(1)}Controller`;

  // Template for routes file
  const routesTemplate = `
// ${domain}.routes.js
const { Router } = require('express')
const ${domainControllerName} = require('./${domain}.controller')

const router = Router()

// Define routes for ${domain}
// Example: router.get('/', ${domainControllerName}.someMethod)

module.exports = router
`;

  // Create the controller file
  if (!fs.existsSync(controllerPath)) {
    fs.writeFileSync(controllerPath, controllerTemplate.trim());
    console.log(`Created file: ${controllerPath}`);
  } else {
    console.log(`File already exists: ${controllerPath}`);
  }

  // Create the routes file
  if (!fs.existsSync(routesPath)) {
    fs.writeFileSync(routesPath, routesTemplate.trim());
    console.log(`Created file: ${routesPath}`);
  } else {
    console.log(`File already exists: ${routesPath}`);
  }
};

// Get the domain name from the command line arguments
const args = process.argv.slice(2);
const domainName = args[0];

createDomain(domainName);
