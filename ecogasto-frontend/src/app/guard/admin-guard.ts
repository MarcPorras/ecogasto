import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login-service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(LoginService);
  const router = inject(Router);
  if (!auth.logueado() || !auth.esAdmin()) {
    return router.createUrlTree(['/admin-login']);
  }
  return true;
};