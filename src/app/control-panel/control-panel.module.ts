import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ControlPanelComponent} from "./control-panel.component";
import {SettingsComponent} from "./settings/settings.component";
import {ViewControlComponent} from "./settings/view-control/view-control.component";
import {FormsModule} from "@angular/forms";
import {NguiAutoCompleteModule} from "@ngui/auto-complete";
import {CommitChooserComponent} from "./commit-chooser/commit-chooser.component";
import {CommitService} from "../service/commit.service";
import {environment} from "../../environments/environment";
import {CommitMockService} from "../service/mocks/commit-mock.service";
import {SearchComponent} from './search/search.component';
import {FilterComponent} from './settings/filter/filter.component';
import {MetricMappingComponent} from './settings/metric-mapping/metric-mapping.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NguiAutoCompleteModule
    ],
    declarations: [
        ControlPanelComponent,
        SettingsComponent,
        ViewControlComponent,
        CommitChooserComponent,
        SearchComponent,
        FilterComponent,
        MetricMappingComponent
    ],
    exports: [
        ControlPanelComponent
    ],
    providers: [
        {
            provide: CommitService,
            useClass: environment.demo ? CommitMockService : CommitService
        }
    ]
})
export class ControlPanelModule {
}