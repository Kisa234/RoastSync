import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BoxTemplateService } from '../../service/box-template.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-active-template',
  templateUrl: './active-template.component.html',
  imports: [CommonModule, FormsModule]
})
export class ActiveTemplateComponent implements OnInit {

  @Output() close = new EventEmitter<void>();

  templates: any[] = [];
  loading = false;
  loadingSave = false;

  selected: string | null = null;

  constructor(private templateSvc: BoxTemplateService) {}

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.loading = true;

    this.templateSvc.getAll().subscribe({
      next: (res) => {
        this.templates = res.filter(t => !t.eliminado);
        const active = this.templates.find(t => t.activo);
        this.selected = active ? active.id_box_template : null;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  save() {
    if (!this.selected) return;

    this.loadingSave = true;

    this.templateSvc.setActiveTemplate(this.selected).subscribe({
      next: () => {
        this.loadingSave = false;
        this.closeModal();
      },
      error: () => this.loadingSave = false
    });
  }

  closeModal() {
    this.close.emit();
  }
}
