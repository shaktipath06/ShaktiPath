// "Download Our App" band. The QR placeholder and store links are replaced once the apps are published.
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import { cx } from '@/components/ui/utils';
import { APP_BAND } from '@/content/home';
import { APP_STORE_LINKS } from '@/content/site';
import styles from '@/app/page.module.css';

export default function DownloadApp() {
  return (
    <section aria-labelledby="app-title" className={cx(styles.section, styles.appBand)}>
      <div className={cx(styles.wrap, styles.app)}>
        <div className={styles.appCopy}>
          <h2 id="app-title" className={cx(styles.h2, styles.appTitle)}>
            {APP_BAND.title}
          </h2>
          <p className={styles.appTagline}>{APP_BAND.tagline}</p>
          <ul className={styles.appList}>
            {APP_BAND.points.map((point) => (
              <li key={point}>
                <span className={styles.appTick}>
                  <Icon name="circle-check" size={20} />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <div className={styles.appStores}>
            <div className={styles.qr}>
              <Icon name="qr-code" size={40} />
              [QR code]
            </div>
            <div className={styles.storeLinks}>
              <a href={APP_STORE_LINKS.playStore} className={styles.store}>
                <Icon name="smartphone" size={22} />
                <span>
                  <small>Android app</small>Google Play
                </span>
              </a>
              <a href={APP_STORE_LINKS.appStore} className={styles.store}>
                <Icon name="smartphone" size={22} />
                <span>
                  <small>iPhone app</small>App Store
                </span>
              </a>
            </div>
            <p className={styles.storeNote}>{APP_BAND.qrNote}</p>
          </div>
        </div>
        <div className={styles.appShowcase}>
          <Image
            className={styles.appPhones}
            src={APP_BAND.image}
            alt={APP_BAND.imageAlt}
            width={480}
            height={400}
            sizes="300px"
          />
          <p className={styles.appQuote}>
            {APP_BAND.quote.lead}
            <span>{APP_BAND.quote.accent}</span>
            <br />
            {APP_BAND.quote.tail}
          </p>
        </div>
      </div>
    </section>
  );
}
