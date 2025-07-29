import { Component, Input } from '@angular/core';
import { AnalisisPdfComponent } from '../../components/analisis-pdf/analisis-pdf.component';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Download } from 'lucide-angular';

@Component({
  selector: 'app-pdf-page',
  imports: [AnalisisPdfComponent, LucideAngularModule],
  templateUrl: './analisis-pdf-page.component.html',
  styles: ``
})
export class PdfPageComponent {
  @Input() id: string = '';
  @Input() type: string = '';
  readonly Download = Download;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.type = this.route.snapshot.paramMap.get('type') ?? '';
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
  }

}
