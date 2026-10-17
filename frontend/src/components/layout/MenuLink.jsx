import { NavLink } from 'react-router-dom';
import { MenuIcon } from './menuIcons.jsx';

export default function MenuLink({ item, className, iconClassName, role, onClick }) {
  const classes = typeof className === 'function' ? className : () => className ?? '';
  const content = (
    <>
      {item.iconKey ? <MenuIcon iconKey={item.iconKey} className={iconClassName} /> : null}
      <span>{item.label}</span>
    </>
  );

  if (/^https:\/\//i.test(item.href ?? '')) {
    return (
      <a
        href={item.href}
        target={item.openInNewTab ? '_blank' : undefined}
        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
        className={classes({ isActive: false })}
        role={role}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <NavLink
      to={item.href || '/'}
      end={item.href === '/' || item.href === '/admin' || item.href === '/staff'}
      className={classes}
      role={role}
      onClick={onClick}
    >
      {content}
    </NavLink>
  );
}
