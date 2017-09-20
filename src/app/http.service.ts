import {Anonymization} from './anonymization';
import {ControlComponent} from './control.component';
import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, RequestOptionsArgs} from '@angular/http';
import {Observable, } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import {Document} from './document';

@Injectable()
export class HttpService {

  private exportAccessed = false;
  private lockedExport = false;
  private headers = new Headers({});
  options: RequestOptionsArgs = new RequestOptions();

  constructor(private http: Http) {}

  /**
   * Loads all labels from the backend to have the actual ones
   * @return Promise<string[]> a promise containing a list of strings (label names)
   */
  getLabels(): Promise<string[]> {
    const url = '/api/labels';
    return this.http.get(url).toPromise().then(response => response.json() as String[]).catch(this.handleError);
  }

  /**
 * Loads all labels from the backend to have the actual ones
 * @return Promise<string[]> a promise containing a list of strings (label names)
 */
  getDocument(id: string): Promise<Document> {
    const url = '/api/document/' + id;
    return this.http.get(url).toPromise().then(response => response.json() as Document).catch(this.handleError);
  }

  /**
   * Sends the uploaded file as formData and get back the processed file as document object to display it
   * @param files the actually uploaded file/s
   * @return Promise<Document> a promise containing the processed file as Document object
   */
  postFile(files): Promise<Document> {
    const url = '/api/upload';
    const formData: FormData = new FormData();
    this.options.headers = new Headers();

    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }

    return this.http.post(url, formData, this.options)
      .toPromise().then(response => response.json() as Document)
      .catch(this.handleError);

  }

  unluckExport(docId: string): void {
    this.lockedExport = false;
    if (this.exportAccessed) {
      this.exportFile(docId);

    }
  }

  /**
   * Sends the manually reworked anonymizations to the backend to update the document.
   * Additionally calls the api path for the export of the anonymized document.
   * @param anonymizations a list of updated and added anonymizations
   * @param id of the document in progress
   */
  saveFile(anonymizations: Anonymization[], id: string, version: number): Promise<number> {
    this.lockedExport = true;
    const url = '/api/update/anonymizations/' + id + '/' + version;
    const headers = new Headers();

    headers.append('Content-Type', 'application/json');
    return this.http.post(url, JSON.stringify(anonymizations), {headers: headers})
      .toPromise().then(response => Number(response.text())
      )
      .catch(this.handleError);

  }

  exportFile(id: string): void {
    if (this.lockedExport) {
      this.exportAccessed = true;
      return;
    }
    window.location.replace('api/save/' + id);
    this.exportAccessed = false;
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
