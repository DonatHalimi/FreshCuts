import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import AppShell from './components/layout/AppShell.jsx';
import { fetchMe } from './store/authSlice.js';
import ScrollToTop from './components/ui/ScrollToTop.jsx';

export default function App() {
  const dispatch = useDispatch();
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <>
      <ScrollToTop />
      <AppShell />
    </>
  );
}