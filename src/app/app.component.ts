import { Anonymization } from './anonymization';
import { AnonymizationHandlerService } from './anonymization-handler.service';
import { Component, Input, ViewChildren, ViewChild, EventEmitter } from '@angular/core';
import { FileReference } from 'typescript';
import { HttpService } from './http.service';
import { Document } from './document';
import { HttpModule } from '@angular/http'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [HttpService, AnonymizationHandlerService]
})
export class AppComponent {
  title = 'AnonML';
  protected trigger = 0;
  protected fileName: string;
  protected docId: number;
  protected docFileType: string;

  protected focusReworkArea = new EventEmitter<boolean>();
  protected focusMainArea = new EventEmitter<boolean>();
  protected selectedText;
  protected tempAnonymization;

  updatePipe(): void {
    this.trigger++;
  }

  fileHandle(event): void {
    const files = event.target.files || event.srcElement.files;
    console.log(files);

    this.httpService.postFile(files).then(response => {
      this.fileName = response.fileName;
      this.docId = response.id;
      this.docFileType = response.originalFileType;
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
        if (this.anonymizationHanlderService.getActuallyReworking() === undefined) {
          const document = new Document();
          document.anonymizations = this.anonymizationHanlderService.getAnonymizations();
          document.fileName = this.fileName;
          document.id = this.docId;
          document.originalFileType = this.docFileType;
          document.text = this.anonymizationHanlderService.getText();

          this.httpService.saveFile(document);
        } else {
          console.log('Document not finished!');
        }


        break;
      default:
    }
  }

  enterRework(): void {
    console.log('Hit Enter!');
    this.focusMainArea.emit(true);
    if (this.anonymizationHanlderService.getActuallyReworking().id === (this.anonymizationHanlderService.getMaxId() + 1)) {
      console.log('add new anonymization!');
      this.anonymizationHanlderService.addedNewAnonymization();
    } else {
      this.anonymizationHanlderService.reworkedActualAnonymization();
    }

    this.updatePipe();
  }


  getSelectionText(): void {
    console.log('getSelectionText Entered.');
    let t;
    if (window.getSelection) {
      t = window.getSelection();
    } else if (document.getSelection) {
      t = document.getSelection();
    }
    // first check for wrong selections
    if (String(t) === '' || String(t) === ' ') {
      return;
    }
    this.tempAnonymization = new Anonymization();
    this.tempAnonymization.original = t.toString();
    this.tempAnonymization.Producer = 'HUMAN';
    this.tempAnonymization.id = this.anonymizationHanlderService.getMaxId() + 1;
    this.anonymizationHanlderService.setActualleReworking(this.tempAnonymization);
    this.anonymizationHanlderService.setTemporatyAnonymization();
    this.updatePipe();
    this.focusReworkArea.emit(true);
  }

  constructor(private httpService: HttpService, protected anonymizationHanlderService: AnonymizationHandlerService) {
    this.focusMainArea.emit(true);
  }
}
