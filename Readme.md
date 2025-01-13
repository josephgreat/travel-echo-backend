# Travel Echo

Welcome to the back-end module of the **Travel Echo** application

## Setup and Configurations

### Environmental Variables

Make sure the following environmental variables are set before running the server

- PORT
- MONGO_URI

### Scripts

- `npm run dev` : Starts the development server
- `npm run start` : Starts the production server
- `npm run swagger`: Generates the swagger documentation found in docs/swagger-doc.json
- `npm run create:domain`: Creates a new domain with a router file, a controller file and a services folder, e.g. 'npm run create:domain auth'
- `npm run create:model`: Creates a new mongoose model, e.g. 'npm run create:model User'
- Refer to the package.json file for more scripts
