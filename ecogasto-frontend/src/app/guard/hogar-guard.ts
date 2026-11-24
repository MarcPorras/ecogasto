import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login-service';

export const hogarGuard: CanActivateFn = () => {
  const auth = inject(LoginService);
  const router = inject(Router);
  return auth.tieneHogar() ? true : router.createUrlTree(['/hogar']);
};
