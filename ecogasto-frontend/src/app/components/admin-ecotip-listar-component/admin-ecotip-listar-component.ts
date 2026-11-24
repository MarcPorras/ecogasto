import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Ecotip } from '../../model/ecotip';
import { EcotipService } from '../../services/ecotip-service';
import { AvisoService } from '../../services/aviso-service';
import { ConfirmDialogo } from '../confirm-dialogo/confirm-dialogo';

@Component({
  imports: [RouterLink, MatButton, MatIconButton, MatIcon, MatTableModule, MatSortModule, MatPaginator],
  selector: 'app-admin-ecotip-listar-component',
  styleUrl: '../admin-listar.css',
  templateUrl: './admin-ecotip-listar-component.html',
})
export class AdminEcotipListarComponent implements OnInit, AfterViewInit {
  private ecotipService: EcotipService = inject(EcotipService);
  private aviso: AvisoService = inject(AvisoService);
  private dialog: MatDialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  columnas: string[] = ['idTip', 'recurso', 'segmento', 'texto', 'activo', 'acciones'];
  datos = new MatTableDataSource<Ecotip>([]);
  cargando = signal(true);

  ngOnInit(): void {
    this.cargar();
  }

  ngAfterViewInit(): void {
    this.datos.paginator = this.paginator;
    this.datos.sort = this.sort;
  }

  private cargar(): void {
    this.ecotipService.list().subscribe({
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

  abrirDialogo(x: Ecotip): void {
    this.dialog
      .open(ConfirmDialogo, { data: { titulo: 'Eliminar tip', mensaje: '¿Eliminar ' + ('el tip ' + x.idTip) + '? Esta acción no se puede deshacer.' } })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) return;
        this.ecotipService.delete(x.idTip!).subscribe({
          next: () => {
            this.aviso.ok('Registro eliminado');
            this.cargar();
          },
          error: (err) => this.aviso.fallo(err, 'No se pudo eliminar el registro'),
        });
      });
  }
}
