import {Anonymization} from './anonymization';
import {HttpService} from './http.service';
import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Injectable()
export class AnonymizationHandlerService {

  private actuallyReworking: Anonymization;
  private allLabels: string[];
  private acceptedAnonymizations: number[] = [];
  private reworkedAnonymizations: number[] = [];
  private declinedAnonymizations: number[] = [];
  private addedAnonymizations: number[] = [];
  private temporaryAnonymization: Anonymization[] = [];

  protected displayableText: string;
  protected anonymizations: Anonymization[];

  resetDisplayableText(): void {
    this.acceptedAnonymizations.length = 0;
    this.reworkedAnonymizations.length = 0;
    this.declinedAnonymizations.length = 0;
    this.addedAnonymizations.length = 0;
    this.anonymizations.length = 0;
    this.displayableText = '';
  }
  getText(): string {
    return this.displayableText;
  }
  getAnonymizations(): Anonymization[] {
    return this.anonymizations.concat(this.temporaryAnonymization);
  }
  getAllTouchedAnonymizations(): number[] {
    return this.acceptedAnonymizations.concat(this.reworkedAnonymizations, this.addedAnonymizations);
  }

  setActualleReworking(actual: Anonymization): void {
    this.actuallyReworking = actual;
  }
  getActuallyReworking(): Anonymization {
    return this.actuallyReworking;
  }

  getLabels(): string[] {
    return this.allLabels;
  }

  generateColorForLabel(label: string, original: string, asHTML: boolean) {
    let replacement = '';
    const indexOfLabel = this.allLabels.indexOf(label)
    if (indexOfLabel === -1) {
      replacement += '<span style="background-color:rgb( 255 , 255, 255)">' + original + '</span>'
    } else {
      replacement += '<span style="background-color:';
      switch (indexOfLabel) {
        case 0:
          replacement += 'rgb(60, 180, 75)';
          break;
        case 1:
          replacement += 'rgb(255, 225, 25)';
          break;
        case 2:
          replacement += 'rgb(0, 130, 200)';
          break;
        case 3:
          replacement += 'rgb(245, 130, 48)';
          break;
        case 4:
          replacement += 'rgb(250, 190, 190)';
          break;
        case 5:
          replacement += 'rgb(230, 190, 255)';
          break;
        case 6:
          replacement += 'rgb(255, 250, 200)';
          break;
        case 7:
          replacement += 'rgb(170, 255, 195)';
          break;
        case 8:
          replacement += 'rgb(128, 128, 0) ';
          break;
        case 9:
          replacement += 'rgb(210, 245, 60)';
          break;
        case 10:
          replacement += 'rgb(0, 128, 128)';
          break;
        case 11:
          replacement += 'rgb(240, 50, 230)';
          break;
        default:
          replacement += 'rgb(255, 215, 180)';
          break;
      }


      //  0 , ' + (255 - (indexOfLabel * 50) % 255) + ', ' + ((indexOfLabel * 50) % 255)

      replacement += '">' + original + '</span>';
    }
    if (asHTML) {
      return this.sanitizer.bypassSecurityTrustHtml(replacement);
    }
    return replacement;
  }

  setTemporatyAnonymization(): void {
    this.temporaryAnonymization.length = 0;
    this.temporaryAnonymization.push(this.actuallyReworking);
  }

  setUpParams(displayableText: string, anonymizations: Anonymization[]): void {

    this.displayableText = displayableText;
    this.anonymizations = anonymizations;
    this.findNextAnonymization();
  }

  getMaxId(): number {
    let highestIndex = 0;
    let id;
    for (let i = 0; i < this.anonymizations.length; ++i) {
      id = this.anonymizations[i].id;
      if (id > highestIndex) {
        highestIndex = id;
      }
    }
    return highestIndex;
  }

  findNextAnonymization(): void {
    console.log('findNextAnonymization accessed.');
    let lowestIndex = Number.MAX_VALUE;
    let foundIndex;
    let nextAnonymization = -1;
    for (let i = 0; i < this.anonymizations.length; ++i) {
      if (this.getAllTouchedAnonymizations().includes(this.anonymizations[i].id)) {
        continue;
      }
      const regex = this.formRegexFromOriginal(this.anonymizations[i].data.original);
      foundIndex = this.displayableText.search(new RegExp(regex));
      if (foundIndex === -1) {
        console.log(this.anonymizations[i].data.original + ' not found!');
        continue;
      } else if (foundIndex < lowestIndex) {
        lowestIndex = foundIndex;
        nextAnonymization = i;
      }
    }
    if (nextAnonymization === -1) {
      this.actuallyReworking = null;
    }
    this.actuallyReworking = this.anonymizations[nextAnonymization];
  }

  formRegexFromOriginal(original: string) {
    original = original.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    original = original.replace(/\n/g, '<br/>');
    //    original = original.replace(/(\s)+/g, '((\\s)+|(<br>)+)');
    return original;
  }

  acceptedActualAnonymization(): void {
    console.log('Accepted!');
    if (this.actuallyReworking == null) {
      console.log('Document finished!');
      return;
    }
    this.acceptedAnonymizations.push(this.actuallyReworking.id);
    this.findNextAnonymization();
  }

  declineActualAnonymization(): void {
    if (this.actuallyReworking == null) {
      console.log('Document finished!');
      return;
    }
    const index = this.anonymizations.indexOf(this.actuallyReworking);
    this.declinedAnonymizations.push(this.actuallyReworking.id);
    this.anonymizations.splice(index, 1);
    this.findNextAnonymization();
  }

  reworkedActualAnonymization(): void {
    if (this.actuallyReworking == null) {
      console.log('Document finished!');
      return;
    }
    this.reworkedAnonymizations.push(this.actuallyReworking.id);
    this.findNextAnonymization();
  }

  addedNewAnonymization(): void {
    this.anonymizations.push(this.actuallyReworking);
    this.addedAnonymizations.push(this.actuallyReworking.id);
    this.findNextAnonymization();
    this.temporaryAnonymization.length = 0;
  }

  constructor(private httpService: HttpService, private sanitizer: DomSanitizer) {
    this.httpService.getLabels().then(labels => this.allLabels = labels)

  }

}
