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
          console.log('actual found: ' + this.anonymizationHanlderService.getActuallyReworking().original);
          replacement = '<span style="background-color:rgb(255,0,0)">[]</span>';
        }
        const labels = this.anonymizationHanlderService.getLabels();
        for (let j = 0; j < labels.length; ++j) {
          if (labels[j] === anonymizations[i].Label) {

            replacement += '<span style="background-color:rgb( 0 , ' + (255 - (j * 25) % 255) + ', ' + (255 - (j * 25) % 255) + ')">'
              + anonymizations[i].original + '</span>'
          }
        }
      }
      console.log('replacement for ' + anonymizations[i].original + ': ' + replacement);
      newValue = newValue.replace(new RegExp(anonymizations[i].original, 'g'), replacement);
    }
    return this.sanitizer.bypassSecurityTrustHtml(newValue);
  }

  constructor(private anonymizationHanlderService: AnonymizationHandlerService, private sanitizer: DomSanitizer) { }

}
