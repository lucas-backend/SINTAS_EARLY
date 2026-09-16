export const ROLES = Object.freeze({
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN',
})

const ROLE_HOME = Object.freeze({
  STUDENT: '/app/student',
  TEACHER: '/app/teacher',
  ADMIN: '/app/admin',
})

const ROLE_LABEL = Object.freeze({
  STUDENT: 'Siswa',
  TEACHER: 'Guru',
  ADMIN: 'Admin',
})

export function roleHome(role) {
  return ROLE_HOME[role] ?? '/login'
}

export function roleLabel(role) {
  return ROLE_LABEL[role] ?? role
}

export function hasRole(user, roles) {
  return Boolean(user && roles.includes(user.role))
}