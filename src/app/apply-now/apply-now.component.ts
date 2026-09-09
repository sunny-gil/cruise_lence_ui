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
  applicantDetails: FormGroup;

  selectedCourse = '';
  resumeFiles: File[] = [];
  paymentMode: string = ''; // 'advance' | 'balance' | 'custom'

  isLoading: boolean = false;
  customAmount: number = 5000;
  showBankModal: boolean = false;

  constructor(private fb: FormBuilder, private supabaseService: SupabaseService) {
    // Step 1: Personal Info
    this.personalForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      city: ['', Validators.required],
      dob: ['', Validators.required],
      preferredContact: this.fb.array([], Validators.required),
      heardFrom: ['', Validators.required]
    });

    // Step 2: Course Selection
    this.courseForm = this.fb.group({
      course: ['', Validators.required],
    });

    // Step 2: Applicant Details (Points 23 & 24)
    this.applicantDetails = this.fb.group({
      usedCamera: ['', Validators.required],              // Q1: Yes / No / Phone only
      hospitalityExp: ['', Validators.required],          // Q2: Yes / No
      totalExperience: ['', Validators.required],         // Q3: Total work experience (years)
      photographyExperience: ['', Validators.required],   // Q4: Photography experience (years)
      hasTattoos: ['', Validators.required],              // Q5: Visible tattoos (Yes / No)
      fitToSeaMedical: [''],                              // Q6: Conditional for Course 2 (Yes / No)
      message: ['']
    });
  }

  ngOnInit(): void {
    this.courseForm.get('course')?.valueChanges.subscribe(value => {
      this.selectedCourse = value;
      this.paymentMode = '';
      if (value === 'course2') {
        this.applicantDetails.get('fitToSeaMedical')?.setValidators([Validators.required]);
      } else {
        this.applicantDetails.get('fitToSeaMedical')?.clearValidators();
      }
      this.applicantDetails.get('fitToSeaMedical')?.updateValueAndValidity();
    });
  }

  // Navigation
  isCurrentStepValid(): boolean {
    if (this.step === 1) {
      return this.personalForm.valid;
    }
    if (this.step === 2) {
      if (!this.courseForm.valid) return false;
      if (!this.applicantDetails.valid) return false;
      if (this.selectedCourse === 'course2' && !this.applicantDetails.value.fitToSeaMedical) {
        return false;
      }
      return true;
    }
    if (this.step === 3) {
      return this.resumeFiles.length > 0;
    }
    if (this.step === 4) {
      if (!this.paymentMode) return false;
      if (this.paymentMode === 'custom' && (!this.customAmount || this.customAmount < 5000)) {
        return false;
      }
      return true;
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
    const selectedValue = target.value;
    this.selectedCourse = selectedValue;
    this.courseForm.patchValue({ course: selectedValue });
    this.paymentMode = '';
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const newFiles = Array.from(input.files);
      this.resumeFiles = [...this.resumeFiles, ...newFiles];
    }
    input.value = '';
  }

  removeFile(index: number) {
    this.resumeFiles.splice(index, 1);
  }

  getCourseData() {
    return {
      course: this.selectedCourse,
      ...this.applicantDetails.value
    };
  }

  async uploadFiles(): Promise<string[]> {
    if (!this.resumeFiles.length) return [];
    const uploadedUrls: string[] = [];

    for (const file of this.resumeFiles) {
      try {
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
      } catch (e) {
        console.warn('File upload fallback:', e);
      }
    }
    return uploadedUrls;
  }

  private submitPayuForm(payuUrl: string, params: Record<string, string>) {
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
    setTimeout(() => form.submit(), 0);
  }

  // Payment Calculations (Points 25 & 26)
  getBalanceAmount(): number {
    if (this.selectedCourse === 'course1') {
      return 99000; // ₹1,49,000 - ₹50,000
    } else if (this.selectedCourse === 'course2') {
      return 158000; // ₹2,08,000 - ₹50,000
    }
    return 0;
  }

  getBaseAmount(): number {
    if (this.paymentMode === 'advance') {
      return 50000;
    } else if (this.paymentMode === 'balance') {
      return this.getBalanceAmount();
    } else if (this.paymentMode === 'custom') {
      return this.customAmount || 0;
    }
    return 0;
  }

  getProcessingFee(): number {
    const base = this.getBaseAmount();
    return +(base * 0.025).toFixed(2);
  }

  getTotalPayable(): number {
    const base = this.getBaseAmount();
    const fee = this.getProcessingFee();
    return +(base + fee).toFixed(2);
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

    if (this.paymentMode === 'custom' && (!this.customAmount || this.customAmount < 5000)) {
      alert('Minimum payment amount is ₹5,000.');
      return;
    }

    const baseAmount = this.getBaseAmount();
    const totalAmount = this.getTotalPayable();
    const amountStr = totalAmount.toFixed(2);

    const applicationData = {
      personalInfo: this.personalForm.value,
      course: this.courseForm.value.course,
      courseData: this.getCourseData(),
      resumeFiles: await this.uploadFiles(),
      paymentMode: this.paymentMode,
      baseAmount: baseAmount,
      processingFee: this.getProcessingFee(),
      amount: amountStr
    };

    try {
      this.isLoading = true;

      // Save to Supabase
      try {
        await this.supabaseService.insertApplication({
          fullName: this.personalForm.value.fullName,
          email: this.personalForm.value.email,
          phone: this.personalForm.value.phone,
          city: this.personalForm.value.city,
          dob: this.personalForm.value.dob,
          heardFrom: this.personalForm.value.heardFrom,
          preferredContact: this.preferredContactArray.value,
          course: this.courseForm.value.course,
          courseData: this.getCourseData(),
          paymentMode: this.paymentMode,
          amount: amountStr
        });
      } catch (errDb) {
        console.warn('Supabase log:', errDb);
      }

      // Initiate PayU
      const resp = await fetch(`${environment.backendUrl}/payu-initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      });

      const payuResp = await resp.json();
      if (payuResp?.payuUrl && payuResp?.payuParams) {
        this.submitPayuForm(payuResp.payuUrl, payuResp.payuParams);
      } else {
        alert('Could not initiate online payment gateway. Please make direct bank transfer or contact support.');
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected error';
      alert('Payment initialization error: ' + msg);
    } finally {
      this.isLoading = false;
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

  // Bank Details Modal & Download (Point 27)
  openBankModal(): void {
    this.showBankModal = true;
  }

  closeBankModal(): void {
    this.showBankModal = false;
  }

  downloadBankDetails(): void {
    const bankContent = `=====================================================
CRUISE LENS ACADEMY - OFFICIAL PAYMENT DETAILS
=====================================================

Candidates wishing to make direct bank transfers via UPI, IMPS, NEFT, or RTGS may use the official account details below:

ACCOUNT INFORMATION:
--------------------
Account Holder Name : Cruise Lens Academy
Bank Name           : HDFC Bank
Account Number      : 50200085472190
Account Type        : Current Account
IFSC Code           : HDFC0001234
Branch              : Mapusa, Goa - 403507

UPI DETAILS:
------------
UPI ID              : cruiselensacademy@okhdfcbank
Merchant VPA        : cruiselens@upi

POST-PAYMENT CONFIRMATION:
--------------------------
After completing your transfer, please send your payment receipt / UTR number to:
Email    : contact@cruiselensacademy.com
WhatsApp : +91 7827543626

Our admissions team will verify your payment and issue your official enrollment confirmation within 48 hours.
=====================================================`;

    const blob = new Blob([bankContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Cruise_Lens_Academy_Bank_Details.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  resetForms() {
    this.personalForm.reset();
    this.courseForm.reset();
    this.applicantDetails.reset();
    this.resumeFiles = [];
    this.paymentMode = '';
    this.selectedCourse = '';
    this.step = 1;
  }
}
