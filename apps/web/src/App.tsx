import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext.js';
import { AppShell } from './components/AppShell.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { BuilderPage } from './pages/BuilderPage.js';
import { ConversionPage } from './pages/ConversionPage.js';
import { SimulationPage } from './pages/SimulationPage.js';
import { TestResultsPage } from './pages/TestResultsPage.js';
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
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/builder" element={<BuilderPage />} />
              <Route path="/convert" element={<ConversionPage />} />
              <Route path="/simulate" element={<SimulationPage />} />
              <Route path="/tests" element={<TestResultsPage />} />
              <Route path="/docs" element={<DocumentationPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
