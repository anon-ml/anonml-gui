import { Directive, Input, EventEmitter, Inject, ElementRef, Renderer, OnInit } from '@angular/core';

@Directive({
  selector: '[appFocusRework]'
})
export class FocusReworkDirective implements OnInit {

  @Input() appFocusRework: EventEmitter<boolean>;

  constructor( @Inject(ElementRef) private element: ElementRef, private renderer: Renderer) { }

  ngOnInit() {
    this.appFocusRework.subscribe(event => {
      this.renderer.invokeElementMethod(this.element.nativeElement, 'focus', []);
    });
  }

}
