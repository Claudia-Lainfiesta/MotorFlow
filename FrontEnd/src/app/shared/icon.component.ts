import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Set de íconos SVG (trazo tipo outline) usados en toda la app. Sin dependencias externas.
const PATHS: Record<string, string[]> = {
  edit: ['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z'],
  trash: ['M3 6h18', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M10 11v6', 'M14 11v6'],
  cart: ['M6 6h15l-1.5 9h-13z', 'M6 6 5 3H2', 'M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z', 'M18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z'],
  menu: ['M3 6h18', 'M3 12h18', 'M3 18h18'],
  x: ['M18 6 6 18', 'M6 6l12 12'],
  chevronLeft: ['m15 18-6-6 6-6'],
  chevronRight: ['m9 18 6-6-6-6'],
  truck: ['M10 17h4V5H2v12h3', 'M14 9h4l3 3v5h-2', 'M9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z', 'M19 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z'],
  user: ['M20 21a8 8 0 0 0-16 0', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
  users: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  tag: ['M12 2H2v10l9.29 9.29a1 1 0 0 0 1.42 0l8.58-8.58a1 1 0 0 0 0-1.42L12 2Z', 'M7 7h.01'],
  info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 16v-4', 'M12 8h.01'],
  help: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3', 'M12 17h.01'],
  mail: ['M4 4h16v16H4Z', 'm22 6-10 7L2 6'],
  file: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z', 'M14 2v6h6'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z'],
  package: ['m7.5 4.27 9 5.15', 'M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8Z', 'M3.27 6.96 12 12.01l8.73-5.05', 'M12 22.08V12'],
  mapPin: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z', 'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  check: ['M20 6 9 17l-5-5'],
  star: ['M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z'],
  plus: ['M12 5v14', 'M5 12h14'],
  minus: ['M5 12h14'],
  logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  layout: ['M3 3h18v18H3Z', 'M3 9h18', 'M9 21V9'],
  boxes: ['M2.97 12.92 12 8l9.03 4.92', 'M2.97 12.92 12 17.85l9.03-4.93', 'M2.97 12.92V8L12 3.08 21.03 8v4.92', 'M12 8v9.85'],
  upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm17 8-5-5-5 5', 'M12 3v12'],
  image: ['M3 3h18v18H3Z', 'M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', 'm21 15-5-5L5 21'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'm21 21-4.35-4.35'],
  home: ['m3 9 9-7 9 7', 'M9 22V12h6v10', 'M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9'],
  arrowUpDown: ['m21 16-4 4-4-4', 'M17 20V4', 'm3 8 4-4 4 4', 'M7 4v16'],
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 6v6l4 2'],
};

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `<svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" [attr.stroke]="strokeColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block shrink-0">
    @for(d of segments(); track d){<path [attr.d]="d"/>}
  </svg>`
})
export class IconComponent {
  @Input() name = 'info';
  @Input() size = 20;
  @Input() strokeColor = 'currentColor';
  segments() { return PATHS[this.name] || []; }
}
