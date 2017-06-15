import { Anonymization } from './anonymization';
import { Component, Input } from '@angular/core';
import { FileReference } from 'typescript';
import { UploadFileService } from './upload-file.service';
import { Document } from './document';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UploadFileService]
})
export class AppComponent {
  title = 'AnonML';
  outputFile: Document;
  alreadyReworked: number[];
  actuallyReworking: Anonymization;
  allLabels: string[] = ['PERSON',
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

  @Input() file: any;

  fileHandle(event): void {
    const files = event.target.files || event.srcElement.files;
    console.log(files);

    this.uploadFileService.postFile(files).then(response => {
      this.outputFile = response;
      console.log('Ouputfile: ' + this.outputFile)
      this.findNextAnonymization(this.outputFile.text, this.outputFile.anonymizations);

    });

//    console.log('Ouputfile: ' + this.outputFile)

//    this.findNextAnonymization(this.outputFile.text, this.outputFile.anonymizations);
  }

  findNextAnonymization(text: string, anonymizations: Anonymization[]): void {

    console.log('findNextAnonymization accessed.');
    let lowestIndex = text.indexOf(anonymizations[0].original);
    let foundIndex;
    let nextAnonymization = 0;
    for (let i = 0; i < anonymizations.length; ++i) {
      foundIndex = text.indexOf(anonymizations[i].original);
      if (foundIndex < lowestIndex) {
        lowestIndex = foundIndex;
        nextAnonymization = i;
      }
    }

    this.actuallyReworking = anonymizations[nextAnonymization];


  }
  constructor(private uploadFileService: UploadFileService) { }
}
