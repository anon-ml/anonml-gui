import { AnonGuiPage } from './app.po';

describe('anon-gui App', () => {
  let page: AnonGuiPage;

  beforeEach(() => {
    page = new AnonGuiPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
