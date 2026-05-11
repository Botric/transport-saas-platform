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

// Role constants for readability
const ROUTE_ROLES   = ['route_manager', 'org_admin', 'super_admin'];
const DRIVER_ROLES  = ['driver_app_manager', 'org_admin', 'super_admin'];
const FINANCE_ROLES = ['finance', 'org_admin', 'super_admin'];
const API_ROLES     = ['api_admin', 'org_admin', 'super_admin'];
const TICKET_ROLES  = ['route_manager', 'finance', 'org_admin', 'super_admin'];

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            {/* Any authenticated user can access live tracking */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<LiveTrackingPage />} />
                {/* Route management */}
                <Route element={<ProtectedRoute roles={ROUTE_ROLES} />}>
                  <Route path="/regions" element={<RegionsPage />} />
                  <Route path="/routes" element={<RoutesPage />} />
                  <Route path="/departures" element={<DeparturesPage />} />
                </Route>
                {/* Driver app management */}
                <Route element={<ProtectedRoute roles={DRIVER_ROLES} />}>
                  <Route path="/activation-codes" element={<ActivationCodesPage />} />
                  <Route path="/vehicles" element={<VehiclesPage />} />
                </Route>
                {/* Ticketing */}
                <Route element={<ProtectedRoute roles={TICKET_ROLES} />}>
                  <Route path="/tickets" element={<TicketProductsPage />} />
                </Route>
                {/* Finance */}
                <Route element={<ProtectedRoute roles={FINANCE_ROLES} />}>
                  <Route path="/finance" element={<FinanceOrdersPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                </Route>
                {/* API keys */}
                <Route element={<ProtectedRoute roles={API_ROLES} />}>
                  <Route path="/api-keys" element={<ApiKeysPage />} />
                </Route>
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
