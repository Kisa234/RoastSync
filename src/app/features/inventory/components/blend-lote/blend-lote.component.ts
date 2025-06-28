import { LoteService } from './../../service/lote.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { X, Check, Plus, Trash2, Blend } from 'lucide-angular';
import { UserService } from '../../../users/service/users-service.service';
import { BlendLotes } from '../../../../shared/models/blend-lotes';
import { FusionarLotes } from '../../../../shared/models/fusionar-lote';
import { User } from '../../../../shared/models/user';
import { Lote } from '../../../../shared/models/lote';

@Component({
  selector: 'blend-lote',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './blend-lote.component.html',
  styles: ``
})
export class BlendLoteComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

  modelBlend: BlendLotes = {
    lotes: [['', 0]],
    id_user: '',
    idc: ''
  };

  modelFusionar: FusionarLotes = {
    lotes: [
      ['', 0],  // lote 1
      ['', 0]   // lote 2
    ],
  }

  User: User[] = [];

  tabs = [
    { key: 'fusionar', label: 'Fusionar Lotes' },
    { key: 'blend', label: 'Crear Blend' }
  ];
  activeTab = 'fusionar';

  selectTab(key: string) {
    this.activeTab = key;
  }

  constructor(
    private readonly loteService: LoteService,
    private readonly userService: UserService
  ) { }

  availableLotes: Lote[] = [];

  ngOnInit() {
    this.loteService.getRoaster().subscribe({
      next: (lotes) => {
        this.availableLotes = lotes;
      }
    });
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.User = users;
      }
    })
  }

  readonly X = X;
  readonly Check = Check;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Blend = Blend;


  readonly maxComponents = 3;

  addComponent() {
    if (this.modelBlend.lotes.length < this.maxComponents) {
      this.modelBlend.lotes.push(['', 0]);
    }
  }

  removeComponent(idx: number) {
    if (this.modelBlend.lotes.length > 1) {
      this.modelBlend.lotes.splice(idx, 1);
    }
  }

  get totalWeight(): number {
    return this.modelBlend.lotes
      .reduce((sum, [, peso]) => sum + (peso || 0), 0);
  }

  get totalWeightFusionar(): number {
    return this.modelFusionar.lotes
      .reduce((sum, [, peso]) => sum + (peso || 0), 0);
  }

  onClose() {
    this.close.emit();
  }

  onCreate() {
    this.create.emit();
  }

  createBlend() {
    console.log('Creating Blend with model:', this.modelBlend);
    this.loteService.blendlote(this.modelBlend).subscribe({
      next: (response) => {
        this.create.emit();
        this.close.emit();
      },
      error: (error) => {
        console.error('Error creating blend:', error);
      }
    })
  }
  FusionarLotes() {
    this.loteService.fusionarLotes(this.modelFusionar).subscribe({
      next: (response) => {
        this.create.emit();
        this.close.emit();
      },
      error: (error) => {
        console.error('Error fusionando lotes:', error);
      }
    })
  }
}
