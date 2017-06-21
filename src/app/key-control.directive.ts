import { AnonymizationHandlerService } from './anonymization-handler.service';
import { AppComponent } from './app.component';
import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appKeyControl]'
})
export class KeyControlDirective {


  @HostListener('body:keypress', ['$event'])
  keyControl(event: KeyboardEvent): void {
    switch (event.charCode) {
      case 97:
        console.log('pressed a');
        this.anonymizationHanlderService.acceptedActualAnonymization();
        this.appComponent.updatePipe();
        break;
      case 119:
        console.log('pressed w');

        break;
      case 100:
        console.log('pressed d');

        break;
      case 115:
        console.log('pressed s');

        break;
      default:
    }



  }
  constructor(private anonymizationHanlderService: AnonymizationHandlerService, private appComponent: AppComponent) { }

}
