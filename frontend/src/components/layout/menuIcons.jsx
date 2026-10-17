import {
  Bell,
  CalendarDays,
  CalendarClock,
  Clock3,
  Heart,
  Home,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  MessagesSquare,
  Scissors,
  Settings,
  ShieldCheck,
  Users,
  UserRound,
} from 'lucide-react';

export const menuIcons = {
  bell: Bell,
  calendar: CalendarDays,
  clock: Clock3,
  dashboard: LayoutDashboard,
  heart: Heart,
  home: Home,
  menu: Menu,
  messages: MessagesSquare,
  scissors: Scissors,
  security: ShieldCheck,
  settings: Settings,
  users: Users,
  user: UserRound,
  calendarClock: CalendarClock,
  lock: LockKeyhole,
  logout: LogOut,
};

export function MenuIcon({ iconKey, className = 'h-4 w-4' }) {
  const Icon = menuIcons[iconKey] ?? Menu;
  return <Icon className={className} aria-hidden="true" />;
}
