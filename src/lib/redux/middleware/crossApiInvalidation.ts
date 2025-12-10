import type { Middleware } from '@reduxjs/toolkit';
import { isAnyOf } from '@reduxjs/toolkit';

import { declarationApi } from '../services/declaration.service';
import { dashboardApi } from '../services/dashboard.service';

/**
 * Middleware to handle cache invalidation across different RTK Query APIs.
 * When a declaration is submitted, updated, or deleted, this middleware
 * invalidates the dashboard API cache to ensure fresh data is displayed.
 */
export const crossApiInvalidationMiddleware: Middleware = (api) => (next) => (action) => {
  const result = next(action);

  // Check if a declaration mutation was fulfilled
  const isDeclarationMutation = isAnyOf(
    declarationApi.endpoints.submitDeclaration.matchFulfilled,
    declarationApi.endpoints.updateDeclaration.matchFulfilled,
    declarationApi.endpoints.deleteDeclaration.matchFulfilled
  )(action);

  if (isDeclarationMutation) {
    // Invalidate dashboard API tags to refetch user declaration status
    api.dispatch(
      dashboardApi.util.invalidateTags(['UserDeclarationStatus', 'DashboardMetrics'])
    );
  }

  return result;
};
