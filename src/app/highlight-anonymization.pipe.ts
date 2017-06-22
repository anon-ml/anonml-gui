import { Anonymization } from './anonymization';
import { AnonymizationHandlerService } from './anonymization-handler.service';
import { AppComponent } from './app.component';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlightAnonymization'
})
export class HighlightAnonymizationPipe implements PipeTransform {

  transform(value: string, anonymizations: Anonymization[], trigger: number): SafeHtml {
    console.log('Pipe highlightAnonymization entered.');
    let newValue = value;
    let replacement = '';

    for (let i = 0; i < anonymizations.length; ++i) {
      replacement = '';

      if (this.anonymizationHanlderService.getAllTouchedAnonymizations().includes(anonymizations[i].id)) {
        replacement = '<span style="background-color:DarkGrey">' + anonymizations[i].replacement + '</span>'
      } else {

        if (anonymizations[i].id === this.anonymizationHanlderService.getActuallyReworking().id) {
          replacement = '<span style="background-color:rgb(255,0,0)">[]</span>';
        }

        const labels = this.anonymizationHanlderService.getLabels();
        const indexOfLabel = labels.indexOf(anonymizations[i].Label)
        if (indexOfLabel === -1) {
          replacement += '<span style="background-color:rgb( 255 , 255, 255)">' + anonymizations[i].original + '</span>'
        } else {
          replacement += '<span style="background-color:rgb( 0 , ' + (255 - (indexOfLabel * 25) % 255) + ', '
            + ((indexOfLabel * 25) % 255) + ')">' + anonymizations[i].original + '</span>'
        }

      }
      newValue = newValue.replace(new RegExp(anonymizations[i].original, 'g'), replacement);
    }
    return this.sanitizer.bypassSecurityTrustHtml(newValue);
  }

  constructor(private anonymizationHanlderService: AnonymizationHandlerService, private sanitizer: DomSanitizer) { }

}
