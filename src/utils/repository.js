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
          const { key, where, sort, select, limit, skip, populate } = req.query

          let query

          // If an ID is provided, fetch a single document
          if (id) {
            const parsedKey = key?.toString()
            query = parsedKey ? Model.findOne({ [parsedKey] : id }) : Model.findById(id)
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
                logger.debug(`Invalid 'where' query format: ${err}`)
                return res.status(400).json({
                  success: false,
                  message: "Invalid 'where' query format"
                })
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
                logger.debug(`Invalid 'sort' query format: ${err}`)
                return res.status(400).json({
                  success: false,
                  message: "Invalid 'sort' query format"
                })
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
                    query = query.populate(fields.length ? { path, select: fields.join(' ') } : { path });
                  }
                })
              } catch (err) {
                logger.debug(`Invalid 'populate' query format: ${err}`)
                return res.status(400).json({
                  success: false,
                  message: "Invalid 'populate' query format"
                })
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
          next(err)
        }
      }
    },

    POST: (onBeforeCreate, onBeforeEnd, saveModified = false) => {
      return async (req, res, next) => {
        const data = req.body
        if (!data || (Object.keys(data).length < 1)) {
          return res.status(400).json({
            success: false,
            message: 'No data provided.'
          })
        }

        try {
          const parsedData = onBeforeCreate?.(data) ?? data
          const result = await Model.create(parsedData);
          const responseData = onBeforeEnd?.(result) ?? result;
          if (saveModified) {
            await responseData.save()
          }
          
          return res.status(201).json({
            success: true,
            data: responseData
          });
        } catch (error) {
          next(error)
        }
      }
    },

    UPDATE: (onBeforeUpdate, onBeforeEnd, saveModified = false) => {
      return async (req, res, next) => {
        const data = req.body
        if (!data || (Object.keys(data).length < 1)) {
          return res.status(400).json({
            success: false,
            message: 'No data provided.'
          })
        }

        try {
          const parsedData = onBeforeUpdate?.(data) ?? data
          const result = await Model.update(parsedData, { new: true });
          const responseData = onBeforeEnd?.(result) ?? result;

          if (saveModified) {
            await responseData.save()
          }
          
          return res.status(201).json({
            success: true,
            data: responseData
          });
        } catch (error) {
          next(error)
        }
      }
    }
  }
}

module.exports = repository
