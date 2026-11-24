import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext.js';
import { AppShell } from './components/AppShell.js';
const DashboardPage = React.lazy(() => import('./pages/DashboardPage.js').then(module => ({ default: module.DashboardPage })));
const BuilderPage = React.lazy(() => import('./pages/BuilderPage.js').then(module => ({ default: module.BuilderPage })));
const ConversionPage = React.lazy(() => import('./pages/ConversionPage.js').then(module => ({ default: module.ConversionPage })));
const SimulationPage = React.lazy(() => import('./pages/SimulationPage.js').then(module => ({ default: module.SimulationPage })));
import { LandingPage } from './pages/LandingPage.js';
import { DocumentationPage } from './pages/DocumentationPage.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <React.Suspense fallback={<p role="status" className="p-6">Opening workspace…</p>}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/machines" element={<DashboardPage />} />
              <Route path="/builder" element={<BuilderPage />} />
              <Route path="/convert" element={<ConversionPage />} />
              <Route path="/simulate" element={<SimulationPage />} />
              <Route path="/docs" element={<DocumentationPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          </React.Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
