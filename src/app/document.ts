import { Anonymization } from './anonymization';

export class Document {

  id: string;
  version: number;
  fileName: string;

  text: string[];

  displayableText: string;
  fullText: string;
  originalFileType: string;
  anonymizations: Anonymization[];

}
