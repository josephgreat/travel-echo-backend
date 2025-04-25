const { toTitleCase } = require('#utils/helpers')
const logger = require('#utils/logger')

const repository = (modelName) => {
  const Model = require(`../models/${modelName}.model`)
  if (!Model) {
    const error = new Error(`${modelName} model not found.`)
    logger.error('Error getting model repository', error)
    throw error
  }

  return {
    GET: (options = {}) => {
      const { onBeforeEnd, onError, saveModified = false } = options

      return async (req, res, next) => {
        const ctx = { req, res, next, Model, modelName }

        try {
          const { id } = req.params
          const { key, where, sort, select, limit, skip, populate } = req.query

          let query

          // If an ID is provided, fetch a single document
          if (id) {
            const parsedKey = key?.toString()
            query = parsedKey
              ? Model.findOne({ [parsedKey]: id })
              : Model.findById(id)
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
                    query = query.populate(
                      fields.length
                        ? { path, select: fields.join(' ') }
                        : { path }
                    )
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
            updatedData = await onBeforeEnd(result, ctx)
          }

          if (saveModified) {
            await updatedData.save()
          }

          res.status(200).json({ success: true, data: updatedData || result })
        } catch (err) {
          if (onError && typeof onError === 'function') {
            await onError(err, ctx)
          }
          next(err)
        }
      }
    },

    POST: (options = {}) => {
      const {
        onBeforeCreate,
        onBeforeEnd,
        onError,
        saveModified = false
      } = options

      return async (req, res, next) => {
        const ctx = { req, res, next, Model, modelName }

        const data = req.body
        if (!data || Object.keys(data).length < 1) {
          return res.status(400).json({
            success: false,
            message: 'No data provided.'
          })
        }

        try {
          const parsedData = (await onBeforeCreate?.(data, ctx)) ?? data
          const result = await Model.create(parsedData)
          const responseData = (await onBeforeEnd?.(result, ctx)) ?? result
          if (saveModified) {
            await responseData.save()
          }

          return res.status(201).json({
            success: true,
            data: responseData
          })
        } catch (error) {
          if (onError && typeof onError === 'function') {
            await onError(error, ctx)
          }
          next(error)
        }
      }
    },

    UPDATE: (options = {}) => {
      const {
        onBeforeUpdate,
        onBeforeEnd,
        onError,
        saveModified = false
      } = options

      return async (req, res, next) => {
        const ctx = { req, res, next, Model, modelName }
        const { id } = req.params

        const data = req.body
        if (!data || Object.keys(data).length < 1) {
          return res.status(400).json({
            success: false,
            message: 'No data provided.'
          })
        }

        try {
          const parsedData = (await onBeforeUpdate?.(data, ctx)) ?? data
          const result = await Model.findByIdAndUpdate(id, parsedData, {
            new: true
          })
          const responseData = (await onBeforeEnd?.(result, ctx)) ?? result

          if (saveModified) {
            await responseData.save()
          }

          return res.status(200).json({
            success: true,
            data: responseData
          })
        } catch (error) {
          if (onError && typeof onError === 'function') {
            await onError(error, ctx)
          }
          next(error)
        }
      }
    },

    DELETE: (options = {}) => {
      const { onBeforeDelete, onError, onBeforeEnd } = options

      return async (req, res, next) => {
        const ctx = { req, res, next, Model, modelName }
        const { id } = req.params
        const { where } = req.query

        if (!id && !where) {
          return res.status(400).json({
            success: false,
            message: 'Either ID or query parameter "where" must be provided.'
          })
        }

        if (id && where) {
          return res.status(400).json({
            success: false,
            message:
              'Only one of the ID or "where" query parameter must be provided.'
          })
        }

        try {
          let deleteCondition = {}

          if (id) {
            deleteCondition = { _id: id }
          }

          if (where) {
            const whereConditions = Array.isArray(where) ? where : [where]

            for (const condition of whereConditions) {
              const [key, value] = condition.split(',')

              if (!key || !value) {
                return res.status(400).json({
                  success: false,
                  message:
                    'Invalid "where" query parameter format. Expected "key,value".'
                })
              }
              deleteCondition[key] = value
            }
          }

          const finalCondition =
            (await onBeforeDelete?.(deleteCondition, ctx)) ?? deleteCondition

          const result = await Model.findOneAndDelete(finalCondition)

          if (!result) {
            return res.status(404).json({
              success: false,
              message: `${toTitleCase(modelName)} not found.`
            })
          }

          const responseData = (await onBeforeEnd?.(result, ctx)) ?? result

          return res.status(200).json({
            success: true,
            message: `${toTitleCase(modelName)} deleted successfully.`,
            data: responseData
          })
        } catch (error) {
          if (onError && typeof onError === 'function') {
            await onError(error, ctx)
          }
          next(error)
        }
      }
    }
  }
}
module.exports = repository
