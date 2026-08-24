import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addShopFavorite,
  getShopFavoriteStatus,
  removeShopFavorite,
} from '../../api/favoriteApi'
import { useAuth } from '../../context/AuthContext'

// 정비소의 즐겨찾기 등록과 취소를 담당하는 버튼이다.
function FavoriteButton({ shopId }) {
  const { loginUser, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  // 로그인한 사용자의 현재 정비소 즐겨찾기 여부를 조회한다.
  useEffect(() => {
    if (authLoading || !shopId) {
      return
    }

    // 로그인하지 않은 경우 즐겨찾기 조회 요청을 보내지 않는다.
    if (!loginUser) {
      setFavorited(false)
      return
    }

    const loadFavoriteStatus = async () => {
      try {
        const response =
          await getShopFavoriteStatus(shopId)

        setFavorited(response.data.favorited)
      } catch (error) {
        console.error(
          '즐겨찾기 상태 조회 실패:',
          error,
        )
      }
    }

    loadFavoriteStatus()
  }, [shopId, loginUser, authLoading])

  // 현재 상태에 따라 즐겨찾기를 등록하거나 취소한다.
  const handleFavorite = async () => {
    if (!loginUser) {
      alert('로그인 후 즐겨찾기를 이용할 수 있습니다.')
      navigate('/login')
      return
    }

    try {
      setLoading(true)

      if (favorited) {
        await removeShopFavorite(shopId)
        setFavorited(false)
      } else {
        await addShopFavorite(shopId)
        setFavorited(true)
      }
    } catch (error) {
      console.error(
        '즐겨찾기 처리 실패:',
        error,
      )

      const responseMessage =
        typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data?.message

      alert(
        responseMessage ||
          '즐겨찾기 처리에 실패했습니다.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleFavorite}
      disabled={loading || authLoading}
    >
      {loading
        ? '처리 중...'
        : favorited
          ? '♥ 즐겨찾기 취소'
          : '♡ 즐겨찾기'}
    </button>
  )
}

export default FavoriteButton