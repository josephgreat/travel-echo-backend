module.exports = {
  sendResponse: (res, status, data) => {
    const success = status < 400
    const payload = typeof data === 'string' ? { message: data } : data
    res.status(status).json({ success, ...payload})
    return
  }
}