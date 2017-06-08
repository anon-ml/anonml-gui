import { Directive, Component, ElementRef} from '@angular/core';

@Directive({ selector: '[appFileInput]' })
export class FileInputDirective {

  constructor(el: ElementRef) {
    console.log(el.nativeElement);
  }


}
