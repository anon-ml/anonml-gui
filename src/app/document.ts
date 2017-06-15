import { Anonymization } from './anonymization';

export class Document {

  id: number;
  fileName: string;
  text: string;
  originalFileType: string;
  anonymizations: Anonymization[];

}
