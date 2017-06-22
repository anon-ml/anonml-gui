import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { HighlightAnonymizationPipe } from './highlight-anonymization.pipe';
import { FocusReworkDirective } from './focus-rework.directive';
import { FocusMainDirective } from './focus-main.directive';

@NgModule({
  declarations: [
    AppComponent,
    HighlightAnonymizationPipe,
    FocusReworkDirective,
    FocusMainDirective
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
