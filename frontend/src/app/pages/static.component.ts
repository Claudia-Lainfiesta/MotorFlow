import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="mx-auto max-w-3xl px-6 py-14">
      <p class="font-bold text-primary">MOTORFLOW</p>
      <h1 class="mt-2 text-4xl font-extrabold">{{title}}</h1>
      @for(s of sections; track s.heading){
        <div class="mt-8">
          @if(s.heading){<h2 class="text-lg font-bold">{{s.heading}}</h2>}
          <p class="mt-2 leading-8 text-slate-600 whitespace-pre-line">{{s.body}}</p>
        </div>
      }
    </section>
  `
})
export class StaticComponent {
  private route = inject(ActivatedRoute);
  title: string = this.route.snapshot.data['title'] || 'MotorFlow';
  sections: { heading?: string; body: string }[] = this.route.snapshot.data['sections'] || [];
}
