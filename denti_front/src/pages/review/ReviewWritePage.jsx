import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ReviewForm from '../../components/review/ReviewForm'

// 완료된 예약에 대한 리뷰를 작성하는 페이지이다.
function ReviewWritePage() {
  const { reservationId } = useParams()
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  // 리뷰 등록이 완료되면 리뷰가 표시되는 정비소 상세로 이동한다.
  const handleSuccess = (review) => {
    alert('리뷰가 등록되었습니다.')
    navigate(`/repair-shops/${review.shopId}`)
  }

  return (
    <div>
      <h1>리뷰 작성</h1>

      <div>
        <h2>예약 정보</h2>
        <p>예약 번호: {reservationId}</p>
      </div>

      <ReviewForm
        reservationId={reservationId}
        currentUserId={loginUser?.userId}
        onSuccess={handleSuccess}
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}

export default ReviewWritePage