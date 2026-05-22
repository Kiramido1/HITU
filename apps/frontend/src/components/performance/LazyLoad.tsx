import React, { Suspense, lazy } from 'react';
import { LoadingScreen } from '../ui/LoadingScreen';

interface LazyLoadProps {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  fallback?: React.ReactNode;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  component: Component,
  fallback = <LoadingScreen message="Loading..." />
}) => {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
};

// Lazy load page components
export const LazyDashboard = lazy(() => import('../../pages/DashboardPage'));
// export const LazySchedules = lazy(() => import('../../pages/Schedules'));
// export const LazyCourses = lazy(() => import('../../pages/Courses'));
// export const LazyHalls = lazy(() => import('../../pages/Halls'));
// export const LazyDoctors = lazy(() => import('../../pages/Doctors'));
// export const LazyAnalytics = lazy(() => import('../../pages/Analytics'));
export const LazyNotifications = lazy(() => import('../../pages/Notifications'));
export const LazySettings = lazy(() => import('../../pages/Settings'));
export const LazyProfile = lazy(() => import('../../pages/Profile'));
export const LazyAuditLogs = lazy(() => import('../../pages/AuditLogs'));
