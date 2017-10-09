import {Anonymization} from './anonymization';
import {AnonymizationHandlerService} from './anonymization-handler.service';
import {Component, Input, ViewChildren, ViewChild, EventEmitter, ElementRef, AfterViewChecked, Renderer2} from '@angular/core';
import {FileReference} from 'typescript';
import {HttpService} from './http.service';
import {Document} from './document';
import {HttpModule} from '@angular/http';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.css'],
  providers: [HttpService, AnonymizationHandlerService]
})
export class ControlComponent implements AfterViewChecked {

  private param: string;
  protected trigger = 0;
  protected fileName: string;
  protected docId: string;
  protected version: number;
  protected docFileType: string;

  protected focusReworkArea = new EventEmitter<boolean>();
  protected focusMainArea = new EventEmitter<boolean>();
  protected selectedText;
  protected tempAnonymization;


  constructor(private httpService: HttpService, protected anonymizationHanlderService: AnonymizationHandlerService,
    private activatedRoute: ActivatedRoute, private elRef: ElementRef, private renderer: Renderer2) {
    activatedRoute.params.subscribe(param => this.param = param.id);
    console.log(this.param);
    if (this.param === undefined || this.param === '') {
      console.log('no param found.')
    } else {
      console.log('set up by document ' + this.param)
      this.httpService.getDocument(this.param).then(response =>
        this.setUpFromDocument(response)
      );
    }
    this.focusMainArea.emit(true);
  }

  updatePipe(): void {
    this.trigger++;
  }

  countChildrenLayers(span: any, counter: number): number {

    const children = span.querySelectorAll('span');

    if (children.length === 0) {
      return counter;
    } else {
      let maxCounter = 0;

      for (let i = 0; i < children.length; ++i) {
        maxCounter = Math.max(maxCounter, this.countChildrenLayers(children[i], counter + 1));
      }
      return maxCounter;
    }
  }

  ngAfterViewChecked(): void {

    const span = this.elRef.nativeElement.querySelectorAll('span');
    if (span.length === 0) {
      return;
    }

    for (let i = 0; i < span.length; ++i) {

      const childrenCount = this.countChildrenLayers(span[i], 0);
      if (childrenCount !== 0) {
        this.renderer.setStyle(span[i], 'border', (2 * childrenCount) + 'px solid ' + span[i].style.backgroundColor);
      }

    }
    //    this.renderer.listen(span[0], 'click', (evt) => {
    //      console.log('First span clicked!');
    //    });
    //    span[0].addEventListener('click', this.onClickSpan);
  }


  /**
   * Uploads the file to the backend and sets up the needed elements from the response
   * @param event contains the uploaded files
   */
  fileHandle(event): void {
    const files = event.target.files || event.srcElement.files;
    console.log(files);

    this.httpService.postFile(files).then(response =>
      this.setUpFromDocument(response)
    );
  }

  setUpFromDocument(document: Document): void {
    this.fileName = document.fileName;
    this.docId = document.id;
    this.version = document.version;
    this.docFileType = document.originalFileType;
    for (let i = 0; i < document.anonymizations.length; ++i) {
      document.anonymizations[i].id = i + 1;
    }
    this.anonymizationHanlderService.setUpParams(document.displayableText, document.anonymizations);

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
        this.save();
        break;
      case 119:
        console.log('pressed w');
        this.focusReworkArea.emit(true);

        break;
      case 100:
        console.log('pressed d');
        this.anonymizationHanlderService.declineActualAnonymization();
        this.updatePipe();
        this.save();
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

  save(): void {
    this.httpService.saveFile(this.anonymizationHanlderService.getAnonymizations(), this.docId, this.version)
      .then(response => {

        if (response.version === -1) {
          if (window.confirm('Das Dokument ist nicht mehr aktuell!\nNeuen Stand laden?')) {
            this.httpService.getDocument(this.docId).then(response2 => this.setUpFromDocument(response2));
          } else {
            window.alert('Weitere Aenderungen werden nicht gespeichert!');
          }
        } else {
          this.setUpFromDocument(response)
          this.updatePipe();
        }
        this.httpService.unlockExport(this.docId);
      });
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
    this.save();
  }

  findIdOfSelectedSpan(selectedText: string): number {
    const spanTags = document.getElementsByTagName('span');
    let foundId = -1;

    for (let i = 0; i < spanTags.length; i++) {
      if (spanTags[i].textContent === selectedText.toString()) {
        foundId = +spanTags[i].id;
        break;
      }
    }

    return foundId;
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

    const id = this.findIdOfSelectedSpan(selectedText);
    if (id !== -1 && id !== 0) {
      if (this.anonymizationHanlderService.reActivateAnonymization(id)) {
        return;
      }
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

}
