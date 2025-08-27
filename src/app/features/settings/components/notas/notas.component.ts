import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2, FolderPlus,X, LucideAngularModule } from 'lucide-angular';
import { CreateNota, FlatNota, Nota, UpdateNota } from '../../../../shared/models/notas';
import { NotasService } from '../../../../shared/services/notas.service';

@Component({
  selector: 'notas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './notas.component.html',
  styles: [``]
})
export class NotasComponent implements OnInit {

  @Output() close = new EventEmitter<void>();

  // icon
  readonly chevronDown = ChevronDown;
  readonly chevronRight = ChevronRight;
  readonly plus = Plus;
  readonly pencil = Pencil;
  readonly trash2 = Trash2;
  readonly folderPlus = FolderPlus;
  readonly X = X;


  // data
  notas: Nota[] = [];
  flat: FlatNota[] = [];
  visible: FlatNota[] = [];

  // ui state
  loading = false;
  query = '';
  expanded: Record<string, boolean> = {};
  childCount: Record<string, number> = {};

  // edición / creación
  editingId: string | null = null;
  form: { name: string; color: string; parentId: string | null } = {
    name: '',
    color: '#B8672E',
    parentId: null
  };

  // cache de padres para comprobar ancestros expandidos
  private parentMap: Record<string, string | null> = {};

  constructor(private notasService: NotasService) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.notasService.getAll().subscribe({
      next: (data) => {
        this.notas = data ?? [];
        this.rebuild();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  rebuild(): void {
    this.parentMap = {};
    for (const n of this.notas) this.parentMap[n.id] = n.parentId ?? null;

    const byParent = new Map<string | null, Nota[]>();
    for (const n of this.notas) {
      const key = n.parentId ?? null;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(n);
    }
    for (const arr of byParent.values()) arr.sort((a, b) => a.name.localeCompare(b.name));

    // Precalcular conteo de hijos por id de padre
    this.childCount = {};
    for (const [pid, arr] of byParent.entries()) {
      if (pid !== null) this.childCount[pid] = arr.length;
    }

    const out: FlatNota[] = [];
    const visit = (parentId: string | null, depth: number) => {
      const children = byParent.get(parentId) ?? [];
      for (const n of children) {
        const hasChildren = (byParent.get(n.id)?.length ?? 0) > 0;
        if (hasChildren && this.expanded[n.id] === undefined) this.expanded[n.id] = true;
        out.push({
          id: n.id,
          name: n.name,
          color: n.color,
          parentId: n.parentId ?? null,
          depth,
          hasChildren
        });
        visit(n.id, depth + 1);
      }
    };
    visit(null, 0);
    this.flat = out;
    this.applyFilter();
  }

  getChildCount(id: string): number {
    return this.childCount[id] ?? 0;
  }

  startEditById(id: string): void {
    const nota = this.notas.find(n => n.id === id);
    if (nota) this.startEdit(nota);
  }

  applyFilter(): void {
    const q = this.query.trim().toLowerCase();
    this.visible = this.flat.filter(row => {
      if (!this.ancestorsExpanded(row)) return false;
      if (!q) return true;
      return row.name.toLowerCase().includes(q);
    });
  }

  ancestorsExpanded(row: FlatNota): boolean {
    // un item es visible si (a) no tiene padre o (b) todos sus ancestros están expandidos
    let pid = row.parentId ?? null;
    while (pid) {
      if (this.expanded[pid] === false) return false;
      pid = this.parentMap[pid] ?? null;
    }
    return true;
  }

  toggle(row: FlatNota): void {
    if (!row.hasChildren) return;
    this.expanded[row.id] = !this.expanded[row.id];
    this.applyFilter();
  }

  // ---- CRUD ----
  startCreate(parentId: string | null = null): void {
    this.editingId = null;
    this.form = { name: '', color: '#B8672E', parentId };
  }

  startEdit(nota: Nota): void {
    this.editingId = nota.id;
    this.form = {
      name: nota.name,
      color: nota.color,
      parentId: nota.parentId ?? null
    };
  }

  cancelForm(): void {
    this.editingId = null;
    this.form = { name: '', color: '#B8672E', parentId: null };
  }

  save(): void {
    const payload: CreateNota | UpdateNota = {
      name: this.form.name.trim(),
      color: this.form.color,
      parentId: this.form.parentId ?? null
    };

    if (!payload.name) return;

    if (this.editingId) {
      // update
      this.notasService.update(this.editingId, payload as UpdateNota).subscribe({
        next: (updated) => {
          // reemplaza en cache y rearmar árbol sin otro GET
          const idx = this.notas.findIndex(n => n.id === updated.id);
          if (idx >= 0) this.notas[idx] = updated;
          this.rebuild();
          this.cancelForm();
        },
        error: () => { }
      });
    } else {
      // create
      this.notasService.create(payload as CreateNota).subscribe({
        next: (created) => {
          this.notas.push(created);
          // asegura que su padre esté expandido
          if (created.parentId) this.expanded[created.parentId] = true;
          this.rebuild();
          this.cancelForm();
        },
        error: () => { }
      });
    }
  }

  addChild(row: FlatNota): void {
    this.startCreate(row.id);
  }

  remove(row: FlatNota): void {
    const hasChildren = this.flat.some(n => n.parentId === row.id);
    const msg = hasChildren
      ? 'Esta nota tiene hijos. ¿Seguro que deseas eliminarla?'
      : '¿Eliminar esta nota?';

    if (!confirm(msg)) return;

    this.notasService.delete(row.id).subscribe({
      next: () => {
        this.notas = this.notas.filter(n => n.id !== row.id);
        this.rebuild();
        if (this.editingId === row.id) this.cancelForm();
      },
      error: () => { }
    });
  }

  trackById = (_: number, r: FlatNota) => r.id;

  onClose() {
    this.close.emit();
  }
}
