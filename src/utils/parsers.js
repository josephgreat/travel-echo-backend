module.exports = {
  parseWhereQuery(where) {
    const filters = {}
    const conditions = Array.isArray(where) ? where : [where]
  
    conditions.forEach((condition) => {
      const [key, value] = condition.split(',')
      if (key && value !== undefined) {
        filters[key] = isNaN(value) ? value : Number(value)
      }
    })
  
    return filters
  },

  
    /**
   * Parses a sort query string or array into a Mongoose-compatible sort object.
   *
   * @param {string|string[]} sort - A sort query in the format `'field,ASC'` or `'field,DESC'`,
   * or an array of such strings.
   * @returns {Object<string, 1 | -1>} An object mapping fields to sort directions (1 for ascending, -1 for descending).
   *
   * @example
   * parseSortQuery('name,DESC') // => { name: -1 }
   * parseSortQuery(['age,ASC', 'createdAt,DESC']) // => { age: 1, createdAt: -1 }
   */
  parseSortQuery(sort) {
    const sortObj = {}
    const sortParams = Array.isArray(sort) ? sort : [sort]

    sortParams.forEach((sortItem) => {
      const [field, order] = sortItem.split(',')
      if (field) {
        sortObj[field] = order?.toUpperCase() === 'DESC' ? -1 : 1
      }
    })

    return sortObj
  },

  
  parseSelectQuery(select) {
    return select.replace(/,/g, ' ')
  },
  
  parsePopulateQuery(populate) {
    const populateParams = Array.isArray(populate) ? populate : [populate]
  
    return populateParams.map((popItem) => {
      const [path, ...fields] = popItem.split(',')
      return fields.length
        ? { path, select: fields.join(' ') }
        : { path }
    })
  }
}