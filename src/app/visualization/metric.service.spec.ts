import {TestBed, inject} from '@angular/core/testing';

import {MetricService} from './metric.service';

describe('MetricService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MetricService]
        });
    });

    it('should ...', inject([MetricService], (service: MetricService) => {
        expect(service).toBeTruthy();
    }));
});
