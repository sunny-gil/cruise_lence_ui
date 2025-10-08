import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-apply-now',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './apply-now.component.html',
  styleUrls: ['./apply-now.component.css']
})
export class ApplyNowComponent {
  step = 1;

  personalForm: FormGroup;
  courseForm: FormGroup;
  course1Questions: FormGroup;
  course2Questions: FormGroup;
  course3Questions: FormGroup;

  selectedCourse = '';
  resumeFiles: File[] = [];
  paymentMode: string = ''; // <-- required for ngModel

  isLoading: boolean = false;


  constructor(private fb: FormBuilder, private supabaseService: SupabaseService) {
    // Step 1
    debugger
    this.personalForm = this.fb.group({
      
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      city: ['', Validators.required],
      dob: ['', Validators.required],
    preferredContact: this.fb.array([], Validators.required), // FormArray
      heardFrom: ['', Validators.required]
    });

    // Step 2
    this.courseForm = this.fb.group({
      course: ['', Validators.required],
    });

    // Course-specific questions
    this.course1Questions = this.fb.group({
      usedCamera: ['', Validators.required],
      hospitalityExp: ['', Validators.required],
      joinSTCW: ['', Validators.required],
      trainingMode: ['', Validators.required],
      message: [''],
    });

    this.course2Questions = this.fb.group({
      stcwCourse: ['', Validators.required],
      yearsExperience: ['', Validators.required],
      lastShipType: ['', Validators.required],
      readyRejoin: ['', Validators.required],
      message: [''],
    });

    this.course3Questions = this.fb.group({
      yearsPhotography: ['', Validators.required],
      onboardExperience: ['', Validators.required],
      portfolioShared: ['', Validators.required],
      message: [''],

      // ✅ new fields
      cruiseLineWorked: ['', Validators.required],
      lastPosition: ['', Validators.required],
      cameraSystems: ['', Validators.required],
      skillEvaluation: ['', Validators.required],
      careerGoal: ['', Validators.required]
    });
  }

  // Navigation
  nextStep() {
    if (this.step === 1 && this.personalForm.valid) this.step++;
    else if (this.step === 2 && this.courseForm.valid) this.step++;
    else if (this.step === 3 && this.resumeFiles.length > 0) this.step++; // go to Payment
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }

  onCourseChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedCourse = target.value;
    this.paymentMode = ''; // reset payment when course changes
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.resumeFiles = Array.from(input.files);
    }
  }

  getCourseData() {
    if (this.selectedCourse === 'course1') return this.course1Questions.value;
    if (this.selectedCourse === 'course2') {
      return {
        ...this.course2Questions.value,
        stcwCourse: this.selectedStcwCourses // save selected courses array
      };
    }
    if (this.selectedCourse === 'course3') return this.course3Questions.value;
    return {};
  }

  async uploadFiles(): Promise<string[]> {
    if (!this.resumeFiles.length) return [];
    const uploadedUrls: string[] = [];

    for (const file of this.resumeFiles) {
      // ✅ Sanitize file name
      const sanitizedFileName = encodeURIComponent(file.name);
      const path = `resumes/${Date.now()}_${sanitizedFileName}`;

      const { data, error } = await this.supabaseService.uploadFile(file, 'resumes', path);
      if (error) {
        console.error('File upload error:', error);
        continue;
      }

      const url = this.supabaseService.getPublicUrl('resumes', path);
      if (url) uploadedUrls.push(url);
    }

    return uploadedUrls;
  }

  // Called on Step 4 – Pay Now
  async proceedToPayment() {
    const applicationData = {
      personalInfo: this.personalForm.value,
      course: this.courseForm.value.course,
      courseData: this.getCourseData(),
      resumeFiles: await this.uploadFiles(),
      paymentMode: this.paymentMode
    };

    try {
      const response = await fetch('http://localhost:3000/payu-initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Backend error:", errorText);
        alert("Payment initiation failed. Please try again.");
        return;
      }

      const data = await response.json();
      console.log("✅ PayU Response:", data);

      if (!data.payuParams || !data.payuUrl) {
        console.error("❌ Invalid response:", data);
        alert("Could not initiate payment. Please contact support.");
        return;
      }

      // ✅ Safe to proceed now
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.payuUrl;

      Object.entries(data.payuParams).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

    } catch (err) {
      console.error("❌ Payment error:", err);
      alert("Something went wrong while initiating payment.");
    }
  }

  getCourseAmount() {
    switch (this.selectedCourse) {
      case 'course1': return 5000; // Beginner
      case 'course2': return 7000; // STCW Holder
      case 'course3': return 10000; // Photographer
      default: return 0;
    }
  }

  stcwCourses: string[] = [
    "Personal Survival Techniques (PST)",
    "Fire Prevention and Fire Fighting (FPFF)",
    "Elementary First Aid (EFA)",
    "Personal Safety and Social Responsibilities (PSSR)",
    "Security Training for Seafarers with Designated Security Duties (STSDSD)",
    "Passenger Ship Familiarization",
    "Other"
  ];

  selectedStcwCourses: string[] = [];
  isSubmittedCourse2 = false;

  onStcwCheckboxChange(event: any) {
    const course = event.target.value;
    if (event.target.checked) {
      if (!this.selectedStcwCourses.includes(course)) this.selectedStcwCourses.push(course);
    } else {
      const index = this.selectedStcwCourses.indexOf(course);
      if (index > -1) this.selectedStcwCourses.splice(index, 1);
    }
  }



get preferredContactArray(): FormArray {
  return this.personalForm.get('preferredContact') as FormArray;
}

onCheckboxChange(event: any) {
  const checkArray = this.preferredContactArray;
  if (event.target.checked) {
    checkArray.push(this.fb.control(event.target.value));
  } else {
    const index = checkArray.controls.findIndex(x => x.value === event.target.value);
    if (index >= 0) checkArray.removeAt(index);
  }
  checkArray.markAsTouched();
  checkArray.updateValueAndValidity();
}


  async submitApplication() {
    if (!this.personalForm.valid || !this.courseForm.valid) {
      alert('Please fill all required fields');
      return;
    }

    if (this.selectedCourse === 'course2' && this.selectedStcwCourses.length === 0) {
      alert('Please select at least one STCW course.');
      return;
    }

    if (this.personalForm.get('heardFrom')?.invalid) {
  alert("Please select how you heard about us.");
  return;
}

    this.isLoading = true;

    try {
      debugger;

      const resumeUrls = await this.uploadFiles();

      const applicationData = {
        fullName: this.personalForm.value.fullName,
        email: this.personalForm.value.email,
        phone: this.personalForm.value.phone,
        city: this.personalForm.value.city,
        dob: this.personalForm.value.dob,
       heardFrom: this.personalForm.value.heardFrom,    // ✅ fixed typo
        preferredContact: this.preferredContactArray.value, // ✅ properly mapped array
        course: this.courseForm.value.course,
        courseData: this.getCourseData(),
        resume_urls: resumeUrls,
        paymentMode: this.paymentMode,
      };
      //  console.log(this.applicationData)

      const { data: insertData, error: insertError } = await this.supabaseService.insertApplication(applicationData);

      if (insertError) {
        console.error('Database insert error:', insertError.message);
        alert('Error submitting application!');
      } else {
        alert('Application submitted successfully!');
        this.resetForms();
      }

    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Something went wrong!');
    } finally {
      this.isLoading = false;
    }
  }


  resetForms() {
    this.personalForm.reset();
    this.courseForm.reset();
    this.course1Questions.reset();
    this.course2Questions.reset();
    this.course3Questions.reset();
    this.resumeFiles = [];
    this.paymentMode = '';
    this.step = 1;
  }
}
