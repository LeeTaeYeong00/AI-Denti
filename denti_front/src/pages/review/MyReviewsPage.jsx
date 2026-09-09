import MyReviewSection from "../../components/review/MyReviewSection";

// 현재 로그인한 사용자가 작성한 리뷰를 관리하는 페이지이다.
function MyReviewsPage() {
    return (
        <div className="page">
            <div className="page-header">
                <span className="eyebrow">
                    MY REVIEW
                </span>

                <h1 style={{ fontSize: 28 }}>
                    내 리뷰
                </h1>
            </div>

            <MyReviewSection />
        </div>
    );
}

export default MyReviewsPage;