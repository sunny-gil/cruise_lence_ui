import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [CommonModule,RouterModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent  implements OnInit {
  fullText: string = `Recognizing this gap, Rohan built Cruise Lens Academy 
to create a dedicated platform for maritime education, 
ensuring aspiring photographers receive structured guidance, 
hands-on training, and international exposure.`;
  
  displayedText: string = '';
  currentIndex: number = 0;
  typingSpeed: number = 50; // milliseconds per character

  ngOnInit() {
    this.typeText();
  }

  typeText() {
    if (this.currentIndex < this.fullText.length) {
      this.displayedText += this.fullText[this.currentIndex];
      this.currentIndex++;
      setTimeout(() => this.typeText(), this.typingSpeed);
    }
  }

  // about.component.ts
scrollToSection(event: Event, sectionId: string) {
  event.preventDefault(); // prevent default anchor jump
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

}