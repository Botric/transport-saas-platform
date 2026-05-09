import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import LiveTrackingPage from './pages/LiveTrackingPage'
import RegionsPage from './pages/regions/RegionsPage'
import RoutesPage from './pages/routes/RoutesPage'
import DeparturesPage from './pages/departures/DeparturesPage'
import ActivationCodesPage from './pages/driver-app/ActivationCodesPage'
import VehiclesPage from './pages/driver-app/VehiclesPage'
import TicketProductsPage from './pages/ticketing/TicketProductsPage'
import FinanceOrdersPage from './pages/ticketing/FinanceOrdersPage'
import ApiKeysPage from './pages/settings/ApiKeysPage'
import ReportsPage from './pages/reports/ReportsPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<LiveTrackingPage />} />
                <Route path="/regions" element={<RegionsPage />} />
                <Route path="/routes" element={<RoutesPage />} />
                <Route path="/departures" element={<DeparturesPage />} />
                <Route path="/activation-codes" element={<ActivationCodesPage />} />
                <Route path="/vehicles" element={<VehiclesPage />} />
                <Route path="/tickets" element={<TicketProductsPage />} />
                <Route path="/finance" element={<FinanceOrdersPage />} />
                <Route path="/api-keys" element={<ApiKeysPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
