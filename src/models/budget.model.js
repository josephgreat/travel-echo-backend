// budget.model.js
const { Schema, model } = require('mongoose');

const BudgetSchema = new Schema({
  // Define schema for Budget
});

module.exports = model('Budget', BudgetSchema);