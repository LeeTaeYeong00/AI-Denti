import {
  useEffect,
  useRef,
  useState,
} from 'react'
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
  const [checkingStatus, setCheckingStatus] =
    useState(true)
  const [loading, setLoading] = useState(false)

  // React 화면이 갱신되기 전 들어오는 중복 클릭도 즉시 차단한다.
  const requestLockRef = useRef(false)

  // 로그인한 사용자의 현재 정비소 즐겨찾기 여부를 조회한다.
  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!shopId) {
      setCheckingStatus(false)
      return
    }

    // 로그인하지 않은 경우 즐겨찾기 조회 요청을 보내지 않는다.
    if (!loginUser) {
      setFavorited(false)
      setCheckingStatus(false)
      return
    }

    let cancelled = false

    const loadFavoriteStatus = async () => {
      try {
        setCheckingStatus(true)

        const response =
          await getShopFavoriteStatus(shopId)

        if (!cancelled) {
          setFavorited(response.data.favorited)
        }
      } catch (error) {
        console.error(
          '즐겨찾기 상태 조회 실패:',
          error,
        )
      } finally {
        if (!cancelled) {
          setCheckingStatus(false)
        }
      }
    }

    loadFavoriteStatus()

    // 정비소가 바뀌거나 화면에서 나간 뒤 이전 응답이 상태를 변경하지 못하게 한다.
    return () => {
      cancelled = true
    }
  }, [shopId, loginUser, authLoading])

  // 현재 상태에 따라 즐겨찾기를 등록하거나 취소한다.
  const handleFavorite = async () => {
    if (!loginUser) {
      alert(
        '로그인 후 즐겨찾기를 이용할 수 있습니다.',
      )
      navigate('/login')
      return
    }

    // 이미 요청을 처리하고 있다면 추가 요청을 보내지 않는다.
    if (requestLockRef.current) {
      return
    }

    requestLockRef.current = true
    setLoading(true)

    try {
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
      requestLockRef.current = false
      setLoading(false)
    }
  }

  const buttonLoading =
    authLoading || checkingStatus || loading

  return (
    <button
      type="button"
      className={`btn btn-sm favorite-btn ${
        favorited
          ? 'btn-primary favorite-btn--active'
          : 'btn-outline'
      }`}
      onClick={handleFavorite}
      disabled={!shopId || buttonLoading}
      aria-pressed={favorited}
      aria-busy={buttonLoading}
      title={
        favorited
          ? '즐겨찾기에서 해제하기'
          : '즐겨찾기에 추가하기'
      }
    >
      <span
        className="favorite-btn__icon"
        aria-hidden="true"
      >
        {favorited ? '♥' : '♡'}
      </span>

      <span>
        {checkingStatus
          ? '확인 중...'
          : loading
            ? '처리 중...'
            : favorited
              ? '즐겨찾기 저장됨'
              : '즐겨찾기'}
      </span>
    </button>
  )
}

export default FavoriteButton