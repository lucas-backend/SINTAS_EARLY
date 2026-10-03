import { AppError } from '../middleware/errorHandler.js'
import { hashPassword } from './auth/password.js'

const publicUser = (user) => ({ id: user.id, username: user.username, role: user.role, name: user.name, email: user.email, phone: user.phone, birthDate: user.birthDate, studentNumber: user.studentProfile?.studentNumber ?? null })

export function createManagementService({ repository }) {
  const adminOnly = (user) => { if (user.role !== 'ADMIN') throw new AppError(403, 'FORBIDDEN', 'Anda tidak memiliki akses ke sumber daya ini.') }
  const findEditable = async (id) => {
    const target = await repository.findUser(id)
    if (!target || target.role === 'ADMIN' || target.deletedAt) throw new AppError(404, 'NOT_FOUND', 'Pengguna tidak ditemukan.')
    return target
  }
  return {
    async listUsers(user, query) { adminOnly(user); const [items, total] = await repository.listUsers(query); return { items: items.map(publicUser), meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } } },
    async createUser(user, data) {
      adminOnly(user)
      if (data.role === 'STUDENT' && (!data.studentNumber || !data.educationLevelId)) throw new AppError(400, 'VALIDATION_ERROR', 'Profil siswa membutuhkan nomor siswa dan jenjang.')
      if (await repository.findUsername(data.username)) throw new AppError(409, 'DUPLICATE_USERNAME', 'Username sudah digunakan.')
      const profile = data.role === 'STUDENT' ? { type: 'STUDENT', data: { studentNumber: data.studentNumber, educationLevelId: data.educationLevelId } } : { type: data.role }
      const created = await repository.createUser({ username: data.username, passwordHash: await hashPassword(data.password), role: data.role, name: data.name, email: data.email, phone: data.phone, birthDate: data.birthDate }, profile)
      return publicUser(created)
    },
    async updateUser(user, id, data) {
      adminOnly(user)
      const target = await findEditable(id)
      const hasProfileFields = data.studentNumber !== undefined || data.educationLevelId !== undefined
      if (target.role !== 'STUDENT' && hasProfileFields) throw new AppError(400, 'VALIDATION_ERROR', 'Data akademik hanya berlaku untuk akun siswa.')
      if (data.email !== undefined && data.email !== null) {
        const existing = await repository.findEmail(data.email)
        if (existing && existing.id !== id) throw new AppError(409, 'DUPLICATE_EMAIL', 'Email sudah digunakan.')
      }
      let studentProfile = null
      if (target.role === 'STUDENT' && hasProfileFields) {
        if (!target.studentProfile) throw new AppError(400, 'VALIDATION_ERROR', 'Profil siswa tidak ditemukan.')
        studentProfile = {}
        if (data.studentNumber !== undefined) {
          const existing = await repository.findStudentNumber(data.studentNumber)
          if (existing && existing.userId !== id) throw new AppError(409, 'DUPLICATE_STUDENT_NUMBER', 'Nomor siswa sudah digunakan.')
          studentProfile.studentNumber = data.studentNumber
        }
        if (data.educationLevelId !== undefined) {
          if (!await repository.findEducationLevel(data.educationLevelId)) throw new AppError(404, 'NOT_FOUND', 'Jenjang tidak ditemukan.')
          studentProfile.educationLevelId = data.educationLevelId
        }
      }
      const basic = {}
      for (const field of ['name', 'email', 'phone', 'birthDate']) if (data[field] !== undefined) basic[field] = data[field]
      const updated = await repository.updateUser(id, basic, studentProfile)
      return publicUser(updated)
    },
    async deleteUser(user, id) {
      adminOnly(user)
      if (user.id === id) throw new AppError(400, 'CANNOT_DELETE_SELF', 'Anda tidak dapat menghapus akun sendiri.')
      await findEditable(id)
      await repository.softDeleteUser(id)
      return { message: 'Pengguna berhasil dihapus.' }
    },
    async resetPassword(user, id, data) { adminOnly(user); await findEditable(id); await repository.updatePassword(id, await hashPassword(data.password)); return { message: 'Password berhasil direset.' } },
  }
}
