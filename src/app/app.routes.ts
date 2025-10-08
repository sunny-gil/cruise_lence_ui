import { Routes } from '@angular/router';

export const routes: Routes = [
     { path: '', redirectTo: 'home', pathMatch: 'full' },
     {
          path: 'home',
          loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
     },
      {
          path: 'about',
          loadComponent: () => import('./about/about.component').then(m => m.AboutComponent)
     },
      {
          path: 'course-1',
          loadComponent: () => import('./course-1/course-1.component').then(m => m.Course1Component)
     },
      {
          path: 'course-2',
          loadComponent: () => import('./course-2/course-2.component').then(m => m.Course2Component)
     },
      {
          path: 'course-3',
          loadComponent: () => import('./course-3/course-3.component').then(m => m.Course3Component)
     },
      {
          path: 'partners',
          loadComponent: () => import('./partners/partners.component').then(m => m.PartnersComponent)
     },
      {
          path: 'contact',
          loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent)
     },
       {
          path: 'faq',
          loadComponent: () => import('./faq/faq.component').then(m => m.FaqComponent)
     },
      {
          path: 'apply-now',
          loadComponent: () => import('./apply-now/apply-now.component').then(m => m.ApplyNowComponent)
     },
      {
          path: 'why-cruise',
          loadComponent: () => import('./why-cruise/why-cruise.component').then(m => m.WhyCruiseComponent)
     },
      {
          path: 'terms&Condition',
          loadComponent: () => import('./terms-conditions/terms-conditions.component').then(m => m.TermsConditionsComponent)
     },
        {
          path: 'privacy-policy',
          loadComponent: () => import('./privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
     },
      {
          path: 'refund-cancellation-policy',
          loadComponent: () => import('./refund-cancellation-policy/refund-cancellation-policy.component').then(m => m.RefundCancellationPolicyComponent)
     },
      {
          path: 'disclaimer',
          loadComponent: () => import('./disclaimer/disclaimer.component').then(m => m.DisclaimerComponent)
     },
      {
          path: 'cookie-policy',
          loadComponent: () => import('./cookie-policy/cookie-policy.component').then(m => m.CookiePolicyComponent)
     },
     {
          path: 'Shipping-Delivery-Policy',
          loadComponent: () => import('./shipping-delivery-policy/shipping-delivery-policy.component').then(m => m.ShippingDeliveryPolicyComponent)
     },
     {
          path: 'grievance-redressal-policy',
          loadComponent: () => import('./grievance-redressal-policy/grievance-redressal-policy.component').then(m => m.GrievanceRedressalPolicyComponent)
     },
     {
          path: 'academic-training-policy',
          loadComponent: () => import('./academic-training-policy/academic-training-policy.component').then(m => m.AcademicTrainingPolicyComponent)
     },
      {
          path: 'code-conduct-policy',
          loadComponent: () => import('./code-conduct-policy/code-conduct-policy.component').then(m => m.CodeConductPolicyComponent)
     },
       {
          path: 'academic-integrity-policy',
          loadComponent: () => import('./academic-integrity-policy/academic-integrity-policy.component').then(m => m.AcademicIntegrityPolicyComponent)
     },
     {
          path: 'payment-emi-policy',
          loadComponent: () => import('./payment-emi-policy/payment-emi-policy.component').then(m => m.PaymentEMIPolicyComponent)
     },
];
     

