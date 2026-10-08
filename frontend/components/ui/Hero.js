'use client';

import { Fragment, useEffect, useId, useState } from 'react';
import Image from 'next/image';
import Breadcrumb from './Breadcrumb';
import Button from './Button';
import TrustItem from './TrustItem';
import { cx, list } from './utils';

/**
 * Page hero. variant "home" is the tall homepage hero with a photo slideshow sliding in from the left
 * (`images`, `interval` in ms); variant "banner" is the inner-page banner with a breadcrumb.
 * `title` may contain "\n" for a line break; `accent` is the gold word on its own line.
 */
export default function Hero({
  variant = 'home',
  id,
  image,
  images,
  interval = 2000,
  showcaseImage = false,
  className,
  title,
  accent,
  accentInline = false,
  subtitle,
  ctaLabel,
  ctaHref = '#',
  onCtaClick,
  breadcrumb,
  mantra,
  mantraLang = 'hi',
  aside,
  trust,
  trustLayout,
  children,
}) {
  const generatedId = useId();
  const titleId = id || `sp-hero-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const trustItems = list(trust).map((t) => (typeof t === 'string' ? { title: t } : t || {}));
  const plain = trustLayout === 'plain';
  const tiles = plain || trustLayout === 'tiles';

  let slides = list(images)
    .map((s) => (typeof s === 'string' ? s : (s && (s.src || s.image)) || ''))
    .filter(Boolean);
  if (!slides.length && image) slides = [image];
  const many = slides.length > 1;
  const every = Math.max(1000, Number(interval) || 2000);

  const [current, setCurrent] = useState({ i: 0, prev: -1 });
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!many || paused) return undefined;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setInterval(() => {
      setCurrent((s) => ({ i: (s.i + 1) % slides.length, prev: s.i }));
    }, every);
    return () => clearInterval(timer);
  }, [many, paused, every, slides.length]);

  const at = current.i % (slides.length || 1);
  const open = !(trustItems.length && !tiles) && !mantra && !aside;
  const titleLines = String(title == null ? '' : title).split('\n');

  return (
    <section
      className={cx(
        'sp',
        'sp-hero',
        `sp-hero--${variant}`,
        open && 'sp-hero--open',
        showcaseImage && 'sp-hero--photo',
        showcaseImage === 'fit' && 'sp-hero--photo-fit',
        className,
      )}
      aria-labelledby={titleId}
    >
      {slides.length ? (
        <div className="sp-hero__slides" aria-hidden="true">
          {slides.map((src, i) => (
            <Image
              key={`${i}-${src}`}
              className={cx('sp-hero__img', i === at && 'is-active', many && i === current.prev && i !== at && 'is-prev')}
              src={src}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 72vw"
              priority={i === 0}
            />
          ))}
        </div>
      ) : null}
      <span className="sp-hero__shade" aria-hidden="true" />
      {many ? (
        <button type="button" className="sp-hero__pause" aria-pressed={paused} onClick={() => setPaused(!paused)}>
          {paused ? 'Play slides' : 'Pause slides'}
        </button>
      ) : null}
      <div className="sp-hero__inner">
        <div className="sp-hero__copy">
          {list(breadcrumb).length ? <Breadcrumb items={breadcrumb} tone="dark" /> : null}
          <h1 id={titleId} className="sp-hero__title">
            {titleLines.map((line, i) => (
              <Fragment key={i}>
                {i ? <br /> : null}
                {line}
              </Fragment>
            ))}
            {accent ? (
              <>
                {accentInline ? ' ' : <br />}
                <span className="sp-hero__accent">{accent}</span>
              </>
            ) : null}
          </h1>
          {subtitle ? <p className="sp-hero__sub">{subtitle}</p> : null}
          {ctaLabel ? (
            <Button size={variant === 'home' ? 'lg' : 'md'} arrow href={ctaHref} onClick={onCtaClick} className="sp-hero__cta">
              {ctaLabel}
            </Button>
          ) : null}
          {trustItems.length && tiles ? (
            <ul className={cx('sp-hero__trust', 'sp-hero__trust--tiles', plain && 'sp-hero__trust--plain')}>
              {trustItems.map((t, i) => (
                <li key={i}>
                  <TrustItem icon={t.icon} title={t.title} description={t.description} tone="dark" layout="stack" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {mantra || aside ? (
          <div className="sp-hero__aside">
            {mantra ? (
              <p className="sp-hero__mantra" lang={mantraLang}>
                {mantra}
              </p>
            ) : null}
            {aside ? <p className="sp-hero__asidequote">{aside}</p> : null}
          </div>
        ) : null}
        {trustItems.length && !tiles ? (
          <ul className="sp-hero__trust">
            {trustItems.map((t, i) => (
              <li key={i}>
                <TrustItem icon={t.icon} title={t.title} description={t.description} tone="dark" />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {children ? <div className="sp-hero__slot">{children}</div> : null}
    </section>
  );
}
