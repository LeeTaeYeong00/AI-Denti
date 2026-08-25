import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AUTOPLAY_MS = 5000;

// slides: [{ eyebrow, title, subtitle, cta, to, background }]
export default function PromoBanner({ slides }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % slides.length);
        }, AUTOPLAY_MS);
        return () => clearInterval(timer);
    }, [slides.length]);

    if (!slides || slides.length === 0) return null;

    const goTo = (i) => setIndex(((i % slides.length) + slides.length) % slides.length);
    const slide = slides[index];

    return (
        <div className="banner" style={{ background: slide.background }}>
            {slides.length > 1 && (
                <button
                    type="button"
                    className="banner__arrow banner__arrow--prev"
                    onClick={() => goTo(index - 1)}
                    aria-label="이전 배너"
                >
                    ‹
                </button>
            )}

            <div className="banner__content">
                {slide.eyebrow && <span className="banner__eyebrow">{slide.eyebrow}</span>}
                <h2 className="banner__title">{slide.title}</h2>
                {slide.subtitle && <p className="banner__subtitle">{slide.subtitle}</p>}
                {slide.cta && slide.to && (
                    <Link to={slide.to} style={{ display: 'inline-block', marginTop: 18 }}>
                        <button className="btn btn-primary">{slide.cta}</button>
                    </Link>
                )}
            </div>

            {slides.length > 1 && (
                <button
                    type="button"
                    className="banner__arrow banner__arrow--next"
                    onClick={() => goTo(index + 1)}
                    aria-label="다음 배너"
                >
                    ›
                </button>
            )}

            {slides.length > 1 && (
                <div className="banner__dots">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            className={`banner__dot ${i === index ? 'banner__dot--active' : ''}`}
                            onClick={() => goTo(i)}
                            aria-label={`${i + 1}번째 배너로 이동`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}