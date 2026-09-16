import { apiClient } from '../lib/apiClient'

export const bannerKeys = {
  active: ['banners', 'active'],
}

export async function getActiveBanners() {
  const payload = await apiClient.get('/banners')
  return payload.data
}