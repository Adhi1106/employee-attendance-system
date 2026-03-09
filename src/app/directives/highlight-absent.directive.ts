import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appHighlightAbsent]',
  standalone: true,
})
export class HighlightAbsentDirective {
  @Input('appHighlightAbsent') status = '';

  @HostBinding('style.backgroundColor')
  get backgroundColor() {
    return this.status === 'Absent' ? '#ffe7ea' : '';
  }
}
