import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel, MatError, MatHint, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { map } from 'rxjs';
import { Consumo } from '../../model/consumo';
import { Hogar } from '../../model/hogar';
import { Recurso } from '../../model/recurso';
import { Tarifa } from '../../model/tarifa';
import { AvisoService } from '../../services/aviso-service';
import { ConsumoService } from '../../services/consumo-service';
import { ANIO_MINIMO, costoEstimado, etiquetaNivel, icono, MESES_LARGO, nivelDe, periodoActual } from '../../util/consumo-util';

@Component({
  imports: [ReactiveFormsModule, DecimalPipe, MatFormField, MatLabel, MatError, MatHint, MatSuffix, MatInput, MatSelect, MatOption],
  selector: 'app-consumo-lectura-component',
  styleUrl: './consumo-lectura-component.css',
  templateUrl: './consumo-lectura-component.html',
})
export class ConsumoLecturaComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private aviso: AvisoService = inject(AvisoService);
  private consumoService: ConsumoService = inject(ConsumoService);

  hogar = input.required<Hogar>();
  recursos = input.required<Recurso[]>();
  tarifas = input.required<Tarifa[]>();
  consumos = input.required<Consumo[]>();
  seleccionado = input<number | null>(null);
  edicion = input<Consumo | null>(null);

  guardado = output<void>();
  cancelado = output<void>();

  meses = MESES_LARGO.map((nombre, i) => ({ valor: i + 1, nombre }));
  anioMinimo = ANIO_MINIMO;
  icono = icono;
  guardando = signal(false);
  mensaje = signal('');

  form = this.fb.nonNullable.group({
    idRecurso: [null as number | null, Validators.required],
    mes: [periodoActual().mes, Validators.required],
    anio: [periodoActual().anio, [Validators.required, Validators.min(ANIO_MINIMO)]],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  private valores = toSignal(this.form.valueChanges.pipe(map(() => this.form.getRawValue())), { initialValue: this.form.getRawValue() });

  recursoActual = computed(() => this.recursos().find((r) => r.idRecurso === this.valores().idRecurso) ?? null);

  vista = computed(() => {
    const recurso = this.recursoActual();
    const valor = this.valores().valor;
    if (!recurso || !valor || valor <= 0) return null;
    const tarifa = this.tarifas().find((t) => t.idRecurso === recurso.idRecurso && t.idZona === this.hogar().idZona);
    const costo = costoEstimado(valor, recurso.nombre, this.hogar().numPersonas, tarifa);
    const nivel = nivelDe(valor, tarifa);
    return { costo, etiqueta: etiquetaNivel(nivel), nivel };
  });

  constructor() {
    effect(() => {
      const edicion = this.edicion();
      const seleccionado = this.seleccionado();
      const recursos = this.recursos();
      this.consumos();
      this.mensaje.set('');
      if (edicion) {
        this.form.patchValue({ idRecurso: edicion.idRecurso, mes: edicion.mes, anio: edicion.anio, valor: edicion.valor });
        this.form.controls.idRecurso.disable({ emitEvent: false });
        this.form.controls.mes.disable({ emitEvent: false });
        this.form.controls.anio.disable({ emitEvent: false });
        return;
      }
      this.form.controls.idRecurso.enable({ emitEvent: false });
      this.form.controls.mes.enable({ emitEvent: false });
      this.form.controls.anio.enable({ emitEvent: false });
      const idRecurso = seleccionado ?? recursos[0]?.idRecurso ?? null;
      const periodo = this.periodoSugerido(idRecurso);
      this.form.patchValue({ idRecurso, mes: periodo.mes, anio: periodo.anio });
    });
  }

  cambiarRecurso(): void {
    if (this.edicion()) return;
    const periodo = this.periodoSugerido(this.form.controls.idRecurso.value);
    this.form.patchValue({ mes: periodo.mes, anio: periodo.anio });
  }

  private periodoSugerido(idRecurso: number | null): { anio: number; mes: number } {
    let { anio, mes } = periodoActual();
    if (idRecurso === null) return { anio, mes };
    const registrados = new Set(this.consumos().filter((c) => c.idRecurso === idRecurso).map((c) => c.anio * 100 + c.mes));
    for (let intento = 0; intento < 36 && registrados.has(anio * 100 + mes); intento++) {
      mes--;
      if (mes === 0) {
        mes = 12;
        anio--;
      }
    }
    if (anio < ANIO_MINIMO || registrados.has(anio * 100 + mes)) {
      return periodoActual();
    }
    return { anio, mes };
  }

  guardar(): void {
    this.mensaje.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const valores = this.form.getRawValue();
    const edicion = this.edicion();
    const consumo: Consumo = {
      idConsumo: edicion?.idConsumo,
      idHogar: this.hogar().idHogar!,
      idRecurso: valores.idRecurso as number,
      anio: valores.anio,
      mes: valores.mes,
      valor: valores.valor as number,
    };
    this.guardando.set(true);
    const peticion = edicion ? this.consumoService.update(consumo) : this.consumoService.insert(consumo);
    peticion.subscribe({
      next: (resultado) => {
        this.guardando.set(false);
        this.form.controls.valor.reset(null);
        this.form.controls.valor.markAsUntouched();
        if (resultado.alertaGenerada) {
          this.aviso.alerta('Lectura guardada. Tu consumo superó lo habitual: revisa tus notificaciones.');
        } else {
          this.aviso.ok(edicion ? 'Lectura actualizada' : 'Lectura registrada');
        }
        this.guardado.emit();
      },
      error: (err) => {
        this.guardando.set(false);
        this.mensaje.set(this.aviso.textoError(err, 'No se pudo guardar la lectura'));
      },
    });
  }

  cancelar(): void {
    this.form.controls.valor.reset(null);
    this.mensaje.set('');
    this.cancelado.emit();
  }
}
