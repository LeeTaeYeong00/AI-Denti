import axios from 'axios'

// 정비소를 즐겨찾기에 등록한다.
export const addShopFavorite = (shopId) => {
  return axios.post(
    `/api/favorites/shops/${shopId}`,
    null,
    {
      withCredentials: true,
    },
  )
}

// 정비소 즐겨찾기를 취소한다.
export const removeShopFavorite = (shopId) => {
  return axios.delete(
    `/api/favorites/shops/${shopId}`,
    {
      withCredentials: true,
    },
  )
}

// 현재 로그인 사용자의 정비소 즐겨찾기 여부를 조회한다.
export const getShopFavoriteStatus = (shopId) => {
  return axios.get(
    `/api/favorites/shops/${shopId}/status`,
    {
      withCredentials: true,
    },
  )
}

// 현재 사용자가 즐겨찾기한 정비소 목록을 조회한다.
export const getMyShopFavorites = () => {
  return axios.get(
    '/api/favorites/my',
    {
      withCredentials: true,
    },
  )
}