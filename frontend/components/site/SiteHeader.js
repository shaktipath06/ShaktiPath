'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import IconButton from '../ui/IconButton';
import Logo from '../ui/Logo';
import SearchBar from '../ui/SearchBar';
import { cx } from '../ui/utils';
import { useCart } from '@/components/shop/CartProvider';
import { NAV_LINKS } from '@/content/site';

// Where the header's search field sends its query, by section of the site (as in the approved design:
// the Find a Tantric and Shop pages carry a search field; the cart button appears on the shop).
function searchFor(pathname) {
  if (pathname.startsWith('/shop')) return { action: '/shop', placeholder: 'Search products, rituals, books' };
  if (pathname.startsWith('/consult') || pathname.startsWith('/tantrics')) {
    return { action: '/consult', placeholder: 'Search tantrics, rituals' };
  }
  return null;
}

/**
 * Site header: logo, main navigation (folds into a menu below 1025px), search (on the search pages, an icon
 * below 1360px), the cart button and Login / Sign Up. The active link, the search field and the cart button
 * follow `pathname`, which components/site/RoutedHeader.js reads from the router.
 */
export default function SiteHeader({
  pathname = '/',
  variant = 'light',
  links = NAV_LINKS,
  homeHref = '/',
  loginHref = '/login',
  signupHref = '/signup',
  userName,
  userAvatar,
  profileHref = '/account',
  logo,
  dropdowns = false,
  skip = true,
  skipHref = '#main',
}) {
  const dark = variant === 'dark';
  const [open, setOpen] = useState(false);
  const navId = useId();
  const cart = useCart();
  const search = searchFor(pathname);
  const showCart = pathname.startsWith('/shop') || cart.count > 0;
  const isActive = (href) => Boolean(href) && href !== '/' && (pathname === href || pathname.startsWith(`${href}/`));

  const auth = userName ? (
    <Link className="sp-header__user" href={profileHref}>
      <Avatar name={userName} src={userAvatar} size={36} alt="" />
      <span>{userName}</span>
    </Link>
  ) : (
    <>
      <Button variant={dark ? 'outline-light' : 'secondary'} size="sm" href={loginHref}>
        Login
      </Button>
      <Button variant={dark ? 'burgundy' : 'primary'} size="sm" href={signupHref}>
        Sign Up
      </Button>
    </>
  );

  return (
    <header
      className={cx('sp', 'sp-header', dark && 'sp-header--dark', search && 'sp-header--search', open && 'is-open')}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) setOpen(false);
      }}
    >
      {skip ? (
        <a className="sp-skip" href={skipHref}>
          Skip to main content
        </a>
      ) : null}
      <div className="sp-header__inner">
        <button
          type="button"
          className="sp-header__menu"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls={navId}
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? 'x' : 'menu'} />
        </button>
        <Link className="sp-header__brand" href={homeHref} aria-label="ShaktiPath home">
          <Logo variant={logo || (dark ? 'reversed' : 'primary')} height={62} alt="" priority />
        </Link>
        <nav id={navId} className="sp-header__nav" aria-label="Main">
          <ul>
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.label}>
                  <Link
                    href={link.href || '#'}
                    className={cx('sp-header__link', active && 'is-active')}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                    {dropdowns ? <Icon name="chevron-down" size={16} /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="sp-header__drawer-auth">{auth}</div>
        </nav>
        <div className="sp-header__actions">
          {search ? (
            <>
              <div className="sp-header__search">
                <SearchBar id="site-search" variant="pill" action={search.action} placeholder={search.placeholder} label="Search the site" />
              </div>
              <IconButton
                icon="search"
                label="Search"
                variant={dark ? 'plain-light' : 'soft'}
                className="sp-header__search-icon"
                href={`${search.action}#search`}
                toggle={false}
              />
            </>
          ) : null}
          {showCart ? (
            <IconButton
              icon="shopping-cart"
              label={`Cart, ${cart.count} ${cart.count === 1 ? 'item' : 'items'}`}
              badge={cart.count}
              variant={dark ? 'plain-light' : 'plain'}
              toggle={false}
              href="/shop#cart"
            />
          ) : null}
          <div className="sp-header__auth">{auth}</div>
        </div>
      </div>
    </header>
  );
}
