import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Auditoria } from '../../model/auditoria';
import { AdminService } from '../../services/admin-service';
import { AvisoService } from '../../services/aviso-service';

@Component({
  imports: [DatePipe, MatTableModule, MatSortModule, MatPaginator],
  selector: 'app-admin-auditoria-component',
  styleUrl: '../admin-listar.css',
  templateUrl: './admin-auditoria-component.html',
})
export class AdminAuditoriaComponent implements OnInit, AfterViewInit {
  private adminService: AdminService = inject(AdminService);
  private aviso: AvisoService = inject(AvisoService);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  columnas: string[] = ['idAuditoria', 'fecha', 'usuario', 'accion', 'tabla', 'detalle'];
  datos = new MatTableDataSource<Auditoria>([]);
  cargando = signal(true);

  ngOnInit(): void {
    this.adminService.auditoria().subscribe({
      next: (lista) => {
        this.datos.data = lista;
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.aviso.fallo(err, 'No se pudo cargar la auditoría');
      },
    });
  }

  ngAfterViewInit(): void {
    this.datos.paginator = this.paginator;
    this.datos.sort = this.sort;
  }

  filtrar(evento: Event): void {
    this.datos.filter = (evento.target as HTMLInputElement).value.trim().toLowerCase();
    this.datos.paginator?.firstPage();
  }
}
