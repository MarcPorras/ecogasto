import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login-service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(LoginService);
  const router = inject(Router);
  if (!auth.logueado()) {
    return router.createUrlTree(['/login']);
  }
  if (auth.esAdmin()) {
    return router.createUrlTree(['/admin']);
  }
  return true;
};
