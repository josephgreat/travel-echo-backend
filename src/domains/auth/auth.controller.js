module.exports = {
  login: require('./services/login.service'),
  register: require('./services/register.service'),
  sendOTP: require('./services/otp.service').sendOTP
}
