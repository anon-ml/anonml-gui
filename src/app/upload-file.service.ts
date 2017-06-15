import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import { Document } from './document';


@Injectable()
export class UploadFileService {

  private headers = new Headers({});
  options: RequestOptionsArgs = new RequestOptions();

  url = '/api/upload';
  result;
  constructor(private http: Http) { }

  postFile(files): Promise<Document> {
    const formData: FormData = new FormData();
    this.options.headers = new Headers(); // 'Content-Type': 'multipart/form-data'

    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }
    console.log('formData: ');
    console.log(formData);

    return this.http.post(this.url, formData, this.options)
      .toPromise().then(response => response.json() as Document)
      .catch(this.handleError);

  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
