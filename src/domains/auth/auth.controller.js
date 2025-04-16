module.exports = {
  login: require('./services/login.service'),
  register: require('./services/register.service'),

  signInWithGoogle: require('./services/google.service').signInWithGoogle(),
  googleAuthCallback: require('./services/google.service').googleAuthCallback(),

  //Account verification
  sendAccountVerificationEmail: require('./services/account-verification.service').sendAccountVerificationEmail,
  verifyAccount: require('./services/account-verification.service').verifyAccount,

  //Password recovery
  sendAccountRecoveryEmail: require('./services/account-recovery.service').sendAccountRecoveryEmail,
  verifyAccountRecoveryOTP: require('./services/account-recovery.service').verifyAccountRecoveryOTP,
  resetPassword: require('./services/account-recovery.service').resetPassword
}
