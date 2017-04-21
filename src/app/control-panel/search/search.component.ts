import {Component, OnInit} from '@angular/core';
import * as fromRoot from "../../shared/reducers";
import {Store} from "@ngrx/store";
import {Subscription} from "rxjs";
import {focusElement} from "../../visualization/visualization.actions";

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

    subscription: Subscription;
    searchTerm: string;
    uniqueFileList: string[] = [];

    constructor(private store: Store<fromRoot.AppState>) {
    }

    ngOnInit() {
        this.subscription = this.store.select(fromRoot.getUniqueFileList).subscribe((fileList) => {
            this.uniqueFileList = fileList;
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    handleValueChanged(chosenItem: string) {
        this.store.dispatch(focusElement(chosenItem));
    }

    autocompleteListFormatter(data: string): string {
        return data;
    }

}