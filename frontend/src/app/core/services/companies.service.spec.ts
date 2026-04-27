import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { CompaniesService } from './companies.service';
import { environment } from '../../../environments/environment';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/companies`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CompaniesService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CompaniesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getAll mapea { companies } a { data }', () => {
    const companies = [{ id: 1, userId: 1, name: 'Acme' }];

    service.getAll().subscribe((res) => {
      expect(res.data).toEqual(companies as any);
    });

    const req = http.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush({ companies });
  });

  it('getById hace GET con el id y mapea { company } a { data }', () => {
    service.getById(5).subscribe((res) => {
      expect(res.data.id).toBe(5);
    });

    const req = http.expectOne(`${url}/5`);
    req.flush({ company: { id: 5, name: 'X' } });
  });

  it('create hace POST con el payload', () => {
    service.create({ name: 'Stripe' }).subscribe();

    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Stripe' });
    req.flush({ company: { id: 1, name: 'Stripe' } });
  });

  it('update hace PUT al id correcto', () => {
    service.update(3, { rating: 5 }).subscribe();

    const req = http.expectOne(`${url}/3`);
    expect(req.request.method).toBe('PUT');
    req.flush({ company: { id: 3, rating: 5 } });
  });

  it('delete hace DELETE al id correcto', () => {
    service.delete(9).subscribe();

    const req = http.expectOne(`${url}/9`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'ok' });
  });
});
