var assert = require('assert');

var commit1 = require('./data/commit1_F_differentParents.json');
var commit2 = require('./data/commit2_F_differentParents.json');

import {CommitMerger} from '../js/CommitMerger';

describe('CommitMerger', function () {
    describe('#merge(commit1, commit2)', function () {
        commit1.commitId = 'abc123';
        commit2.commitId = 'def456';
        var result = CommitMerger.merge(commit1, commit2);

        it('should return an array', function () {
            assert.ok(Array.isArray(result));
        });

        it('should contain the correct amount of elements', function () {
            assert.equal(result.length, 2);
            assert.equal(result[0].children.length, 2);
            assert.equal(result[1].children.length, 1);
        });

        it('should contain correct metricValues for Module A', function() {
            var metricValues = result[0].children[0].metricValues;
            assert.equal(typeof metricValues, 'object');

            var metricNames = Object.keys(metricValues);
            for (var metricName of metricNames) {
                assert.equal(typeof metricValues[metricName], 'object');

                var commitIds = Object.keys(metricValues[metricName]);
                assert.ok(commitIds.indexOf('abc123') >= 0);
                assert.ok(commitIds.indexOf('def456') >= 0);

                assert.equal(typeof metricValues[metricName]['abc123'], 'number');
                assert.equal(typeof metricValues[metricName]['def456'], 'number');
            }
        });

        it('should contain correct metricValues for Module B in Module A', function() {
            var metricValues = result[0].children[1].children[0].metricValues;
            assert.equal(typeof metricValues, 'object');

            var metricNames = Object.keys(metricValues);
            for (var metricName of metricNames) {
                assert.equal(typeof metricValues[metricName], 'object');

                var commitIds = Object.keys(metricValues[metricName]);
                assert.ok(commitIds.indexOf('abc123') < 0);
                assert.ok(commitIds.indexOf('def456') >= 0);

                assert.equal(typeof metricValues[metricName]['def456'], 'number');
            }
        });

        it('should contain correct metricValues for Module B in ROOT', function() {
            var metricValues = result[1].children[0].metricValues;
            assert.equal(typeof metricValues, 'object');

            var metricNames = Object.keys(metricValues);
            for (var metricName of metricNames) {
                assert.equal(typeof metricValues[metricName], 'object');

                var commitIds = Object.keys(metricValues[metricName]);
                assert.ok(commitIds.indexOf('abc123') >= 0);
                assert.ok(commitIds.indexOf('def456') < 0);

                assert.equal(typeof metricValues[metricName]['abc123'], 'number');
            }
        });
    });
});