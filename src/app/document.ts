import { Anonymization } from './anonymization';

export class Document {

  id: string;
  fileName: string;

  text: string[];

  displayableText: string;
  fullText: string;
  originalFileType: string;
  anonymizations: Anonymization[];

}
