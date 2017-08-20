import {Anonymization} from './anonymization';
import {AnonymizationHandlerService} from './anonymization-handler.service';
import {AppComponent} from './app.component';
import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {textChangeRangeIsUnchanged} from 'typescript';

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
        replacement = '<span style="background-color:DarkGrey">' + anonymizations[i].data.replacement + '</span>'
      } else {

        if (anonymizations[i].id === this.anonymizationHanlderService.getActuallyReworking().id) {
          replacement = '<span style="background-color:rgb(255,0,0)">[]</span>';
        }

        // console.log('Label: ' + anonymizations[i].label);
        replacement += this.anonymizationHanlderService.generateColorForLabel(anonymizations[i].data.label,
          anonymizations[i].data.original.replace(/\n/g, '<br/>'), false);

      }
      // console.log('Replacement: ' + replacement)
      newValue = newValue.replace(new RegExp(
        this.anonymizationHanlderService.formRegexFromOriginal(anonymizations[i].data.original), 'g'), replacement);
    }
    return this.sanitizer.bypassSecurityTrustHtml(newValue);
  }
  constructor(private anonymizationHanlderService: AnonymizationHandlerService, private sanitizer: DomSanitizer) {}

}
