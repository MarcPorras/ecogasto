import { Routes } from '@angular/router';
import { adminGuard } from './guard/admin-guard';
import { authGuard } from './guard/auth-guard';
import { hogarGuard } from './guard/hogar-guard';
import { HomeComponent } from './components/home-component/home-component';

const protegidas = [authGuard, hogarGuard];

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login-component/login-component').then((m) => m.LoginComponent) },
  { path: 'hogar', canActivate: [authGuard], loadComponent: () => import('./components/hogar-nuevo-edit-component/hogar-nuevo-edit-component').then((m) => m.HogarNuevoEditComponent) },
  { path: 'consumo', canActivate: protegidas, loadComponent: () => import('./components/consumo-component/consumo-component').then((m) => m.ConsumoComponent) },
  { path: 'impacto', canActivate: protegidas, loadComponent: () => import('./components/impacto-component/impacto-component').then((m) => m.ImpactoComponent) },
  { path: 'tips', canActivate: protegidas, loadComponent: () => import('./components/tips-component/tips-component').then((m) => m.TipsComponent) },
  { path: 'comparar', canActivate: protegidas, loadComponent: () => import('./components/comparar-component/comparar-component').then((m) => m.CompararComponent) },
  { path: 'estadisticas', canActivate: protegidas, loadComponent: () => import('./components/estadisticas-component/estadisticas-component').then((m) => m.EstadisticasComponent) },
  { path: 'notificaciones', canActivate: protegidas, loadComponent: () => import('./components/notificaciones-component/notificaciones-component').then((m) => m.NotificacionesComponent) },
  { path: 'preferencias', canActivate: protegidas, loadComponent: () => import('./components/preferencias-component/preferencias-component').then((m) => m.PreferenciasComponent) },
  { path: 'social', canActivate: protegidas, loadComponent: () => import('./components/social-component/social-component').then((m) => m.SocialComponent) },
  { path: 'admin-login', loadComponent: () => import('./components/admin-login-component/admin-login-component').then((m) => m.AdminLoginComponent) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./components/admin-component/admin-component').then((m) => m.AdminComponent),
    children: [
      { path: '', redirectTo: 'resumen', pathMatch: 'full' },
      { path: 'resumen', loadComponent: () => import('./components/admin-resumen-component/admin-resumen-component').then((m) => m.AdminResumenComponent) },
      { path: 'usuarios', loadComponent: () => import('./components/admin-usuario-listar-component/admin-usuario-listar-component').then((m) => m.AdminUsuarioListarComponent) },
      { path: 'usuarios/nuevo', loadComponent: () => import('./components/admin-usuario-nuevo-edit-component/admin-usuario-nuevo-edit-component').then((m) => m.AdminUsuarioNuevoEditComponent) },
      { path: 'usuarios/editar/:id', loadComponent: () => import('./components/admin-usuario-nuevo-edit-component/admin-usuario-nuevo-edit-component').then((m) => m.AdminUsuarioNuevoEditComponent) },
      { path: 'consumos', loadComponent: () => import('./components/admin-consumo-listar-component/admin-consumo-listar-component').then((m) => m.AdminConsumoListarComponent) },
      { path: 'consumos/nuevo', loadComponent: () => import('./components/admin-consumo-nuevo-edit-component/admin-consumo-nuevo-edit-component').then((m) => m.AdminConsumoNuevoEditComponent) },
      { path: 'consumos/editar/:id', loadComponent: () => import('./components/admin-consumo-nuevo-edit-component/admin-consumo-nuevo-edit-component').then((m) => m.AdminConsumoNuevoEditComponent) },
      { path: 'tarifas', loadComponent: () => import('./components/admin-tarifa-listar-component/admin-tarifa-listar-component').then((m) => m.AdminTarifaListarComponent) },
      { path: 'tarifas/nuevo', loadComponent: () => import('./components/admin-tarifa-nuevo-edit-component/admin-tarifa-nuevo-edit-component').then((m) => m.AdminTarifaNuevoEditComponent) },
      { path: 'tarifas/editar/:id', loadComponent: () => import('./components/admin-tarifa-nuevo-edit-component/admin-tarifa-nuevo-edit-component').then((m) => m.AdminTarifaNuevoEditComponent) },
      { path: 'zonas', loadComponent: () => import('./components/admin-zona-listar-component/admin-zona-listar-component').then((m) => m.AdminZonaListarComponent) },
      { path: 'zonas/nuevo', loadComponent: () => import('./components/admin-zona-nuevo-edit-component/admin-zona-nuevo-edit-component').then((m) => m.AdminZonaNuevoEditComponent) },
      { path: 'zonas/editar/:id', loadComponent: () => import('./components/admin-zona-nuevo-edit-component/admin-zona-nuevo-edit-component').then((m) => m.AdminZonaNuevoEditComponent) },
      { path: 'tips', loadComponent: () => import('./components/admin-ecotip-listar-component/admin-ecotip-listar-component').then((m) => m.AdminEcotipListarComponent) },
      { path: 'tips/nuevo', loadComponent: () => import('./components/admin-ecotip-nuevo-edit-component/admin-ecotip-nuevo-edit-component').then((m) => m.AdminEcotipNuevoEditComponent) },
      { path: 'tips/editar/:id', loadComponent: () => import('./components/admin-ecotip-nuevo-edit-component/admin-ecotip-nuevo-edit-component').then((m) => m.AdminEcotipNuevoEditComponent) },
      { path: 'retos', loadComponent: () => import('./components/admin-reto-listar-component/admin-reto-listar-component').then((m) => m.AdminRetoListarComponent) },
      { path: 'retos/nuevo', loadComponent: () => import('./components/admin-reto-nuevo-edit-component/admin-reto-nuevo-edit-component').then((m) => m.AdminRetoNuevoEditComponent) },
      { path: 'retos/editar/:id', loadComponent: () => import('./components/admin-reto-nuevo-edit-component/admin-reto-nuevo-edit-component').then((m) => m.AdminRetoNuevoEditComponent) },
      { path: 'auditoria', loadComponent: () => import('./components/admin-auditoria-component/admin-auditoria-component').then((m) => m.AdminAuditoriaComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
