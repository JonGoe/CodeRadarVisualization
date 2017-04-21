import {CommitReferenceType} from "../enum/CommitReferenceType";
import {INode} from "../domain/INode";
import {ScreenType} from "../enum/ScreenType";
import {NodeType} from "../enum/NodeType";

export class ElementAnalyzer {

    static findElementByName(nodes: INode[], elementName: string): INode {
        if (!Array.isArray(nodes)) {
            nodes = [nodes];
        }

        let foundElement: INode;

        for (let node of nodes) {
            if (node.name === elementName) {
                foundElement = node;
            }

            // recursion
            if (node.children && node.children.length > 0 && !foundElement) {
                foundElement = this.findElementByName(node.children, elementName);
            }
        }

        return foundElement;
    }

    static generateUniqueElementList(nodes: INode[], uniqueElements: string[] = []) {
        if (!Array.isArray(nodes)) {
            nodes = [nodes];
        }

        for (let node of nodes) {
            if (uniqueElements.indexOf(node.name) < 0) {
                uniqueElements.push(node.name);
            }

            // recursion
            if (node.children && node.children.length > 0) {
                this.generateUniqueElementList(node.children, uniqueElements);
            }
        }

        return uniqueElements;
    }

    static findSmallestAndBiggestMetricValueByMetricName(nodes: INode[], metricName: string): any {
        if (typeof nodes !== 'object' || nodes === null) {
            throw new Error('elements is not an object or null!');
        }

        if (!Array.isArray(nodes)) {
            nodes = [nodes];
        }

        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;

        for (let node of nodes) {
            // investigate only FILEs, because only files can have different sizes and colors
            if (node.type == NodeType.FILE) {
                let commit1Metrics = node.commit1Metrics || null;
                let commit2Metrics = node.commit2Metrics || null;

                let big = this.getMaxMetricValueByMetricName(commit1Metrics, commit2Metrics, metricName);
                if (big > max) {
                    max = big;
                }

                let small = this.getMinMetricValueByMetricName(commit1Metrics, commit2Metrics, metricName);
                if (small < min) {
                    min = small;
                }
            }

            // recursion
            if (node.children && node.children.length > 0) {
                let result = this.findSmallestAndBiggestMetricValueByMetricName(node.children, metricName);
                if (result.max > max) {
                    max = result.max;
                }
                if (result.min < min) {
                    min = result.min;
                }
            }
        }

        return {
            min: min,
            max: max
        };
    }

    static getMinMetricValueByMetricName(commit1Metrics: any, commit2Metrics: any, metricName: string): number {
        if (commit1Metrics === null && commit2Metrics === null) {
            throw new Error(`No metric objects given`);
        }

        if (commit1Metrics === null) {
            return commit2Metrics[metricName];
        } else if (commit2Metrics === null) {
            return commit1Metrics[metricName];
        } else {
            return commit1Metrics[metricName] < commit2Metrics[metricName] ? commit1Metrics[metricName] : commit2Metrics[metricName];
        }
    }

    static getMaxMetricValueByMetricName(commit1Metrics: any, commit2Metrics: any, metricName: string): number {
        if (commit1Metrics === null && commit2Metrics === null) {
            throw new Error(`No metric objects given`);
        }

        if (commit1Metrics === null) {
            return commit2Metrics[metricName];
        } else if (commit2Metrics === null) {
            return commit1Metrics[metricName];
        } else {
            return commit1Metrics[metricName] > commit2Metrics[metricName] ? commit1Metrics[metricName] : commit2Metrics[metricName];
        }
    }

    static hasChildrenForCurrentCommit(node: INode, isFullScreen: boolean, screenType: ScreenType): boolean {
        let found = false;

        for (let child of node.children) {
            if (this.hasMetricValuesForCurrentCommit(child, isFullScreen, screenType)) {
                found = true;
            }

            // recursion
            if (child.children && child.children.length > 0 && !found) {
                found = this.hasChildrenForCurrentCommit(child, isFullScreen, screenType);
            }
        }

        return found;
    }

    static hasMetricValuesForCurrentCommit(node: INode, isFullScreen: boolean, screenType: ScreenType) {
        // when in fullScreen mode, metrics for at least one commit should be present
        if (isFullScreen) {
            return node.commit1Metrics != null || node.commit2Metrics != null;
        }

        if (screenType == ScreenType.LEFT) {
            return node.commit1Metrics != null;
        } else if (screenType == ScreenType.RIGHT) {
            return node.commit2Metrics != null;
        } else {
            throw new Error(`Unknown screenType ${screenType}!`);
        }
    }

    static getMetricValueOfElementAndCommitReferenceType(node: INode, metricName: string, commitReferenceType: CommitReferenceType, screenType: ScreenType): number {
        if (screenType == ScreenType.LEFT) {
            if (commitReferenceType == CommitReferenceType.THIS) {
                return node.commit1Metrics ? node.commit1Metrics[metricName] : undefined;
            } else if (commitReferenceType == CommitReferenceType.OTHER) {
                return node.commit2Metrics ? node.commit2Metrics[metricName] : undefined;
            } else {
                throw new Error(`Unknown commitReferenceType ${commitReferenceType}!`);
            }

        } else if (screenType == ScreenType.RIGHT) {
            if (commitReferenceType == CommitReferenceType.THIS) {
                return node.commit2Metrics ? node.commit2Metrics[metricName] : undefined;
            } else if (commitReferenceType == CommitReferenceType.OTHER) {
                return node.commit1Metrics ? node.commit1Metrics[metricName] : undefined;
            } else {
                throw new Error(`Unknown commitReferenceType ${commitReferenceType}!`);
            }

        } else {
            throw new Error(`Unknown screenType ${screenType}!`);
        }
    }

}