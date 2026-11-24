import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { LoginService } from '../services/login-service';

export const loginInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(LoginService);
  const router = inject(Router);
  const token = auth.token();
  const esAuth = req.url.includes('/auth/');
  const peticion = token && !esAuth ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : req;
  return next(peticion).pipe(
    catchError((err: HttpErrorResponse) => {
      const sesionInvalida = err.status === 401 || (err.status === 403 && auth.tokenVencido());
      if (sesionInvalida && !esAuth && auth.logueado()) {
        auth.limpiarSesion();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
