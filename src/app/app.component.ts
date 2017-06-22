import { Anonymization } from './anonymization';
import { AnonymizationHandlerService } from './anonymization-handler.service';
import { Component, Input, ViewChildren, ViewChild, EventEmitter } from '@angular/core';
import { FileReference } from 'typescript';
import { UploadFileService } from './upload-file.service';
import { Document } from './document';
import { HttpModule } from '@angular/http'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UploadFileService, AnonymizationHandlerService]
})
export class AppComponent {
  title = 'AnonML';
  private trigger = 0;
  protected fileName: string;
  protected focusReworkArea = new EventEmitter<boolean>();
  protected focusMainArea = new EventEmitter<boolean>();

  updatePipe(): void {
    this.trigger++;
  }

  fileHandle(event): void {
    const files = event.target.files || event.srcElement.files;
    console.log(files);

    this.uploadFileService.postFile(files).then(response => {
      this.fileName = response.fileName;
      this.anonymizationHanlderService.findNextAnonymizationParam(response.text, response.anonymizations);

    });

  }

  keyControl(event: KeyboardEvent): void {
    switch (event.charCode) {
      case 97:
        console.log('pressed a');
        this.anonymizationHanlderService.acceptedActualAnonymization();
        this.updatePipe();
        break;
      case 119:
        console.log('pressed w');
        this.focusReworkArea.emit(true);

        break;
      case 100:
        console.log('pressed d');
        this.anonymizationHanlderService.declineActualAnonymization();
        this.updatePipe();
        break;
      case 115:
        console.log('pressed s');

        break;
      default:
    }
  }

  enterRework(): void {
    console.log('Hit Enter!');
    this.focusMainArea.emit(true);
    this.anonymizationHanlderService.reworkedActualAnonymization();
    this.updatePipe();
  }

  constructor(private uploadFileService: UploadFileService, protected anonymizationHanlderService: AnonymizationHandlerService) { }
}
