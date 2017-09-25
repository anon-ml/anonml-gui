import {Anonymization} from './anonymization';
import {HttpService} from './http.service';
import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {forEachChild} from 'typescript';


@Injectable()
export class AnonymizationHandlerService {

  private actuallyReworking: Anonymization;
  private allLabels: string[];
  private temporaryAnonymization: Anonymization[] = [];

  protected displayableText: string;
  protected anonymizations: Anonymization[];

  /**
   * Resets the loaded document after it is saved and exported to start over with another one.
   */
  resetDisplayableText(): void {

    this.anonymizations.length = 0;
    this.displayableText = '';
  }

  setAnonymizations(anonymizations: Anonymization[]): void {
    this.anonymizations = anonymizations;
    this.findNextAnonymization();
  }

  getText(): string {
    return this.displayableText;
  }

  getAnonymizations(): Anonymization[] {

    return this.temporaryAnonymization.concat(this.anonymizations.concat());
  }

  findAnonymizationById(id: number): number {

    for (let i = 0; i < this.anonymizations.length; ++i) {
      if (id === this.anonymizations[i].id) {
        return i;
      }
    }
    return -1;
  }

  reActivateAnonymization(id: number): boolean {

    const index = this.findAnonymizationById(id);
    console.log('found index: ' + index);
    if (this.anonymizations[index].status !== 'PROCESSING') {
      const anonymization = this.anonymizations[index].status = 'PROCESSING';
      this.actuallyReworking = this.anonymizations[index];
      return true;
    } else {
      return false;
    }
  }

  /**
   * Finds all of the processed anonymizations which are labeled with the given status.
   * @param status labeled status to search for
   * @return list with id's which have the given status
   */
  findAnonymizationsByStatus(status: string): number[] {

    const foundAnonymizations: number[] = [];
    const allAnonymizations: Anonymization[] = this.getAnonymizations();

    for (let i = 0; i < allAnonymizations.length; ++i) {
      if (allAnonymizations[i].status === status) {
        foundAnonymizations.push(allAnonymizations[i].id);
      }
    }

    return foundAnonymizations;
  }

  /**
   * Sets a given anonymization as actually reworking to be able to rework an newly added one.
   * @param actual given anonymization to set as actuallyReworking
   */
  setActualleReworking(actual: Anonymization): void {
    this.actuallyReworking = actual;
  }

  getActuallyReworking(): Anonymization {
    return this.actuallyReworking;
  }

  getLabels(): string[] {
    return this.allLabels;
  }

  /**
   * Generates a <span> element with different background colors based on the index of the given label
   * @param label one of the loaded labels (e.g. Person, Organization) which the color bases on
   * @param original the word(-sequence) which is placed in the <span>
   * @param asHTML directly sanitize as HTML or not
   * @return a string or a HTML based on the asHTML parameter
   */
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

  /**
   * Finds the maximal id of the anonymizations in the anonymization list
   * @return the highest id of the anonymizations
   */
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

  /**
   * Finds the anonymization from the anonymizations list which comes next in the displayableText.
   * Basically looks after the lowest index of the originals with pattern search. This should
   * help to go from top to bottom through the text. When the lowest is found it is set as
   * actuallyReworking.
   */
  findNextAnonymization(): void {
    console.log('findNextAnonymization accessed.');
    let lowestIndex = Number.MAX_VALUE;
    let foundIndex;
    let nextAnonymization = -1;
    for (let i = 0; i < this.anonymizations.length; ++i) {
      if (this.findAnonymizationsByStatus('DECLINED').concat(this.findAnonymizationsByStatus('ACCEPTED'))
        .includes(this.anonymizations[i].id)) {
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

  /**
   * Escapes all special characters contained in the original, also replaces all "\n" with <br/>
   * to find it in the displayable text
   * @param original the original of an anonymization to generate the regex from
   * @return the formed regex
   */
  formRegexFromOriginal(original: string) {
    original = original.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    original = original.replace(/\n/g, '<br/>');
    return original;
  }

  notFindOriginal(original: string) {

    let notFindable = '';
    for (let i = 0; i < original.length; ++i) {
      notFindable += original[i];
      notFindable += '&zwnj;';
    }
    return notFindable;

  }

  /**
   * Pushes the accepted anonymization to the accepted list and
   * searches the next one in the text (called if 'a' is pressed)
   */
  acceptedActualAnonymization(): void {
    console.log('Accepted!');
    if (this.actuallyReworking == null) {
      console.log('Document finished!');
      return;
    }
    this.actuallyReworking.status = 'ACCEPTED';
    this.findNextAnonymization();
  }

  /**
   * Pushes the declined anonymization to the declined list, removes it from
   * the anonymization list and searches the next one in the text
   * (called if 'd' is pressed)
   */
  declineActualAnonymization(): void {
    if (this.actuallyReworking == null) {
      console.log('Document finished!');
      return;
    }
    const index = this.anonymizations.indexOf(this.actuallyReworking);
    this.actuallyReworking.status = 'DECLINED';
    this.findNextAnonymization();
  }

  /**
   * Pushes the actual anonymization to the reworked list and searches the next.
   * (called if 'enter' is pressed after going to the rework zone)
   */
  reworkedActualAnonymization(): void {
    if (this.actuallyReworking == null) {
      console.log('Document finished!');
      return;
    }
    this.actuallyReworking.status = 'ACCEPTED';
    this.findNextAnonymization();
  }

  /**
   * Adds the newly added anonymization to the anonymization list and searches the next.
   * (called if 'enter' is pressed after going to the rework zone and
   * the actually reworking has a id which is the highst + 1)
   */
  addedNewAnonymization(): void {
    this.actuallyReworking.status = 'ACCEPTED';
    this.anonymizations.push(this.actuallyReworking);
    this.findNextAnonymization();
    this.temporaryAnonymization.length = 0;
  }

  constructor(private httpService: HttpService, private sanitizer: DomSanitizer) {
    this.httpService.getLabels().then(labels => this.allLabels = labels)

  }

}
