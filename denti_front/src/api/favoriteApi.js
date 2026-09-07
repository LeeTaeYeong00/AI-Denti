import axios from 'axios'

// 정비소를 즐겨찾기 상태로 만든다.
// 이미 등록된 상태여도 그대로 유지된다.
export const addShopFavorite = (shopId) => {
  return axios.put(
    `/api/favorites/shops/${shopId}`,
    null,
    {
      withCredentials: true,
    },
  )
}

// 정비소를 즐겨찾기 해제 상태로 만든다.
// 이미 해제된 상태여도 정상 처리된다.
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

// 현재 로그인한 사용자가 즐겨찾기한 정비소 목록을 조회한다.
export const getMyShopFavorites = () => {
  return axios.get(
    '/api/favorites/my',
    {
      withCredentials: true,
    },
  )
}