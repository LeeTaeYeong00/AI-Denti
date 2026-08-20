import axios from 'axios'

// 임시 로그인 사용자 번호를 헤더에 담는다.
// 나중에 로그인 기능이 연결되면 인증 방식에 맞게 변경한다.
const userConfig = (userId) => {
  if (!userId) {
    return {}
  }

  return {
    headers: {
      'X-User-Id': userId,
    },
  }
}

// 리뷰를 등록한다.
export const createReview = (userId, data) => {
  return axios.post('/api/reviews', data, userConfig(userId))
}

// 리뷰 한 건을 조회한다.
export const getReview = (reviewId, userId) => {
  return axios.get(
    `/api/reviews/${reviewId}`,
    userConfig(userId),
  )
}

// 특정 정비소의 리뷰 목록과 평균 평점을 조회한다.
export const getShopReviews = (
  shopId,
  userId,
  page = 0,
  size = 10,
) => {
  return axios.get(
    `/api/reviews/shops/${shopId}?page=${page}&size=${size}`,
    userConfig(userId),
  )
}

// 리뷰를 수정한다.
export const updateReview = (reviewId, userId, data) => {
  return axios.put(
    `/api/reviews/${reviewId}`,
    data,
    userConfig(userId),
  )
}

// 리뷰를 삭제한다.
export const deleteReview = (reviewId, userId) => {
  return axios.delete(
    `/api/reviews/${reviewId}`,
    userConfig(userId),
  )
}

// 리뷰 좋아요를 등록하거나 취소한다.
export const toggleReviewLike = (reviewId, userId) => {
  return axios.post(
    `/api/reviews/${reviewId}/like`,
    null,
    userConfig(userId),
  )
}

// 정비소 답변을 등록한다.
export const createReviewReply = (
  reviewId,
  shopOwnerId,
  data,
) => {
  return axios.post(
    `/api/reviews/${reviewId}/reply`,
    data,
    userConfig(shopOwnerId),
  )
}
// 리뷰에 이미지를 등록한다.
export const uploadReviewImages = (
  reviewId,
  userId,
  files,
) => {
  const formData = new FormData()

  // 여러 이미지 파일을 동일한 files 이름으로 담는다.
  Array.from(files).forEach((file) => {
    formData.append('files', file)
  })

  return axios.post(
    `/api/reviews/${reviewId}/images`,
    formData,
    userConfig(userId),
  )
}

// 리뷰 이미지 한 장을 삭제한다.
export const deleteReviewImage = (
  reviewImageId,
  userId,
) => {
  return axios.delete(
    `/api/reviews/images/${reviewImageId}`,
    userConfig(userId),
  )
}