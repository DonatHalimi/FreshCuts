import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { fetchMe } from './store/authSlice.js';

export default function App() {
  const dispatch = useDispatch();
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    dispatch(fetchMe());
  }, [dispatch]);

  return <Outlet />;
}