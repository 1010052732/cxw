import { Navigate, createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import RouteGuard from '../auth/RouteGuard'
import HomePage from '../pages/business/home'
import OpportunityClassifyPage from '../pages/business/opportunity/classify'
import OpportunityHallPage from '../pages/business/opportunity/hall'
import OpportunityDetailPage from '../pages/business/opportunity/detail'
import OpportunityEvaluationPage from '../pages/business/opportunity/evaluation'
import OpportunityReportPage from '../pages/business/opportunity/report'
import ReportGeneratePage from '../pages/business/opportunity/report/generate'
import AnalysisMarketPage from '../pages/business/analysis/market'
import AnalysisProductPage from '../pages/business/analysis/product'
import AnalysisEnterprisePage from '../pages/business/analysis/enterprise'
import RiskIdentificationPage from '../pages/business/risk/identification'
import RiskSituationPage from '../pages/business/risk/situation'
import RiskAssessmentPage from '../pages/business/risk/assessment'
import RiskResponsePage from '../pages/business/risk/response'
import RiskCasePage from '../pages/business/risk/case'
import RiskLocationPage from '../pages/business/risk/location'
import MessagePage from '../pages/business/message'
import DataConfigPage from '../pages/data-governance/config'
import DataMonitorPage from '../pages/data-governance/monitor'
import CollectionTaskDetailPage from '../pages/data-governance/monitor/task'
import DataQualityPage from '../pages/data-governance/quality'
import ModelAlgorithmPage from '../pages/data-governance/models'
import DataStoragePage from '../pages/data-governance/storage'
import RbacLegacyRedirect from '../pages/system/rbac'
import DepartmentPage from '../pages/system/department'
import RolePage from '../pages/system/role'
import AccountPage from '../pages/system/account'
import PermissionPage from '../pages/system/permission'
import AuditPage from '../pages/system/audit'
import ProfilePage from '../pages/system/profile'
import NotFoundPage from '../pages/system/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        element: <RouteGuard />,
        children: [
          { index: true, element: <Navigate to="/home" replace /> },
          { path: 'home', element: <HomePage /> },
          { path: 'opportunity/classify', element: <OpportunityClassifyPage /> },
          { path: 'opportunity/detail/:id', element: <OpportunityDetailPage /> },
          { path: 'opportunity/hall', element: <OpportunityHallPage /> },
          { path: 'opportunity/evaluation', element: <OpportunityEvaluationPage /> },
          { path: 'opportunity/report/generate', element: <ReportGeneratePage /> },
          { path: 'opportunity/report/:id', element: <OpportunityReportPage /> },
          { path: 'analysis/market', element: <AnalysisMarketPage /> },
          { path: 'analysis/product', element: <AnalysisProductPage /> },
          { path: 'analysis/enterprise', element: <AnalysisEnterprisePage /> },
          { path: 'risk/identification', element: <RiskIdentificationPage /> },
          { path: 'risk/situation', element: <RiskSituationPage /> },
          { path: 'risk/assessment', element: <RiskAssessmentPage /> },
          { path: 'risk/response', element: <RiskResponsePage /> },
          { path: 'risk/case', element: <RiskCasePage /> },
          { path: 'risk/location', element: <RiskLocationPage /> },
          { path: 'message', element: <MessagePage /> },
          { path: 'data/config', element: <DataConfigPage /> },
          { path: 'data/monitor', element: <DataMonitorPage /> },
          { path: 'data/monitor/task/:taskId', element: <CollectionTaskDetailPage /> },
          { path: 'data/quality', element: <DataQualityPage /> },
          { path: 'data/models', element: <ModelAlgorithmPage /> },
          { path: 'data/storage', element: <DataStoragePage /> },
          { path: 'system/profile', element: <ProfilePage /> },
          { path: 'system/department', element: <DepartmentPage /> },
          { path: 'system/role', element: <RolePage /> },
          { path: 'system/account', element: <AccountPage /> },
          { path: 'system/permission', element: <PermissionPage /> },
          { path: 'system/audit', element: <AuditPage /> },
          { path: 'system/rbac', element: <RbacLegacyRedirect /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
