import { Component, Input } from '@angular/core';
import { FileReference } from 'typescript';
import { UploadFileService } from './upload-file.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UploadFileService]
})
export class AppComponent {
  title = 'AnonML';
  outputFile;

  @Input() file: any;

  fileHandle(event): void {
    const files = event.target.files || event.srcElement.files;;
    console.log(files);

    this.outputFile = files;

    console.log(this.uploadFileService.postFile(files));

  }
  constructor(private uploadFileService: UploadFileService) { }
}
