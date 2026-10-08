import Link from 'next/link';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';
import { isInternalHref, labelOf, list } from '../ui/utils';
import { APP_STORE_LINKS, FOOTER_COLUMNS, LEGAL, SITE, SOCIAL_LINKS } from '@/content/site';

function FooterLink({ href = '#', children }) {
  const Tag = isInternalHref(href) ? Link : 'a';
  return <Tag href={href}>{children}</Tag>;
}

/** Site footer: brand, link columns, social, payment methods, app links, legal lines and copyright. */
export default function SiteFooter({
  columns = FOOTER_COLUMNS,
  tagline = SITE.tagline,
  copyright = LEGAL.copyright,
  social = SOCIAL_LINKS,
  payments = ['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking'],
  playStoreHref = APP_STORE_LINKS.playStore,
  appStoreHref = APP_STORE_LINKS.appStore,
  disclaimer = LEGAL.disclaimer,
  legal = LEGAL.lines,
}) {
  const legalLines = list(legal);
  const networks = [
    ['instagram', 'Instagram'],
    ['youtube', 'YouTube'],
    ['facebook', 'Facebook'],
  ];
  return (
    <footer className="sp sp-footer">
      <div className="sp-footer__inner">
        <div className="sp-footer__brand">
          <Logo variant="reversed" height={72} />
          <p>{tagline}</p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} className="sp-footer__col" aria-label={col.title}>
            <h2 className="sp-footer__title">{col.title}</h2>
            <ul>
              {list(col.links).map((link, i) => (
                <li key={i}>
                  <FooterLink href={(link && link.href) || '#'}>{labelOf(link)}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="sp-footer__col">
          <h2 className="sp-footer__title">Follow Us</h2>
          <div className="sp-footer__social">
            {networks.map(([key, name]) => (
              <a key={key} href={social[key] || '#'} aria-label={`ShaktiPath on ${name}`}>
                <Icon name={key} size={24} />
              </a>
            ))}
          </div>
          <h2 className="sp-footer__title sp-footer__title--gap">We Accept</h2>
          <ul className="sp-footer__pay" aria-label="Accepted payment methods">
            {list(payments).map((m, i) => (
              <li key={i}>{labelOf(m)}</li>
            ))}
          </ul>
        </div>
        <div className="sp-footer__col">
          <h2 className="sp-footer__title">Download App</h2>
          <a className="sp-footer__store" href={playStoreHref}>
            <Icon name="smartphone" size={20} />
            <span>
              <small>Android app</small>Google Play
            </span>
          </a>
          <a className="sp-footer__store" href={appStoreHref}>
            <Icon name="smartphone" size={20} />
            <span>
              <small>iPhone app</small>App Store
            </span>
          </a>
        </div>
      </div>
      {disclaimer || legalLines.length ? (
        <div className="sp-footer__legal">
          {disclaimer ? <p className="sp-footer__disclaimer">{disclaimer}</p> : null}
          {legalLines.map((line, i) => (
            <p key={i}>{labelOf(line)}</p>
          ))}
        </div>
      ) : null}
      <div className="sp-footer__bottom">
        <p>{copyright}</p>
      </div>
    </footer>
  );
}
