// 서비스 타일용 간단한 라인 아이콘 모음.
// 외부 아이콘 라이브러리 없이 사이트 톤에 맞춘 stroke 아이콘만 사용한다.

const base = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
};

export function ScanIcon(props) {
    return (
        <svg {...base} {...props}>
            <path d="M4 8V6a2 2 0 0 1 2-2h2" />
            <path d="M20 8V6a2 2 0 0 0-2-2h-2" />
            <path d="M4 16v2a2 2 0 0 0 2 2h2" />
            <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

export function MapPinIcon(props) {
    return (
        <svg {...base} {...props}>
            <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.4" />
        </svg>
    );
}

export function CalendarIcon(props) {
    return (
        <svg {...base} {...props}>
            <rect x="3.5" y="5" width="17" height="15" rx="2" />
            <path d="M3.5 10h17" />
            <path d="M8 3v4" />
            <path d="M16 3v4" />
        </svg>
    );
}

export function FileIcon(props) {
    return (
        <svg {...base} {...props}>
            <path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L13.5 3Z" />
            <path d="M13 3v5.5h5.5" />
            <path d="M8.5 13h7" />
            <path d="M8.5 17h7" />
        </svg>
    );
}

export function HistoryIcon(props) {
    return (
        <svg {...base} {...props}>
            <path d="M3.5 12a8.5 8.5 0 1 0 2.8-6.3" />
            <path d="M3.5 4.5v4h4" />
            <path d="M12 8v4.5l3 2" />
        </svg>
    );
}

export function WrenchIcon(props) {
    return (
        <svg {...base} {...props}>
            <path d="M14.7 6.3a4 4 0 0 0-5.2 4.9L4 16.7 7.3 20l5.5-5.5a4 4 0 0 0 4.9-5.2l-2.6 2.6-2.6-2.6 2.2-2Z" />
        </svg>
    );
}

export function UserIcon(props) {
    return (
        <svg {...base} {...props}>
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
        </svg>
    );
}

export function CarIcon(props) {
    return (
        <svg {...base} {...props}>
            <path d="M4 16v-3.5L6 7.5A2 2 0 0 1 7.9 6h8.2a2 2 0 0 1 1.9 1.5L20 12.5V16" />
            <path d="M4 16h16v2.5a1 1 0 0 1-1 1h-1.2a1 1 0 0 1-1-1V17H7.2v1.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V16Z" />
            <circle cx="7.5" cy="16" r="1.4" />
            <circle cx="16.5" cy="16" r="1.4" />
        </svg>
    );
}