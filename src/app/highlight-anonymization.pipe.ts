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



  /**
   * Finds the originals of the anonymizations from the list (with regex) and replaces them in the
   * displayable text by a <span> element to set a background color according to the Label of the
   * anonymization. If the anonymization is the next one then there
   * are added red marks before and after to mark the actually looked at.
   *
   * @param value is the text which is actually piped in the view
   * @param anonymizations is the list of anonymizations which should be highlighted
   * @param trigger a number which is incremented to trigger the pipe function
   * @return html with the originals replaced by the <span> object to highlight it
   */
  transform(value: string, anonymizations: Anonymization[], trigger: number): SafeHtml {
    console.log('Pipe highlightAnonymization entered.' + trigger);
    let newValue = value;
    let replacement = '';

    for (let i = 0; i < anonymizations.length; ++i) {
      replacement = '';

      if (this.anonymizationHanlderService.findAnonymizationsByStatus('ACCEPTED').includes(anonymizations[i].id)) {
        replacement = '<span id =' + anonymizations[i].id + ' style="background-color:DarkGrey" data-toggle="tooltip" title="'
          + this.anonymizationHanlderService.notFindOriginal(anonymizations[i].data.original) + '">'
          + anonymizations[i].data.replacement + '</span>'

      } else if (this.anonymizationHanlderService.findAnonymizationsByStatus('DECLINED').includes(anonymizations[i].id)) {
        replacement = '<span id =' + anonymizations[i].id + ' style="background-color:rgb(150, 200, 255, 0.1)">'
          + anonymizations[i].data.original.replace(/\n/g, '<br/>') + '</span>'

      } else {

        if (anonymizations[i].id === this.anonymizationHanlderService.getActuallyReworking().id) {
          replacement = '<span style="background-color:rgb(255,0,0)">O</span>';
        }

        replacement += this.anonymizationHanlderService.generateColorForLabel(anonymizations[i].data.label,
          anonymizations[i].data.original.replace(/\n/g, '<br/>'), anonymizations[i].id , false);

        if (anonymizations[i].id === this.anonymizationHanlderService.getActuallyReworking().id) {
          replacement += '<span style="background-color:rgb(255,0,0)">O</span>';
        }
      }
      newValue = newValue.replace(new RegExp(
        this.anonymizationHanlderService.formRegexFromOriginal(anonymizations[i].data.original), 'g'), replacement);
    }
    return this.sanitizer.bypassSecurityTrustHtml(newValue);
  }


  constructor(private anonymizationHanlderService: AnonymizationHandlerService, private sanitizer: DomSanitizer) {}

}
