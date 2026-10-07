import { Clock, Mail, MapPin, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  FacebookIconMonochrome,
  GithubIcon,
  InstagramIcon,
  LinkedInIcon,
} from '../ui/Icons';
import logoIcon from '../../assets/icon.png';

const LAUNCH_YEAR = 2026;

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const yearLabel =
    currentYear === LAUNCH_YEAR ? `${LAUNCH_YEAR}` : `${LAUNCH_YEAR} - ${currentYear}`;

  const footerLinks = {
    social: [
      { href: 'https://facebook.com', icon: <FacebookIconMonochrome className="h-5 w-5 fill-current" />, label: 'Facebook' },
      { href: 'https://instagram.com', icon: <InstagramIcon className="h-5 w-5 fill-current" />, label: 'Instagram' },
      { href: 'https://www.linkedin.com/in/donat-halimi-0719b0193/', icon: <LinkedInIcon className="h-5 w-5 fill-current" />, label: 'LinkedIn' },
      { href: 'https://github.com/DonatHalimi/FreshCuts', icon: <GithubIcon className="h-5 w-5 fill-current" />, label: 'GitHub' },
    ],

    quick: [
      { to: '/', label: 'Home' },
      { to: '/providers', label: 'Providers' },
      { to: '/services', label: 'Services' },
      { to: '/profile', label: 'My Account' },
    ],

    support: [
      { to: '/contact', label: 'Contact Us' },
      { to: '/faq', label: 'FAQs' },
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms of Service' },
    ],

    contact: [
      { linkType: 'external', href: 'mailto:freshcuts.info@gmail.com', icon: <Mail className="h-5 w-5 shrink-0" />, label: 'freshcuts.info@gmail.com' },
      { linkType: 'external', href: 'tel:+38344111222', icon: <PhoneCall className="h-5 w-5 shrink-0" />, label: '+383 44 111 222' },
      { linkType: 'internal', to: '/contact', icon: <MapPin className="h-5 w-5 shrink-0" />, label: 'Ferizaj, Kosovo' },
    ],
  };

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-sage to-sage-dark text-background">
                <img
                  src={logoIcon}
                  alt=""
                  className="h-6 w-6 object-contain"
                />
              </span>
              <span className="text-lg font-semibold tracking-tight text-text">
                FreshCuts
              </span>
            </Link>

            <p className="mb-4 mt-4 text-sm leading-6 text-muted">
              Find your barber or stylist, book your next cut, and manage everything
              in one clean place. Personal care, simplified.
            </p>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-sage">
              Stay connected
            </p>

            <div className="flex gap-4">
              {footerLinks.social.map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-muted transition-colors hover:text-sage-bright"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-sage">
              Discover
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.quick.map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-muted transition-colors hover:text-sage-bright"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-sage">
              Support
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-muted transition-colors hover:text-sage-bright"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-sage">
              Visit us
            </h3>
            <p className="mb-4 text-sm text-muted">
              Questions about a booking? We&apos;re happy to help.
            </p>

            <ul className="space-y-3">
              {footerLinks.contact.map(({ linkType, href, to, icon, label }) => {
                const cls =
                  'flex items-center gap-2.5 text-sm text-muted transition-colors hover:text-sage-bright';
                return (
                  <li key={label}>
                    {linkType === 'external' ? (
                      <a href={href} className={cls}>
                        {icon}
                        <span>{label}</span>
                      </a>
                    ) : (
                      <Link to={to} className={cls}>
                        {icon}
                        <span>{label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row">
          <span>
            &copy; {yearLabel} FreshCuts. All rights reserved.
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Mon – Sat · 9:00 – 20:00
          </span>
          <span>
            Crafted by{' '}
            <a
              href="https://github.com/DonatHalimi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text underline decoration-border underline-offset-2 transition-colors hover:text-sage-bright"
            >
              Donat Halimi
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}