import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { HighlightAnonymizationPipe } from './highlight-anonymization.pipe';
import { KeyControlDirective } from './key-control.directive';

@NgModule({
  declarations: [
    AppComponent,
    HighlightAnonymizationPipe,
    KeyControlDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
