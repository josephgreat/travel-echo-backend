const User = require('../models/user.model') // adjust path as needed

const checkSubscription = (premiumOnly = false) => {
  return async (req, res, next) => {
    try {
      const user = req.user

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized. Please sign in.'
        })
      }

      const now = new Date()
      const isSubscriptionValid =
        user.subscription?.isActive &&
        user.subscription.startedAt &&
        user.subscription.expiresAt &&
        new Date(user.subscription.startedAt) <= now &&
        new Date(user.subscription.expiresAt) > now

      // Auto-downgrade if expired
      if (!isSubscriptionValid && user.plan === 'PREMIUM') {
        await User.findByIdAndUpdate(user.id, {
          plan: 'FREE',
          subscription: {
            ...user.subscription,
            isActive: false
          }
        })
        user.plan = 'FREE' // Update in-memory user
        user.subscription.isActive = false
      }

      const isPremiumUser = user.plan === 'PREMIUM' && isSubscriptionValid
      req.isPremiumUser = isPremiumUser

      if (premiumOnly && !isPremiumUser) {
        return res.status(403).json({
          success: false,
          message: 'You must have an active premium subscription to continue.'
        })
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

module.exports = checkSubscription
