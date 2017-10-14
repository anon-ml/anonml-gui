import {Anonymization} from '../model/anonymization';
import {AnonymizationHandlerService} from '../services/anonymization-handler.service';
import {Component, Input, ViewChildren, ViewChild, EventEmitter, ElementRef, AfterViewChecked, Renderer2, OnInit} from '@angular/core';
import {FileReference} from 'typescript';
import {HttpService} from '../services/http.service';
import {Document} from '../model/document';
import {HttpModule} from '@angular/http';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.css'],
  providers: [HttpService, AnonymizationHandlerService]
})
export class ControlComponent implements AfterViewChecked, OnInit {

  //  private param: string;
  protected trigger = 0;
  protected fileName: string;
  protected docId: string;
  protected version: number;
  protected docFileType: string;
  private fullText: string;

  protected focusReworkArea = new EventEmitter<boolean>();
  protected focusMainArea = new EventEmitter<boolean>();
  protected tempAnonymization;


  /**
   * Looks for params (document id) in the url to load already uploaded documents
   */
  constructor(private httpService: HttpService, protected anonymizationHanlderService: AnonymizationHandlerService,
    private activatedRoute: ActivatedRoute, private elRef: ElementRef, private renderer: Renderer2) {

  }

  /**
   * Checks if there is set an id for preloading a document
   */
  ngOnInit() {
    this.httpService.getPreLoadDocument().then(doc => {
      if (doc === null) {
        console.log('no param found.')
      } else {
        console.log('set up by document.')
        this.setUpFromDocument(doc);
        this.httpService.resetDocumentIndex();
      }
    })
    this.focusMainArea.emit(true);
  }

  updatePipe(): void {
    this.trigger++;
  }

  /**
   * Counts recursivly how much a span is encapsulated to calculate how thick the added border should be
   * @param span the span which is looked at
   * @param counter how much encapsulation layers are there
   * @return the counted number
   */
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

  /**
   * Is called every time the view is checked. It makes encapsulated anonymizations
   * appear more distinguishable by adding a border to the containing one.
   * Making the Anonymizations clickable would happen here, but actually it is not working... :(
   */
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

  /**
   * Sets all needed parametes to be able to manually adjust anonymizations
   * @param document object to set for manual adjustments
   */
  setUpFromDocument(document: Document): void {
    this.fileName = document.fileName;
    this.docId = document.id;
    this.version = document.version;
    this.docFileType = document.originalFileType;
    this.fullText = document.fullText;
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
          if (window.confirm('Really finished?')) {
            this.httpService.exportFile(this.docId);
            this.anonymizationHanlderService.resetDisplayableText();
          }

        } else {
          window.alert('There are still open anonymizations!')
          console.log('Document not finished!');
        }


        break;
      default:
    }
  }

  /**
   * Saves the document after each interaction and checks if the version is ok (not -1)
   * If not a request is shown if the document should be reloaded.
   */
  save(): void {
    this.httpService.saveFile(this.anonymizationHanlderService.getAnonymizations(), this.docId, this.version)
      .then(response => {

        if (response.version === -1) {
          if (window.confirm('The documents version is outdated!\nLoad new version?')) {
            this.httpService.getDocument(this.docId).then(response2 => this.setUpFromDocument(response2));
          } else {
            window.alert('Following changes are not saved anymore!');
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

  /**
   * To make the selection and the span text comparable
   * @param word to replace linebreak by space
   * @return the prepared string
   */
  dismissLineBreak(word: string): string {
    word = word.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    word = word.replace(/( )*\r\n( )*/g, ' ');
    word = word.replace(/( )*\n( )*/g, ' ');
    return word;
  }

  /**
   * Searches for a span which holds the given text
   *
   * @param selectedText text to search for in the span element list
   * @return -1 if no span contains the text or the id of the span which
   * in fact is the id of the contained anonymization
   */
  findIdOfSelectedSpan(selectedText: string): number {
    const spanTags = document.getElementsByTagName('span');
    for (let i = 0; i < spanTags.length; i++) {
      if (this.dismissLineBreak(spanTags[i].textContent) === this.dismissLineBreak(selectedText)) {
        return +spanTags[i].id;
      }
    }
    return -1;
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

    selectedText = String(selectedText);

    // first check for wrong selections
    if (selectedText === '' || selectedText === ' ') {
      return;
    }

    const id = this.findIdOfSelectedSpan(selectedText.trim());
    if (id !== -1 && id !== 0) {
      if (this.anonymizationHanlderService.reActivateAnonymization(id)) {
        return;
      }
    }

    selectedText = selectedText.replace(/\s*\r\n/g, '\\s*\\\r\\\n');
    const regex = new RegExp(selectedText, 'g');
    const found = this.fullText.match(regex);

    if (found !== null) {
      console.log('Found!')
      selectedText = found[0]
    }


    this.tempAnonymization = new Anonymization();
    this.tempAnonymization.data.original = selectedText;
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
