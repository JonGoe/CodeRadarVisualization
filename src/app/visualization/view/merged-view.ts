import {AbstractView} from "./abstract-view";
import {INode} from "../../interfaces/INode";
import {ElementAnalyzer} from "../../helper/element-analyzer";
import {AppConfig} from "../../AppConfig";
import {NodeType} from "../../enum/NodeType";
import {ColorHelper} from "../../helper/color-helper";
import {CommitReferenceType} from "../../enum/CommitReferenceType";
import {ScreenType} from "../../enum/ScreenType";
import {BlockConnection} from "app/geometry/block-connection";
import {Scene} from "three";
import {IMetricMapping} from "../../interfaces/IMetricMapping";

export class MergedView extends AbstractView {

    movedElements: any[] = [];
    connections: BlockConnection[] = [];

    constructor(screenType: ScreenType, metricMapping: IMetricMapping) {
        super(screenType, metricMapping);
    }

    calculateElements(nodes: INode[], parent: INode, bottom: number, level: number = 1) {
        if (!Array.isArray(nodes)) {
            nodes = [nodes];
        }

        nodes.forEach((node) => {
            if (!node.packerInfo.fit) {
                console.warn(`node ${node.name} at position ${this.screenType} has no fit!`);
                return;
            }

            let blueHeight;

            // FILE
            if (node.type === NodeType.FILE) {
                let blueHeightMetric = ElementAnalyzer.getMetricValueOfElementAndCommitReferenceType(node, this.metricMapping.heightMetricName, CommitReferenceType.THIS, this.screenType);
                let orangeHeightMetric = ElementAnalyzer.getMetricValueOfElementAndCommitReferenceType(node, this.metricMapping.heightMetricName, CommitReferenceType.OTHER, this.screenType);

                let blueGroundAreaMetric = ElementAnalyzer.getMetricValueOfElementAndCommitReferenceType(node, this.metricMapping.groundAreaMetricName, CommitReferenceType.THIS, this.screenType);
                let orangeGroundAreaMetric = ElementAnalyzer.getMetricValueOfElementAndCommitReferenceType(node, this.metricMapping.groundAreaMetricName, CommitReferenceType.OTHER, this.screenType);

                let blueColorMetric = ElementAnalyzer.getMetricValueOfElementAndCommitReferenceType(node, this.metricMapping.colorMetricName, CommitReferenceType.THIS, this.screenType);
                let orangeColorMetric = ElementAnalyzer.getMetricValueOfElementAndCommitReferenceType(node, this.metricMapping.colorMetricName, CommitReferenceType.OTHER, this.screenType);

                let blueMetrics = {
                    [this.metricMapping.heightMetricName]: blueHeightMetric,
                    [this.metricMapping.groundAreaMetricName]: blueGroundAreaMetric,
                    [this.metricMapping.colorMetricName]: blueColorMetric
                };

                let orangeMetrics = {
                    [this.metricMapping.heightMetricName]: orangeHeightMetric,
                    [this.metricMapping.groundAreaMetricName]: orangeGroundAreaMetric,
                    [this.metricMapping.colorMetricName]: orangeColorMetric
                };

                blueHeight = blueHeightMetric * AppConfig.HEIGHT_FACTOR;
                let orangeHeight = orangeHeightMetric * AppConfig.HEIGHT_FACTOR;

                let blueEdgeLength = Math.sqrt(blueGroundAreaMetric) * AppConfig.EDGE_LENGTH_FACTOR;
                let orangeEdgeLength = Math.sqrt(orangeGroundAreaMetric) * AppConfig.EDGE_LENGTH_FACTOR;

                let blueColor = ColorHelper.getColorByPosition(this.screenType);
                let orangeColor = ColorHelper.getContraryColorByColor(blueColor);

                let blueTransparency = blueHeight >= orangeHeight && blueEdgeLength >= orangeEdgeLength;
                let orangeTransparency = orangeHeight >= blueHeight && orangeEdgeLength >= blueEdgeLength;

                if (!isNaN(blueEdgeLength) && !isNaN(orangeEdgeLength)) {
                    // both blocks
                    if (blueEdgeLength < orangeEdgeLength) {
                        // draw the bigger block ...
                        this.createBlock(node, parent, orangeColor, orangeEdgeLength, bottom, orangeHeight, orangeTransparency, orangeMetrics, CommitReferenceType.OTHER, { modified: true });

                        // ... calculate the center position for the smaller block ...
                        node.packerInfo.fit.x += (orangeEdgeLength - blueEdgeLength) / 2;
                        node.packerInfo.fit.y += (orangeEdgeLength - blueEdgeLength) / 2;

                        // ... draw the smaller block
                        this.createBlock(node, parent, blueColor, blueEdgeLength, bottom, blueHeight, blueTransparency, blueMetrics, CommitReferenceType.THIS, { modified: true });
                    } else if (blueEdgeLength > orangeEdgeLength) {
                        // draw the bigger block ...
                        this.createBlock(node, parent, blueColor, blueEdgeLength, bottom, blueHeight, blueTransparency, blueMetrics, CommitReferenceType.THIS, { modified: true });

                        // ... calculate the center position for the smaller block ...
                        node.packerInfo.fit.x += (blueEdgeLength - orangeEdgeLength) / 2;
                        node.packerInfo.fit.y += (blueEdgeLength - orangeEdgeLength) / 2;

                        // ... draw the smaller block
                        this.createBlock(node, parent, orangeColor, orangeEdgeLength, bottom, orangeHeight, orangeTransparency, orangeMetrics, CommitReferenceType.OTHER, { modified: true });
                    } else {
                        // ground areas are the same
                        if (blueHeight != orangeHeight) {
                            // heights are different, so draw both blocks
                            this.createBlock(node, parent, blueColor, blueEdgeLength, bottom, blueHeight, blueTransparency, blueMetrics, CommitReferenceType.THIS, { modified: true });
                            this.createBlock(node, parent, orangeColor, orangeEdgeLength, bottom, orangeHeight, orangeTransparency, orangeMetrics, CommitReferenceType.OTHER, { modified: true });
                        } else {
                            // heights are the same, so the file has not changed
                            this.createBlock(node, parent, AppConfig.COLOR_UNCHANGED_FILE, orangeEdgeLength, bottom, orangeHeight, false, orangeMetrics, undefined, { modified: false });
                        }
                    }

                } else if (isNaN(orangeEdgeLength)) {
                    // only blue block

                    let changeTypes = { added: false, deleted: true, moved: false };
                    // cache element to draw connections
                    if (this.isNodeMoved(node)) {
                        this.movedElements.push({
                            fromElementName: node.name,
                            toElementName: node.renamedTo
                        });

                        changeTypes.moved = true;
                    }

                    this.createBlock(node, parent, AppConfig.COLOR_DELETED_FILE, blueEdgeLength, bottom, blueHeight, false, blueMetrics, CommitReferenceType.THIS, changeTypes);

                } else if (isNaN(blueEdgeLength)) {
                    // only orange block

                    let changeTypes = { added: true, deleted: false, moved: false };
                    if (this.isNodeMoved(node)) {
                        // don't push to this.movedElements to avoid duplicates
                        changeTypes.moved = true;
                    }

                    this.createBlock(node, parent, AppConfig.COLOR_ADDED_FILE, orangeEdgeLength, bottom, orangeHeight, false, orangeMetrics, CommitReferenceType.OTHER, changeTypes);
                }

                // MODULE
            } else {
                // don't draw empty modules
                if (ElementAnalyzer.hasChildrenForCurrentCommit(node, true, this.screenType)) {
                    blueHeight = AppConfig.MODULE_BLOCK_HEIGHT;
                    let moduleColor = ColorHelper.getColorByLevelValue(level, this.minModuleLevel, this.maxModuleLevel);
                    this.createBlock(node, parent, moduleColor, undefined, bottom, blueHeight, false);
                }
            }

            // recursion
            if (node.children && node.children.length > 0) {
                this.calculateElements(node.children, node, bottom + blueHeight, level + 1);
            }
        });
    }

    calculateConnections(scene: Scene) {
        for (let movedElementPair of this.movedElements) {
            let fromElement = scene.getObjectByName(movedElementPair.fromElementName);
            let toElement = scene.getObjectByName(movedElementPair.toElementName);

            if (fromElement && toElement) {
                this.connections.push(new BlockConnection(fromElement, toElement));
            } else {
                console.warn(`A connection could not be drawn because at least one element could not be found in the scene.`);
            }
        }
    }

    getConnections(): BlockConnection[] {
        return this.connections;
    }

    private isNodeMoved(node: INode) {
        return node.renamedTo != null || node.renamedFrom != null;
    }
}
