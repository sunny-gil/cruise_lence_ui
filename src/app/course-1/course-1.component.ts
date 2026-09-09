import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
interface CrewMember {
  name: string;
  role: string;
  img: string;
}


@Component({
  selector: 'app-course-1',
  imports: [CommonModule,RouterModule],
  templateUrl: './course-1.component.html',
  styleUrl: './course-1.component.css'
})
export class Course1Component {
  crewMembers: CrewMember[] = [
    { name: "Beginner & New to the Sea", role: "Our Beginner & New to the Sea course is a comprehensive, career-launch program designed for individuals who are passionate about photography", img: "assets/images/starter-track04.webp" },
    { name: "Maritime Documentation", role: "INDOS Registration, SID, STCW Safety Training, Medical Examination ", img: "assets/images/image-25.jpg" },
    { name: "Creative & Technical Photography Training", role: "DSLR mastery, Cruise-specific scenarios, Roleplay exercises simulating real onboard conditions", img: "assets/images/image-26.jpg" },
    { name: "Editing & Software Training", role: " Adobe Lightroom., Adobe Photoshop, Adobe Bridge, IRIS shooting and editing", img: "assets/images/image-27.jpg" },
    { name: "Career Preparation & Placement Assistance", role: "Grooming & communication workshops, Mock HR interview + employer-specific training, Direct interviews with our cruise partners", img: "assets/images/image-23.jpg" },
    { name: "Duration", role: "15-Working-Day Professional Program (MSU & Skill India Certified), Fees: ₹1,49,000, Batch Size: Minimum 6, Maximum 8 students", img: "assets/images/image-24.jpg" }
  ];

crewIndex = 0;
crewAnimating = false;
crewName = this.crewMembers[0].name;
crewRole = this.crewMembers[0].role;
autoScrollInterval: any;

ngOnInit(): void {
  this.updateCrewCarousel(0);

  // Auto-scroll every 3 seconds
  this.autoScrollInterval = setInterval(() => {
    this.next();
  }, 3000);
}

ngOnDestroy(): void {
  if (this.autoScrollInterval) {
    clearInterval(this.autoScrollInterval);
  }
}

updateCrewCarousel(newIndex: number) {
  if (this.crewAnimating) return;
  this.crewAnimating = true;

  this.crewIndex = (newIndex + this.crewMembers.length) % this.crewMembers.length;

  setTimeout(() => {
    this.crewName = this.crewMembers[this.crewIndex].name;
    this.crewRole = this.crewMembers[this.crewIndex].role;
  }, 300);

  setTimeout(() => {
    this.crewAnimating = false;
  }, 800);
}

prev() {
  this.updateCrewCarousel(this.crewIndex - 1);
}

next() {
  this.updateCrewCarousel(this.crewIndex + 1);
}


  // Keyboard navigation
  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') this.prev();
    else if (event.key === 'ArrowRight') this.next();
  }

  // Touch/swipe
  touchStartX = 0;
  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.changedTouches[0].screenX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(e: TouchEvent) {
    const diff = this.touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) this.next();
      else this.prev();
    }
  }

  getCardClass(i: number): string {
    const offset = (i - this.crewIndex + this.crewMembers.length) % this.crewMembers.length;

    if (offset === 0) return 'center';
    else if (offset === 1) return 'right-1';
    else if (offset === 2) return 'right-2';
    else if (offset === this.crewMembers.length - 1) return 'left-1';
    else if (offset === this.crewMembers.length - 2) return 'left-2';
    else return 'hidden';
  }

}

