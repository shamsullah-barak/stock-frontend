import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Router from './routes';
import ThemeProvider from './theme';
import ScrollToTop from './components/scroll-to-top';
import { fetchCategories } from './store/slices/action';

export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCategories());
  }, []);
  return (
    <ThemeProvider>
      <div>
        <Toaster />
      </div>
      <ScrollToTop />
      <Router />
    </ThemeProvider>
  );
}
