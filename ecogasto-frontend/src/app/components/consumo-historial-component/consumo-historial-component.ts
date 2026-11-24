import { AfterViewInit, Component, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { Consumo } from '../../model/consumo';
import { Hogar } from '../../model/hogar';
import { Recurso } from '../../model/recurso';
import { Tarifa } from '../../model/tarifa';
import { AvisoService } from '../../services/aviso-service';
import { ConsumoService } from '../../services/consumo-service';
import { costoEstimado, etiquetaMes, etiquetaNivel, icono, nivelDe } from '../../util/consumo-util';
import { ConfirmDialogo } from '../confirm-dialogo/confirm-dialogo';
import { MatPaginatorModule } from '@angular/material/paginator';

interface FilaHistorial {
  consumo: Consumo;
  periodo: string;
  orden: number;
  recurso: string;
  valor: number;
  unidad: string;
  costo: number | null;
  nivel: string;
  claseNivel: string;
}

@Component({
  imports: [DecimalPipe, MatTableModule, MatSortModule, MatPaginatorModule, MatIcon, MatIconButton],
  selector: 'app-consumo-historial-component',
  templateUrl: './consumo-historial-component.html',
})
export class ConsumoHistorialComponent implements AfterViewInit {
  private dialog: MatDialog = inject(MatDialog);
  private aviso: AvisoService = inject(AvisoService);
  private consumoService: ConsumoService = inject(ConsumoService);

  consumos = input.required<Consumo[]>();
  recursos = input.required<Recurso[]>();
  tarifas = input.required<Tarifa[]>();
  hogar = input.required<Hogar>();

  editar = output<Consumo>();
  eliminado = output<void>();

  columnas = ['periodo', 'recurso', 'valor', 'unidad', 'costo', 'nivel', 'acciones'];
  dataSource = new MatTableDataSource<FilaHistorial>([]);
  filtro = signal<number | null>(null);
  icono = icono;

  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);

  filas = computed<FilaHistorial[]>(() => {
    const filtro = this.filtro();
    return this.consumos()
      .filter((c) => filtro === null || c.idRecurso === filtro)
      .map((c) => {
        const recurso = this.recursos().find((r) => r.idRecurso === c.idRecurso);
        const tarifa = this.tarifas().find((t) => t.idRecurso === c.idRecurso && t.idZona === this.hogar().idZona);
        const nivel = nivelDe(c.valor, tarifa);
        return {
          consumo: c,
          periodo: etiquetaMes(c.anio, c.mes),
          orden: c.anio * 100 + c.mes,
          recurso: c.recurso ?? recurso?.nombre ?? '',
          valor: c.valor,
          unidad: recurso?.unidad ?? '',
          costo: c.costoEstimado ?? costoEstimado(c.valor, c.recurso ?? '', this.hogar().numPersonas, tarifa),
          nivel: etiquetaNivel(nivel),
          claseNivel: 'nivel nivel--' + nivel,
        };
      });
  });

  constructor() {
    effect(() => {
      this.dataSource.data = this.filas();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator();
    this.dataSource.sort = this.sort();
    this.dataSource.sortingDataAccessor = (fila, columna) => {
      if (columna === 'periodo') return fila.orden;
      return (fila as unknown as Record<string, string | number>)[columna] ?? '';
    };
  }

  cambiarFiltro(valor: string): void {
    this.filtro.set(valor === '' ? null : Number(valor));
  }

  confirmarEliminar(consumo: Consumo): void {
    this.dialog
      .open(ConfirmDialogo, { data: { titulo: 'Eliminar lectura', mensaje: '¿Eliminar la lectura de ' + consumo.recurso + ' de ' + etiquetaMes(consumo.anio, consumo.mes) + '?' } })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) return;
        this.consumoService.delete(consumo.idConsumo!).subscribe({
          next: () => {
            this.aviso.ok('Lectura eliminada');
            this.eliminado.emit();
          },
          error: (err) => this.aviso.fallo(err, 'No se pudo eliminar la lectura'),
        });
      });
  }
}
