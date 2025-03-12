module.exports = {
  computeAge(dateOfBirth) {
    const dob = new Date(dateOfBirth)

    if (!dob) {
      return 0
    }

    const now = new Date()

    // Calculate age
    let age = now.getFullYear() - dob.getFullYear()
    const monthDiff = now.getMonth() - dob.getMonth()
    const dayDiff = now.getDate() - dob.getDate()

    // Adjust age if the birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--
    }
    return age
  }
}