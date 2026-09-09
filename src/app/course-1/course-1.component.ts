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
    { name: "Days 1–3", role: "Build the Foundation: Camera & exposure, composition, lighting fundamentals, lenses & shooting techniques", img: "assets/images/starter-track04.webp" },
    { name: "Days 4–6", role: "Think Like a Cruise Photographer: Workflow, guest interaction, posing, communication & onboard etiquette", img: "assets/images/image-25.jpg" },
    { name: "Days 7–9", role: "Master the Image: Portrait photography, posing & composition, lighting for people & practical sessions", img: "assets/images/image-26.jpg" },
    { name: "Days 10–12", role: "Edit. Present. Sell.: Photo selection, professional editing, presentation & photography sales", img: "assets/images/image-27.jpg" },
    { name: "Days 13–15", role: "Prove Your Skill: Photography assessment, editing evaluation, HR interview & MSU certification", img: "assets/images/image-23.jpg" }
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

