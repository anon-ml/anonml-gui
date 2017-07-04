import { Anonymization } from './anonymization';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import { Document } from './document';


@Injectable()
export class HttpService {

  private headers = new Headers({});
  options: RequestOptionsArgs = new RequestOptions();

  constructor(private http: Http) { }

  getLabels(): Promise<string[]> {
    const url = '/api/labels';
    return this.http.get(url).toPromise().then(response => response.json() as String[]).catch(this.handleError);
  }


  postFile(files): Promise<Document> {
    const url = '/api/upload';
    const formData: FormData = new FormData();
    this.options.headers = new Headers(); // 'Content-Type': 'multipart/form-data'

    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }

    return this.http.post(url, formData, this.options)
      .toPromise().then(response => response.json() as Document)
      .catch(this.handleError);

  }

  saveFile(anonymizations: Anonymization[], id: string): Promise<string> {
    const url = 'api/save/' + id

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.http.post(url, JSON.stringify(anonymizations), { headers: headers })
      .toPromise().then(response => response.json() as string)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
