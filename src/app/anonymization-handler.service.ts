import { Anonymization } from './anonymization';
import { Injectable } from '@angular/core';

@Injectable()
export class AnonymizationHandlerService {

  private actuallyReworking: Anonymization;
  private allLabels: string[] = ['PERSON',
    'LOCATION',
    'ORGANIZATION',
    'MISC',
    'LICENCE_PLATE',
    'E_MAIL',
    'TELEPHONE_NUMBER',
    'URL',
    'IP',
    'BIRTHDATE',
    'IBAN'
  ];
  private acceptedAnonymizations: number[] = [];
  private reworkedAnonymizations: number[] = [];
  private declinedAnonymizations: number[] = [];
  private addedAnonymizations: number[] = [];
  private temporaryAnonymization: Anonymization[] = [];

  protected text: string;
  protected anonymizations: Anonymization[];

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

  setTemporatyAnonymization(): void {
    this.temporaryAnonymization.length = 0;
    this.temporaryAnonymization.push(this.actuallyReworking);
  }

  findNextAnonymizationParam(text: string, anonymizations: Anonymization[]): void {

    this.text = text;
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
      foundIndex = this.text.indexOf(this.anonymizations[i].original);
      if (foundIndex < lowestIndex) {
        lowestIndex = foundIndex;
        nextAnonymization = i;
      }
    }
    if (nextAnonymization === -1) {
      this.actuallyReworking = null;
    }
    this.actuallyReworking = this.anonymizations[nextAnonymization];
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

  constructor() { }

}
