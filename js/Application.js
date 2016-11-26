import {Interface} from './interface/Interface';
import {Screen} from './Screen';
import {config} from './Config';
import {ElementAnalyzer} from './ElementAnalyzer';
import {CoderadarMetricService} from './service/CoderadarMetricService';
import {DummyMetricService} from './service/DummyMetricService';
import {DummyCommitService} from './service/DummyCommitService';
import {CoderadarCommitService} from './service/CoderadarCommitService';
import {CommitMapper} from './domain/CommitMapper';
import {CommitMerger} from './CommitMerger';
import {MergedDrawer} from './drawer/MergedDrawer';
import {SingleDrawer} from './drawer/SingleDrawer';
import * as PubSub from 'pubsub-js';

export class Application {

    constructor() {
        this.SYNCHRONIZE_ENABLED = true;
        this.IS_FULLSCREEN = false;

        this._uniqueElementList = [];

        this.createInterface();
        this.initializeEventListeners();

        this.leftCommitId = undefined;
        this.rightCommitId = undefined;

        this.result = undefined;
        this.minMaxPairOfHeight = undefined;

        this.screens = {};
        this.createLeftScreen();
        this.createRightScreen();
    }

    initialize() {
        var commitService = new DummyCommitService();
        // FIRST: load commits
        commitService.load((data) => {
            var commitMapper = new CommitMapper(data);
            commitMapper.mapAll();

            PubSub.publish('commitsLoaded', { commits: commitMapper.getAll() });

            this.leftCommitId = 'abc123';
            this.rightCommitId = 'def456';

            this.getLeftScreen().setCommitId(this.leftCommitId);
            this.getRightScreen().setCommitId(this.rightCommitId);

            // SECOND: load commit data
            this.loadMetricData();
        });
    }

    loadMetricData() {
        this.interface.showLoadingIndicator();

        let metricService = new DummyMetricService();
        metricService.loadTwoCommits(this.leftCommitId, this.rightCommitId, (firstCommitResult, secondCommitResult) => {
            this.getLeftScreen().reset();
            this.getRightScreen().reset();

            // #3: set commitId dynamically
            firstCommitResult.commitId = this.leftCommitId;
            secondCommitResult.commitId = this.rightCommitId;

            console.time('merging time');
            var result = CommitMerger.merge(firstCommitResult, secondCommitResult);
            console.timeEnd('merging time');
            // console.log('merging ' + this.leftCommitId + ' and ' + this.rightCommitId + ':', result);

            this._uniqueElementList = ElementAnalyzer.generateUniqueElementList(result);
            var minMaxPairOfHeight = ElementAnalyzer.findSmallestAndBiggestMetricValueByMetricName(result, config.HEIGHT_METRIC_NAME);

            this.result = result;
            this.minMaxPairOfHeight = minMaxPairOfHeight;

            this._initializeScreens();
            this.interface.hideLoadingIndicator();
        });
    }

    _initializeScreens() {
        if (this.IS_FULLSCREEN) {
            this.getLeftScreen().reset();
            this.getLeftScreen().setData(this.result, this.minMaxPairOfHeight);
            this.getLeftScreen().setDrawer(MergedDrawer);
            this.getLeftScreen().render();
            this.getLeftScreen().centerCamera();
        } else {
            this.getLeftScreen().reset();
            this.getLeftScreen().setData(this.result, this.minMaxPairOfHeight);
            this.getLeftScreen().setDrawer(SingleDrawer);
            this.getLeftScreen().render();
            this.getLeftScreen().centerCamera();

            this.getRightScreen().reset();
            this.getRightScreen().setData(this.result, this.minMaxPairOfHeight);
            this.getRightScreen().setDrawer(SingleDrawer);
            this.getRightScreen().render();
            this.getRightScreen().centerCamera();
        }
    }

    _handleSingleSplitToggle(enabled) {
        this.IS_FULLSCREEN = enabled;

        if (this.IS_FULLSCREEN) {
            document.querySelector('#stage').classList.remove('split');
            this.getLeftScreen().reset();
            this.getLeftScreen().setFullscreen();
            this.getLeftScreen().setDrawer(MergedDrawer);
            this.getLeftScreen().render();

            this.getRightScreen().setFullscreen();
        } else {
            document.querySelector('#stage').classList.add('split');
            this.getLeftScreen().reset();
            this.getLeftScreen().setSplitscreen();
            this.getLeftScreen().setDrawer(SingleDrawer);
            this.getLeftScreen().render();

            this.getRightScreen().reset();
            this.getRightScreen().setSplitscreen();
            this.getRightScreen().setData(this.result, this.minMaxPairOfHeight);
            this.getRightScreen().setDrawer(SingleDrawer);
            this.getRightScreen().render();
        }
    }

    createLeftScreen() {
        this.screens['left'] = new Screen('left');
    }

    createRightScreen() {
        this.screens['right'] = new Screen('right');
    }

    getLeftScreen() {
        return this.screens['left'];
    }

    getRightScreen() {
        return this.screens['right'];
    }

    createInterface() {
        this.interface = new Interface(this);
    }

    getUniqueElementList() {
        return this._uniqueElementList;
    }

    initializeEventListeners() {
        PubSub.subscribe('commitChange', (eventName, args) => {
            if (args.type == 'left') {
                this.leftCommitId = args.commit;
                this.getLeftScreen().setCommitId(this.leftCommitId);
            } else if (args.type == 'right') {
                this.rightCommitId = args.commit;
                this.getRightScreen().setCommitId(this.rightCommitId);
            }

            this.loadMetricData();
            PubSub.publish('closeComparisonContainer');
        });

        PubSub.subscribe('synchronizeEnabledChange', (eventName, args) => {
            if (args.enabled) {
                this.getLeftScreen().centerCamera();
                this.getRightScreen().centerCamera();
            }

            this.SYNCHRONIZE_ENABLED = args.enabled;
        });

        PubSub.subscribe('fullSplitToggle', (eventName, args) => {
            this._handleSingleSplitToggle(args.enabled);
        });

        PubSub.subscribe('mouseMove', (eventName, args) => {
            if (args.screen == 'left') {
                this.getLeftScreen().getControls().enabled = true;
                this.getRightScreen().getControls().enabled = this.SYNCHRONIZE_ENABLED;

                this.getLeftScreen().getInteractionHandler().setEnabled(true);
                this.getRightScreen().getInteractionHandler().setEnabled(false);
            } else if (args.screen == 'right') {
                this.getLeftScreen().getControls().enabled = this.SYNCHRONIZE_ENABLED;
                this.getRightScreen().getControls().enabled = true;

                this.getLeftScreen().getInteractionHandler().setEnabled(false);
                this.getRightScreen().getInteractionHandler().setEnabled(true);
            }
        });
    }
}