import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getMyShopFavorites,
  removeShopFavorite,
} from '../../api/favoriteApi'

import { useAuth } from '../../context/AuthContext'

// 현재 로그인한 사용자가 즐겨찾기한 정비소 목록을 표시한다.
function MyFavoriteSection() {
  const { loginUser, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 로그인 상태가 확인되면 내 즐겨찾기 목록을 조회한다.
  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!loginUser) {
      setFavorites([])
      return
    }

    const loadFavorites = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getMyShopFavorites()

        setFavorites(response.data)
      } catch (error) {
        console.error(
          '즐겨찾기 목록 조회 실패:',
          error,
        )

        setError(
          '즐겨찾기 목록을 불러오지 못했습니다.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [loginUser, authLoading])

  // 선택한 정비소를 즐겨찾기 목록에서 삭제한다.
  const handleRemove = async (shopId) => {
    const confirmed = window.confirm(
      '이 정비소를 즐겨찾기에서 삭제하시겠습니까?',
    )

    if (!confirmed) {
      return
    }

    try {
      await removeShopFavorite(shopId)

      // 삭제가 성공하면 현재 화면에서도 바로 제거한다.
      setFavorites((previous) =>
        previous.filter(
          (favorite) =>
            favorite.shopId !== shopId,
        ),
      )
    } catch (error) {
      console.error(
        '즐겨찾기 삭제 실패:',
        error,
      )

      const responseMessage =
        typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data?.message

      alert(
        responseMessage ||
          '즐겨찾기 삭제에 실패했습니다.',
      )
    }
  }

  if (authLoading || loading) {
    return (
      <div className="empty-state">
        즐겨찾기 목록을 불러오는 중입니다.
      </div>
    )
  }

  if (!loginUser) {
    return (
      <div className="empty-state">
        로그인 후 즐겨찾기 목록을 확인할 수
        있습니다.
      </div>
    )
  }

  if (error) {
    return (
      <div className="empty-state">
        <p className="form-error">
          {error}
        </p>
      </div>
    )
  }

  return (
    <section className="favorite-section">
      <div className="section-title-row">
        <h2>즐겨찾는 정비소</h2>

        <span className="favorite-section__count">
          총 {favorites.length}곳
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          즐겨찾기한 정비소가 없습니다.
        </div>
      ) : (
        <div className="favorite-grid">
          {favorites.map((favorite) => (
            <article
              key={
                favorite.favoriteId ??
                favorite.shopId
              }
              className="card card--hover favorite-card"
            >
              <div className="favorite-card__head">
                <h3 className="favorite-card__title">
                  {favorite.shopName}
                </h3>

                <span
                  className={`badge ${
                    favorite.open
                      ? 'badge-completed'
                      : 'badge-cancelled'
                  }`}
                >
                  {favorite.open
                    ? '영업 중'
                    : '영업 종료'}
                </span>
              </div>

              <div className="favorite-card__body">
                {favorite.phone && (
                  <p className="favorite-card__phone">
                    전화번호 {favorite.phone}
                  </p>
                )}

                <p className="favorite-card__description">
                  {favorite.description ||
                    '등록된 정비소 설명이 없습니다.'}
                </p>
              </div>

              <div className="favorite-card__actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() =>
                    navigate(
                      `/repair-shops/${favorite.shopId}`,
                    )
                  }
                >
                  정비소 상세보기
                </button>

                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() =>
                    handleRemove(favorite.shopId)
                  }
                >
                  즐겨찾기 삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default MyFavoriteSection