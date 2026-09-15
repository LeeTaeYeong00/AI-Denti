import { Link } from "react-router-dom";

import { WrenchIcon } from "../icons";

// 게시글과 댓글 작성자의 닉네임 및 승인 정비소 정보를 표시한다.
function CommunityAuthor({
    nickname,
    writerShops = [],
}) {
    const shops = Array.isArray(writerShops)
        ? writerShops
        : [];

    const firstShop = shops[0] ?? null;
    const additionalShopCount = Math.max(
        shops.length - 1,
        0
    );

    return (
        <div className="community-author">
            <span className="community-author__nickname">
                {nickname || "알 수 없는 사용자"}
            </span>

            {firstShop && (
                <>
                    <span
                        className="community-author__separator"
                        aria-hidden="true"
                    >
                        ·
                    </span>

                    <Link
                        to={`/repair-shops/${firstShop.shopId}`}
                        className="community-author__shop-badge"
                        title={shops
                            .map((shop) => shop.shopName)
                            .join(", ")}
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <WrenchIcon
                            width={13}
                            height={13}
                            aria-hidden="true"
                        />

                        <span>{firstShop.shopName}</span>

                        {additionalShopCount > 0 && (
                            <span className="community-author__shop-count">
                                외 {additionalShopCount}곳
                            </span>
                        )}
                    </Link>
                </>
            )}
        </div>
    );
}

export default CommunityAuthor;