// file: buatHash.js
const bcrypt = require('bcryptjs')

// Ganti 'password_admin_disini' dengan password yang Anda inginkan
const passwordPolos = 'superadmin123'

const hashPassword = async () => {
  try {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(passwordPolos, salt)

    console.log('--- HASH ANDA ---')
    console.log(hash)
    console.log('------------------')
    console.log(`Gunakan hash ini di kueri SQL Anda untuk password: ${passwordPolos}`)
  } catch (err) {
    console.error(err)
  }
}

hashPassword()
