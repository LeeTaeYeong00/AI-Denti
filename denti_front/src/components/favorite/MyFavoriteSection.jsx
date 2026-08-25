import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getMyShopFavorites,
  removeShopFavorite,
} from '../../api/favoriteApi'

import { useAuth } from '../../context/AuthContext'

// 현재 로그인한 사용자가 즐겨찾기한 정비소 목록을 표시한다.
// 나중에 마이페이지 내부에 넣어서 사용한다.
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
        console.error('즐겨찾기 목록 조회 실패:', error)
        setError('즐겨찾기 목록을 불러오지 못했습니다.')
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
          (favorite) => favorite.shopId !== shopId,
        ),
      )
    } catch (error) {
      console.error('즐겨찾기 삭제 실패:', error)

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
    return <p>즐겨찾기 목록을 불러오는 중입니다.</p>
  }

  if (!loginUser) {
    return <p>로그인 후 즐겨찾기 목록을 확인할 수 있습니다.</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <section>
      <h2>즐겨찾는 정비소</h2>

      {favorites.length === 0 ? (
        <p>즐겨찾기한 정비소가 없습니다.</p>
      ) : (
        <div>
          {favorites.map((favorite) => (
            <article key={favorite.favoriteId}>
              <h3>{favorite.shopName}</h3>

              {favorite.phone && (
                <p>전화번호: {favorite.phone}</p>
              )}

              {favorite.description && (
                <p>{favorite.description}</p>
              )}

              <p>
                운영 상태:{' '}
                {favorite.open ? '영업 중' : '영업 종료'}
              </p>

              <button
                type="button"
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
                onClick={() =>
                  handleRemove(favorite.shopId)
                }
              >
                즐겨찾기 삭제
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default MyFavoriteSection