import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PromoBanner from '../components/PromoBanner';
import {
    ScanIcon,
    MapPinIcon,
    CalendarIcon,
    FileIcon,
    HistoryIcon,
    WrenchIcon,
} from '../components/icons';

// 광고/이벤트 배너 슬라이드. 필요할 때마다 배열에 추가/수정하면 된다.
const SLIDES = [
    {
        eyebrow: 'AI-DENTI',
        title: '사진 한 장으로 파손 진단부터 예상 견적까지',
        subtitle: 'AI가 파손 부위를 분석하고, 가까운 정비소 예약까지 바로 연결해드려요.',
        cta: 'AI 분석 시작하기',
        to: '/ai',
        background: 'linear-gradient(135deg, #1b1e24, #2c313a)',
    },
    {
        eyebrow: 'EVENT',
        title: '지금 회원가입하면 첫 AI 분석 무료',
        subtitle: '기간 한정으로 첫 진단 리포트를 무료로 받아보세요.',
        cta: '회원가입하기',
        to: '/signup',
        background: 'linear-gradient(135deg, var(--color-signal-hover), var(--color-signal))',
    },
];

// 메인 바로가기 타일. 로그인 필요한 기능은 authOnly로 표시한다.
const FEATURES = [
    { icon: ScanIcon, label: 'AI 파손 분석', desc: '사진으로 파손 진단 받기', to: '/ai', tint: 'signal', authOnly: true },
    { icon: MapPinIcon, label: '정비소 지도', desc: '내 주변 정비소 찾기', to: '/map', tint: 'info' },
    { icon: CalendarIcon, label: '내 예약', desc: '예약 현황 확인하기', to: '/my-reservations', tint: 'success', authOnly: true },
    { icon: FileIcon, label: '정비 이력', desc: '지난 정비 기록 보기', to: '/repair-history', tint: 'pending', authOnly: true },
    { icon: HistoryIcon, label: 'AI 분석 이력', desc: '지난 분석 결과 다시보기', to: '/ai/history', tint: 'danger', authOnly: true },
    { icon: WrenchIcon, label: '정비소 예약관리', desc: '접수된 예약 처리하기', to: '/shop-reservations', tint: 'ink' },
];

export default function Main() {
    const { loginUser } = useAuth();

    return (
        <div className="page page--wide">
            <PromoBanner slides={SLIDES} />

            <div className="section-title-row" style={{ marginTop: 48 }}>
                <div>
                    <span className="eyebrow">SERVICES</span>
                    <h2>바로가기</h2>
                </div>
            </div>

            <div className="feature-grid">
                {FEATURES.map(({ icon: Icon, label, desc, to, tint, authOnly }) => (
                    <Link
                        key={label}
                        to={authOnly && !loginUser ? '/login' : to}
                        className="feature-tile"
                    >
                        <span className={`feature-tile__icon feature-tile__icon--${tint}`}>
                            <Icon />
                        </span>
                        <span className="feature-tile__label">{label}</span>
                        <span className="feature-tile__desc">{desc}</span>
                    </Link>
                ))}
            </div>

            {!loginUser && (
                <p style={{ marginTop: 32, fontSize: 14, textAlign: 'center' }}>
                    로그인하시면 예약, AI 분석 등 모든 기능을 이용하실 수 있습니다.
                </p>
            )}
        </div>
    );
}