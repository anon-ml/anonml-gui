import {Replacement} from './replacement';

export class Anonymization {

  id: number;
  data: Replacement;
  producer: string;
  status: string;

  constructor() {
    this.data = new Replacement();
  }

}
