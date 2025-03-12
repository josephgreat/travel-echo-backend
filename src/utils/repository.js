const HTTPException = require('./http-exception')
const logger = require('./logger')

const repository = (modelName) => {
  const Model = require(`../models/${modelName}.model`)
  if (!Model) {
    const error = new Error(`${modelName} model not found.`)
    logger.error('Error getting model repository', error)
    throw error
  }

  return {
    GET: (onBeforeEnd) => {
      return async (req, res, next) => {
        try {
          const { id } = req.params
          const { where, sort, select, limit, skip, populate } = req.query

          let query

          // If an ID is provided, fetch a single document
          if (id) {
            query = Model.findById(id)
          } else {
            query = Model.find()

            // Handling multiple "where" conditions (where=name,john&where=age,30)
            if (where) {
              try {
                const filters = {}
                const conditions = Array.isArray(where) ? where : [where]

                conditions.forEach((condition) => {
                  const [key, value] = condition.split(',')
                  if (key && value !== undefined) {
                    filters[key] = isNaN(value) ? value : Number(value)
                  }
                })

                query = query.find(filters)
              } catch (err) {
                logger.error("Invalid 'where' query format", err)
                throw new HTTPException("Invalid 'where' query format", 400)
              }
            }

            // Handling multiple "sort" fields (sort=name,ASC&sort=age,DESC)
            if (sort) {
              try {
                const sortObj = {}
                const sortParams = Array.isArray(sort) ? sort : [sort]

                sortParams.forEach((sortItem) => {
                  const [field, order] = sortItem.split(',')
                  if (field) {
                    sortObj[field] =
                      order && order.toUpperCase() === 'DESC' ? -1 : 1
                  }
                })

                query = query.sort(sortObj)
              } catch (err) {
                logger.error("Invalid 'sort' query format", err)
                throw new HTTPException("Invalid 'sort' query format", 400)
              }
            }

            // Handling field selection (select=name,email)
            if (select) {
              query = query.select(select.replace(/,/g, ' '))
            }

            // Handling pagination (limit & skip)
            if (limit) query = query.limit(parseInt(limit, 10))
            if (skip) query = query.skip(parseInt(skip, 10))

            // Handling population with selected fields (populate=profile,name,email&populate=sessionData,token,expires)
            if (populate) {
              try {
                const populateParams = Array.isArray(populate)
                  ? populate
                  : [populate]

                populateParams.forEach((popItem) => {
                  const [path, ...fields] = popItem.split(',')
                  if (path) {
                    query = query.populate({ path, select: fields.join(' ') })
                  }
                })
              } catch (err) {
                logger.error("Invalid 'populate' query format", err)
                throw new HTTPException("Invalid 'populate' query format", 400)
              }
            }
          }

          const result = await query.exec()

          let updatedData = result

          if (onBeforeEnd && typeof onBeforeEnd === 'function') {
            updatedData = await onBeforeEnd(result)
          }

          res.status(200).json({ success: true, data: updatedData || result })
        } catch (err) {
          logger.error(`Error executing GET request on ${modelName} model`, err)
          next(err)
        }
      }
    }
  }
}

module.exports = repository
