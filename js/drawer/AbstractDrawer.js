import {config} from '../Config';
import * as Constants from '../Constants';
import {ElementAnalyzer} from '../util/ElementAnalyzer';
import {ColorHelper} from '../util/ColorHelper';
import {MetricNameService} from '../service/MetricNameService';

export class AbstractDrawer {

    constructor(scene, position) {
        if (new.target === AbstractDrawer) {
            throw new TypeError('Instantiating AbstractDrawer not allowed.');
        }

        this.minBottomValue = 0;
        this.maxBottomValue = Number.MIN_VALUE;

        this.scene = scene;
        this.position = position;
        this.packer = this._getPacker();

        this.metricNameService = new MetricNameService();

        this._initializeEventListeners();
    }

    calculateGroundAreas(elements) {
        if (!Array.isArray(elements)) {
            elements = [elements];
        }

        for (let element of elements) {
            element.w = 0;
            element.h = 0;

            if (element.type == Constants.ELEMENT_TYPE_FILE) {
                var groundArea = this._getValueForGroundArea(element.commit1Metrics, element.commit2Metrics);
                element.w = groundArea * config.GROUND_AREA_FACTOR + config.GLOBAL_MIN_GROUND_AREA + config.BLOCK_SPACING;
                element.h = groundArea * config.GROUND_AREA_FACTOR + config.GLOBAL_MIN_GROUND_AREA + config.BLOCK_SPACING;
            }

            // recursion
            if (element.children && element.children.length > 0) {
                var result = this.calculateGroundAreas(element.children);
                element.w = result.w + config.BLOCK_SPACING * 3;
                element.h = result.h + config.BLOCK_SPACING * 3;
            }
        }

        elements.sort(function (a, b) {
            return b.w - a.w;
        });

        this.packer.fit(elements);
        return {
            packer: this.packer.root,
            w: this.packer.root.w,
            h: this.packer.root.h
        };
    }

    drawElements(elements, parent, bottom = 0) { console.warn('not implemented'); }

    drawBlock(element, parent, color, currentCommitSize, bottom, height, isTransparent) { console.warn('not implemented'); }

    colorizeModules() {
        for (var i = this.scene.children.length - 1; i >= 0; i--) {
            var child = this.scene.children[i];

            if (child.userData && child.userData.type == Constants.ELEMENT_TYPE_MODULE) {
                child.material.color.set(
                    ColorHelper.getColorByBottomValue(child.userData.bottom, this.maxBottomValue, this.minBottomValue)
                );
            }
        }
    }

    setColorization(colorMode) { console.warn('not implemented'); }

    _initializeEventListeners() { console.warn('not implemented'); }

    _generateTooltipHtml(elementName, metrics) {
        var tooltipHtml = [
            '<div class="element-name">' + elementName + '</div>'
        ];

        if (metrics) {
            for (let key of Object.keys(metrics)) {
                tooltipHtml.push('<div>' + this.metricNameService.getShortNameByFullName(key) + ': ' + (metrics[key] || 'N/A') + '</div>');
            }
        }

        return tooltipHtml.join('');
    }

    _getPacker() {
        return new GrowingPacker();
    }

    _getValueForGroundArea(commit1Metrics, commit2Metrics) {
        return ElementAnalyzer.getMaxMetricValueByMetricName(commit1Metrics, commit2Metrics, config.GROUND_AREA_METRIC_NAME);
    }
}