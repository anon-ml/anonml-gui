import { Anonymization } from './anonymization';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightAnonymization'
})
export class HighlightAnonymizationPipe implements PipeTransform {

  transform(value: string, anonymizations: Anonymization[]): string {
    console.log('Pipe highlightAnonymization entered.');
    let newValue = value;
    for(let i = 0; i < anonymizations.length; ++i) {

      newValue = newValue.replace(new RegExp(anonymizations[i].original, 'g'), '<mark>' + anonymizations[i].original + '</mark>');
    }
    return newValue;
  }

}
