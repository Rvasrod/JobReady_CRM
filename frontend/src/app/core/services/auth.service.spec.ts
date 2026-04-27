import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('login persiste token y usuario y actualiza el signal', () => {
    const fakeResponse: AuthResponse = {
      success: true,
      token: 'jwt-token',
      user: { id: 1, name: 'Roberto', email: 'r@x.com' },
    };

    service.login('r@x.com', 'pw').subscribe((res) => {
      expect(res.token).toBe('jwt-token');
    });

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'r@x.com', password: 'pw' });
    req.flush(fakeResponse);

    expect(localStorage.getItem('jobready_token')).toBe('jwt-token');
    expect(service.currentUser()?.email).toBe('r@x.com');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('logout limpia localStorage y resetea el signal', () => {
    localStorage.setItem('jobready_token', 'x');
    localStorage.setItem('jobready_user', JSON.stringify({ id: 1, name: 'a', email: 'a@a' }));
    service = TestBed.inject(AuthService);

    service.logout();

    expect(localStorage.getItem('jobready_token')).toBeNull();
    expect(service.currentUser()).toBeNull();
  });

  it('register hace POST a /auth/register', () => {
    service.register('Ana', 'a@a.com', 'pw1234').subscribe();

    const req = http.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush({
      success: true,
      token: 't',
      user: { id: 2, name: 'Ana', email: 'a@a.com' },
    });
  });
});
