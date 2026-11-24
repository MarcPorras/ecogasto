import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Reto } from '../../model/reto';
import { RetoService } from '../../services/reto-service';
import { AvisoService } from '../../services/aviso-service';
import { ConfirmDialogo } from '../confirm-dialogo/confirm-dialogo';

@Component({
  imports: [RouterLink, MatButton, MatIconButton, MatIcon, MatTableModule, MatSortModule, MatPaginator],
  selector: 'app-admin-reto-listar-component',
  styleUrl: '../admin-listar.css',
  templateUrl: './admin-reto-listar-component.html',
})
export class AdminRetoListarComponent implements OnInit, AfterViewInit {
  private retoService: RetoService = inject(RetoService);
  private aviso: AvisoService = inject(AvisoService);
  private dialog: MatDialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  columnas: string[] = ['idReto', 'titulo', 'recurso', 'metaPorcentaje', 'puntos', 'activo', 'acciones'];
  datos = new MatTableDataSource<Reto>([]);
  cargando = signal(true);

  ngOnInit(): void {
    this.cargar();
  }

  ngAfterViewInit(): void {
    this.datos.paginator = this.paginator;
    this.datos.sort = this.sort;
  }

  private cargar(): void {
    this.retoService.list().subscribe({
      next: (lista) => {
        this.datos.data = lista;
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.aviso.fallo(err, 'No se pudo cargar la lista');
      },
    });
  }

  filtrar(evento: Event): void {
    this.datos.filter = (evento.target as HTMLInputElement).value.trim().toLowerCase();
    this.datos.paginator?.firstPage();
  }

  abrirDialogo(x: Reto): void {
    this.dialog
      .open(ConfirmDialogo, { data: { titulo: 'Eliminar reto', mensaje: '¿Eliminar ' + (x.titulo) + '? Esta acción no se puede deshacer.' } })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) return;
        this.retoService.delete(x.idReto!).subscribe({
          next: () => {
            this.aviso.ok('Registro eliminado');
            this.cargar();
          },
          error: (err) => this.aviso.fallo(err, 'No se pudo eliminar el registro'),
        });
      });
  }
}
