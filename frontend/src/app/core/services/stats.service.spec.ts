import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { StatsService } from './stats.service';
import { environment } from '../../../environments/environment';

describe('StatsService', () => {
  let service: StatsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StatsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(StatsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getDashboard extrae el campo data de la respuesta', () => {
    const dashboard = {
      total: 3,
      avgRating: 4.5,
      bySector: [{ sector: 'SaaS', count: 3 }],
      byRating: [{ rating: 5, count: 1 }],
      recent: [],
    };

    service.getDashboard().subscribe((res) => {
      expect(res).toEqual(dashboard as any);
    });

    const req = http.expectOne(`${environment.apiUrl}/stats`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: dashboard });
  });
});
