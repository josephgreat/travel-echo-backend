class HTTPException extends Error {
  constructor({ name, message, status, data }) {
    super(message)
    this.status = status || 500
    this.data = data
    this.name = name || 'HTTP_EXCEPTION_ERROR'
  }
}

module.exports = HTTPException
