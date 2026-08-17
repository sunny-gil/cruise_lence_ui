import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SupabaseService } from '../supabase.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-apply-now',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './apply-now.component.html',
  styleUrls: ['./apply-now.component.css']
})
export class ApplyNowComponent implements OnInit {
  step = 1;

  personalForm: FormGroup;
  courseForm: FormGroup;
  course1Questions: FormGroup;
  course2Questions: FormGroup;
  course3Questions: FormGroup;
  coursestartertrackQuestions: FormGroup;


  selectedCourse = '';
  resumeFiles: File[] = [];
  paymentMode: string = ''; // <-- required for ngModel

  isLoading: boolean = false;
  customAmount: number = 0;


  constructor(private fb: FormBuilder, private supabaseService: SupabaseService) {
    // Step 1
    // debugger
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

  this.coursestartertrackQuestions = this.fb.group({
  usedCamera: ['', Validators.required],
  attendedWorkshop: ['', Validators.required],
  reason: ['', Validators.required],
  message: ['']
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

  ngOnInit(): void {
    this.courseForm.get('course')?.valueChanges.subscribe(value => {
  this.selectedCourse = value;
  this.paymentMode = '';
});

  }

  // Navigation
  isCurrentStepValid(): boolean {
    if (this.step === 1) {
      return this.personalForm.valid;
    }
    if (this.step === 2) {
      if (!this.courseForm.valid) return false;
      if (this.selectedCourse === 'starterTrack') return this.coursestartertrackQuestions.valid;
      if (this.selectedCourse === 'course1') return this.course1Questions.valid;
      if (this.selectedCourse === 'course2') {
        return this.course2Questions.valid && this.selectedStcwCourses.length > 0;
      }
      if (this.selectedCourse === 'course3') return this.course3Questions.valid;
      return false;
    }
    if (this.step === 3) {
      return this.resumeFiles.length > 0;
    }
    if (this.step === 4) {
      return !!this.paymentMode;
    }
    return false;
  }

  nextStep() {
    if (this.isCurrentStepValid() && this.step < 4) {
      this.step++;
    }
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }

 onCourseChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const selectedValue = target.value; // ✅ value properly defined

  this.selectedCourse = selectedValue;
  this.courseForm.patchValue({ course: selectedValue });
  this.paymentMode = '';
}


onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const newFiles = Array.from(input.files);
    // ✅ Add newly selected files to existing ones (avoid duplicates)
    this.resumeFiles = [...this.resumeFiles, ...newFiles];
  }

  // ✅ Reset file input so same files can be reselected on mobile
  input.value = '';
}

// ✅ Remove individual file
removeFile(index: number) {
  this.resumeFiles.splice(index, 1);
}


  getCourseData() {
    if (this.selectedCourse === 'starterTrack') return this.coursestartertrackQuestions.value;
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
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${environment.backendUrl}/upload-resume`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (result.fileUrl) {
      uploadedUrls.push(result.fileUrl);
    }
  }

  return uploadedUrls;
}



private submitPayuForm(payuUrl: string, params: Record<string,string>) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = payuUrl;
  form.target = '_self';
  form.style.display = 'none';
  Object.entries(params).forEach(([k, v]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = String(v ?? '');
    form.appendChild(input);
  });
  document.body.appendChild(form);
  setTimeout(() => form.submit(), 0); // iOS friendly
}


async proceedToPayment() {
  if (!this.personalForm.valid || !this.courseForm.valid) {
    alert('Please fill all required fields.');
    return;
  }

  if (!this.paymentMode) {
    alert('Please select a payment option.');
    return;
  }

  let amount = '';

  switch (this.paymentMode) {
    // ✅ Starter Track
case 'st_full':
  amount = '35000.00';
  break;

case 'st_booking':
  amount = '17500.00';
  break;

case 'st_custom':
  amount = this.customAmount && this.customAmount >= 1
    ? this.customAmount.toFixed(2)
    : '0.00';

  if (!this.customAmount || this.customAmount < 1) {
    alert('Please enter an amount of ₹1 or more');
    return;
  }
  break;


    // ✅ Course 1
    case 'c1_advance': amount = '50000.00'; break;
    case 'c1_admission': amount = '100000.00'; break;
    case 'c1_custom': 
      amount = this.customAmount && this.customAmount > 0 ? this.customAmount.toFixed(2) : '0.00';
      if (this.customAmount <= 0) {
        alert('Please enter a valid amount greater than ₹0');
        return;
      }
      break;

    // ✅ Course 2
    case 'c2_advance': amount = '10000.00'; break;
    case 'c2_admission': amount = '90000.00'; break;
    case 'c2_custom':
      amount = this.customAmount && this.customAmount > 0 ? this.customAmount.toFixed(2) : '0.00';
      if (this.customAmount <= 0) {
        alert('Please enter a valid amount greater than ₹0');
        return;
      }
      break;

    // ✅ Course 3
    case 'c3_evaluation': amount = '499.00'; break;
    case 'c3_custom':
      amount = this.customAmount && this.customAmount > 0 ? this.customAmount.toFixed(2) : '0.00';
      if (this.customAmount <= 0) {
        alert('Please enter a valid amount greater than ₹0');
        return;
      }
      break;
  }

  const applicationData = {
    personalInfo: this.personalForm.value,
    course: this.courseForm.value.course,
    courseData: this.getCourseData(),
    resumeFiles: await this.uploadFiles(),
    paymentMode: this.paymentMode,
    amount: amount
  };

  try {
    this.isLoading = true;

    const resp = await fetch(`${environment.backendUrl}/payu-initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData)
    });

    const payuResp = await resp.json();
    if (payuResp?.payuUrl && payuResp?.payuParams) {
      this.submitPayuForm(payuResp.payuUrl, payuResp.payuParams);
    } else {
      alert('Error: PayU response invalid.');
    }

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    alert('Payment error: ' + msg);
  } finally {
    this.isLoading = false;
  }
}





  getCourseAmount() {
    switch (this.selectedCourse) {
      case 'course1': return 1; // Beginner
      case 'course2': return 2; // STCW Holder
      case 'course3': return 3; // Photographer
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
    this.course2Questions.patchValue({
      stcwCourse: this.selectedStcwCourses.length > 0 ? this.selectedStcwCourses.join(', ') : ''
    });
    this.course2Questions.get('stcwCourse')?.markAsTouched();
    this.course2Questions.get('stcwCourse')?.updateValueAndValidity();
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
      // debugger;

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
    this.coursestartertrackQuestions.reset();

    this.resumeFiles = [];
    this.paymentMode = '';
    this.selectedCourse = '';
    this.selectedStcwCourses = [];
    this.step = 1;
  }
}





