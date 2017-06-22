import { Directive, Input, EventEmitter, Inject, ElementRef, Renderer, OnInit } from '@angular/core';

@Directive({
  selector: '[appFocusMain]'
})
export class FocusMainDirective implements OnInit {

  @Input() appFocusMain: EventEmitter<boolean>;

  constructor( @Inject(ElementRef) private element: ElementRef, private renderer: Renderer) { }

  ngOnInit() {
    this.appFocusMain.subscribe(event => {
      this.renderer.invokeElementMethod(this.element.nativeElement, 'focus', []);
    });
  }

}
