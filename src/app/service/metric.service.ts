import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IDeltaTreeGetResponse} from '../interfaces/IDeltaTreeGetResponse';
import {ICommit} from '../interfaces/ICommit';
import {INode} from '../interfaces/INode';
import {IMetricMapping} from '../interfaces/IMetricMapping';
import {AppConfig} from '../AppConfig';
import {delay, map} from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable()
export class MetricService {

    constructor(private http: HttpClient) {
    }

    loadDeltaTree(leftCommit: ICommit, rightCommit: ICommit, metricMapping: IMetricMapping): Observable<IDeltaTreeGetResponse> {
        if (environment.useCoderadarEndpoint) {
            const body = {
                'commit1': leftCommit.name,
                'commit2': rightCommit.name,
                'metrics': [metricMapping.heightMetricName, metricMapping.groundAreaMetricName, metricMapping.colorMetricName]
            };

            return this.http.post<INode>(`${AppConfig.BASE_URL}/projects/1/metricvalues/deltaTree`, body)
                .pipe(
                    map((res) => {
                        return {
                            rootNode: res
                        };
                    })
                );
        } else {
            const deltaTreeId = leftCommit.name.charAt(0);
            return this.http.get<INode>(`http://localhost:4200/assets/json/deltaTree${deltaTreeId}.json`)
                .pipe(
                    delay(1500),
                    map((res) => {
                        return {
                            rootNode: res
                        };
                    })
                );
        }
    }

}
