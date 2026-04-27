import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
  ],
  template: `
    <div class="login-wrapper">
      <mat-card class="login-card">
        <mat-card-title>Crear cuenta</mat-card-title>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="name" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Contraseña</mat-label>
            <input matInput type="password" formControlName="password" />
          </mat-form-field>

          <mat-radio-group formControlName="mode" class="mode-group">
            <mat-radio-button value="org">Crear nueva organización</mat-radio-button>
            <mat-radio-button value="invite">Unirse con código</mat-radio-button>
          </mat-radio-group>

          @if (form.get('mode')?.value === 'org') {
            <mat-form-field appearance="outline" class="full">
              <mat-label>Nombre de la organización</mat-label>
              <input matInput formControlName="organizationName" />
            </mat-form-field>
          } @else {
            <mat-form-field appearance="outline" class="full">
              <mat-label>Código de invitación</mat-label>
              <input matInput formControlName="inviteCode" />
            </mat-form-field>
          }

          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Creando...' : 'Crear cuenta' }}
          </button>
          <p class="error" *ngIf="error()">{{ error() }}</p>
          <p class="hint">¿Ya tienes cuenta? <a routerLink="/login">Entra</a></p>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrapper { display:flex; justify-content:center; padding:48px 16px; background: #f8fafc; min-height: 100vh; }
    .login-card { width:100%; max-width:400px; padding:24px; }
    .full { width:100%; }
    .error { color:#c62828; margin-top:12px; }
    .hint { margin-top:16px; font-size:14px; }
    form { display:flex; flex-direction:column; gap:8px; }
    .mode-group { display: flex; gap: 16px; margin: 16px 0; }
  `],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    mode: ['org' as 'org' | 'invite', Validators.required],
    organizationName: [''],
    inviteCode: [''],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    
    const { name, email, password, mode, organizationName, inviteCode } = this.form.getRawValue();
    
    this.auth.register(
      name, 
      email, 
      password,
      mode === 'org' ? organizationName : undefined,
      mode === 'invite' ? inviteCode : undefined
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Error al registrarse');
      },
    });
  }
}