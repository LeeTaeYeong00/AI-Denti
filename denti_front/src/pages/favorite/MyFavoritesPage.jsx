import MyFavoriteSection from "../../components/favorite/MyFavoriteSection";

// 현재 로그인한 사용자가 즐겨찾기한 정비소를 보여주는 페이지이다.
function MyFavoritesPage() {
    return (
        <div className="page">
            <div className="page-header">
                <span className="eyebrow">
                    MY FAVORITES
                </span>

                <h1 style={{ fontSize: 28 }}>
                    내 즐겨찾기
                </h1>
            </div>

            <MyFavoriteSection />
        </div>
    );
}

export default MyFavoritesPage;