import {Action} from "@ngrx/store";
import {Commit} from "../domain/Commit";
import {IMetricMapping} from "../domain/IMetricMapping";
import {INode} from "../domain/INode";

export const LOAD_METRIC_TREE = 'LOAD_METRIC_TREE';
export const LOAD_METRIC_TREE_SUCCESS = 'LOAD_METRIC_TREE_SUCCESS';
export const LOAD_METRIC_TREE_ERROR = 'LOAD_METRIC_TREE_ERROR';
export const CALCULATE_MINIMUM_AND_MAXIMUM_VALUES = 'CALCULATE_MINIMUM_AND_MAXIMUM_VALUES';
export const GENERATE_UNIQUE_FILE_LIST = 'GENERATE_UNIQUE_FILE_LIST';
export const FOCUS_ELEMENT = 'FOCUS_ELEMENT';

export function loadMetricTree(leftCommit: Commit, rightCommit: Commit, metricMapping: IMetricMapping): Action {
    return {
        type: LOAD_METRIC_TREE,
        payload: {
            leftCommit: leftCommit,
            rightCommit: rightCommit,
            metricMapping: metricMapping
        }
    };
}

export function loadMetricTreeSuccess(metricTree: INode): Action {
    return {
        type: LOAD_METRIC_TREE_SUCCESS,
        payload: metricTree
    };
}

export function loadMetricTreeError(error: string): Action {
    return {
        type: LOAD_METRIC_TREE_ERROR,
        payload: error
    };
}

export function calculateMinimumAndMaximumValues(metricTree: INode): Action {
    return {
        type: CALCULATE_MINIMUM_AND_MAXIMUM_VALUES,
        payload: metricTree
    };
}

export function generateUniqueFileList(metricTree: INode): Action {
    return {
        type: GENERATE_UNIQUE_FILE_LIST,
        payload: metricTree
    };
}

export function focusElement(elementName: string): Action {
    return {
        type: FOCUS_ELEMENT,
        payload: elementName
    };
}