import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
  const pw = g.get('password')?.value;
  const confirm = g.get('password_confirm')?.value;
  return pw === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  form: FormGroup;
  loading = signal(false);
  errorMsg = signal('');
  success = signal(false);

  countries = [
    'Tanzania', 'Kenya', 'Uganda', 'Rwanda', 'Burundi',
    'Ethiopia', 'South Africa', 'Nigeria', 'Ghana', 'Other',
  ];

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group(
      {
        full_name: [''],
        email: ['', [Validators.required, Validators.email]],
        country: ['Tanzania'],
        password: ['', [Validators.required, Validators.minLength(8)]],
        password_confirm: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  submit(): void {
    if (this.form.invalid) return;
    this.errorMsg.set('');
    this.loading.set(true);
    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: err => {
        this.loading.set(false);
        const msg =
          err?.error?.email?.[0] ||
          err?.error?.password?.[0] ||
          err?.error?.non_field_errors?.[0] ||
          'Registration failed.';
        this.errorMsg.set(msg);
      },
    });
  }
}
