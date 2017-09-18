import {Anonymization} from './anonymization';
import {AnonymizationHandlerService} from './anonymization-handler.service';
import {Component, Input, ViewChildren, ViewChild, EventEmitter} from '@angular/core';
import {FileReference} from 'typescript';
import {HttpService} from './http.service';
import {Document} from './document';
import {HttpModule} from '@angular/http';


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
  protected docId: string;
  protected docFileType: string;

  protected focusReworkArea = new EventEmitter<boolean>();
  protected focusMainArea = new EventEmitter<boolean>();
  protected selectedText;
  protected tempAnonymization;

  updatePipe(): void {
    this.trigger++;
  }

  /**
   * Uploads the file to the backend and sets up the needed elements from the response
   * @param event contains the uploaded files
   */
  fileHandle(event): void {
    const files = event.target.files || event.srcElement.files;
    console.log(files);

    this.httpService.postFile(files).then(response => {
      this.fileName = response.fileName;
      this.docId = response.id;
      this.docFileType = response.originalFileType;
      for (let i = 0; i < response.anonymizations.length; ++i) {
        response.anonymizations[i].id = i + 1;
      }
      this.anonymizationHanlderService.setUpParams(response.displayableText, response.anonymizations);

    });

  }

  /**
   * Handles the operations on keypress (like a for accept)
   * @param event the catched keyboard event to check which key is pressed
   */
  keyControl(event: KeyboardEvent): void {
    switch (event.charCode) {
      case 97:
        console.log('pressed a');
        this.anonymizationHanlderService.acceptedActualAnonymization();
        this.updatePipe();
        this.httpService.saveFile(this.anonymizationHanlderService.getAnonymizations(), this.docId);
        break;
      case 119:
        console.log('pressed w');
        this.focusReworkArea.emit(true);

        break;
      case 100:
        console.log('pressed d');
        this.anonymizationHanlderService.declineActualAnonymization();
        this.updatePipe();
        this.httpService.saveFile(this.anonymizationHanlderService.getAnonymizations(), this.docId);
        break;
      case 115:
        console.log('pressed s');
        if (this.anonymizationHanlderService.getActuallyReworking() === undefined) {
          if (window.confirm('Wirklich fertig?')) {
            this.httpService.exportFile(this.docId);
            this.anonymizationHanlderService.resetDisplayableText();
          }

        } else {
          window.alert('Es sind noch offene Anonymisierungen vorhanden!')
          console.log('Document not finished!');
        }


        break;
      default:
    }
  }

  /**
   * Sets the focus back to the main area if 'enter' was pressed in the rework area.
   * In addition calls the necessary handler function for the reworked or added anonymization.
   */
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
    this.httpService.saveFile(this.anonymizationHanlderService.getAnonymizations(), this.docId);
  }

  /**
   * Sets up a new anonymization with HUMAN as producer if something of the text
   * is selected.
   */
  getSelectionText(): void {
    console.log('getSelectionText Entered.');
    let selectedText;
    if (window.getSelection) {
      selectedText = window.getSelection();
    } else if (document.getSelection) {
      selectedText = document.getSelection();
    }
    // first check for wrong selections
    if (String(selectedText) === '' || String(selectedText) === ' ') {
      return;
    }
    this.tempAnonymization = new Anonymization();
    this.tempAnonymization.data.original = selectedText.toString();
    this.tempAnonymization.data.label = 'UNKNOWN';
    this.tempAnonymization.data.replacement = '';
    this.tempAnonymization.producer = 'HUMAN';
    this.tempAnonymization.status = 'PROCESSING';
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
