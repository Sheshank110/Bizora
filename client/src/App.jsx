import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import AppRouter from './routes/AppRouter';
import ToastContainer from './components/ui/Toast';
import { useThemeStore } from './store/themeStore';
import AuthInitializer from './components/auth/AuthInitializer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ThemeInitializer = () => {
  const initTheme = useThemeStore((s) => s.initTheme);
  useEffect(() => {
    initTheme();
  }, [initTheme]);
  return null;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeInitializer />
        <AuthInitializer>
          <AppRouter />
          <ToastContainer />
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
