const { isObjectIdOrHexString } = require("mongoose")

module.exports = async (req, res, next) => {
  const { memory_id } = req.params

  if (!isObjectIdOrHexString(memory_id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid memory ID provided'
    })
  }

  next()
}