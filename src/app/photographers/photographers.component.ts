import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-photographers',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './photographers.component.html',
  styleUrls: ['./photographers.component.css']
})
export class PhotographersComponent implements OnInit, AfterViewInit {

  @ViewChild('track') trackRef!: ElementRef;

  photographers: any[] = [];
  doubled: any[] = [];

  translateX = 0;
  currentIndex = 0;
  cardWidth = 330;
  isTransitionEnabled = true;

  autoSlideInterval: any = null;
  flippedCard: string | null = null;

  apiUrl = `${environment.backendUrl}/testimonials`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPhotographers();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.detectCardWidth();
      this.startAutoSlide();
    }, 500);
  }

  loadPhotographers(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(res => {
      this.photographers = res.map((p: any, i: number) => ({
        ...p,
        initials:
          p.initials ||
          p.name?.split(' ').map((n: string) => n[0]).join('') ||
          `P${i}`,
        skills: (p.skills || '').split(',').map((s: string) => s.trim()),
        certifications: (p.certifications || '').split(',').map((s: string) => s.trim())
      }));

      // Infinite loop list
      this.doubled = [...this.photographers, ...this.photographers];
      // this.doubled = this.photographers;
    });
  }

  detectCardWidth(): void {
    const card = this.trackRef.nativeElement.querySelector('.card-item');
    if (card) {
      this.cardWidth = card.offsetWidth + 30;
    }
  }

  /* ================= AUTO SLIDE ================= */

  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  pauseAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  resumeAutoSlide(): void {
    if (!this.autoSlideInterval) {
      this.startAutoSlide();
    }
  }

  /* ================= SLIDER CONTROLS ================= */

  nextSlide(): void {
    this.isTransitionEnabled = true;
    this.currentIndex++;
    this.updatePosition();

    if (this.currentIndex === this.photographers.length) {
      setTimeout(() => {
        this.isTransitionEnabled = false;
        this.currentIndex = 0;
        this.updatePosition();
      }, 600);
    }
  }

  prevSlide(): void {
    this.isTransitionEnabled = true;
    this.currentIndex--;

    if (this.currentIndex < 0) {
      this.isTransitionEnabled = false;
      this.currentIndex = this.photographers.length - 1;
      this.updatePosition();

      setTimeout(() => {
        this.isTransitionEnabled = true;
      }, 50);
    } else {
      this.updatePosition();
    }
  }

  updatePosition(): void {
    this.translateX = -(this.currentIndex * this.cardWidth);
  }

  /* ================= CARD FLIP ================= */

  flipCard(initials: string | null): void {
    this.flippedCard = initials;
  }
}
