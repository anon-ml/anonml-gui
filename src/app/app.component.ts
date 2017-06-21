import { Anonymization } from './anonymization';
import { AnonymizationHandlerService } from './anonymization-handler.service';
import { Component, Input } from '@angular/core';
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
  private fileName: string;

  @Input() file: any;

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


  constructor(private uploadFileService: UploadFileService, private anonymizationHanlderService: AnonymizationHandlerService) { }
}
