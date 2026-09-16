import { render } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../app/router'
import { SessionProvider } from '../app/session/SessionProvider'
import { queryClient } from '../lib/queryClient'

export const studentUser = {
  id: 1,
  username: 'student.demo',
  role: 'STUDENT',
  name: 'Siswa Demo',
  email: 'student.demo@school.test',
  phone: null,
  birthDate: null,
  studentNumber: 'S-0001',
}

export const teacherUser = {
  id: 2,
  username: 'teacher.demo',
  role: 'TEACHER',
  name: 'Guru Demo',
  email: 'teacher.demo@school.test',
  phone: null,
  birthDate: null,
}

export const adminUser = {
  id: 3,
  username: 'admin.demo',
  role: 'ADMIN',
  name: 'Admin Demo',
  email: 'admin.demo@school.test',
  phone: null,
  birthDate: null,
}

export function renderApp(initialEntries) {
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <AppRoutes />
        </MemoryRouter>
      </SessionProvider>
    </QueryClientProvider>,
  )
}