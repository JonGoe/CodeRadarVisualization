import * as PubSub from 'pubsub-js';

export class Interface {

    constructor() {
        this.bindEvents();
    }

    bindEvents() {
        document.querySelector('#synchronize-enabled-checkbox').addEventListener('change', (event) => {
            PubSub.publish('synchronizeEnabledChange', { enabled: event.target.checked });
        });

        document.querySelector('#first-commit-select').addEventListener('change', function() {
            PubSub.publish('commitChange', {
                type: 'left',
                commit: this.value
            });
        });

        document.querySelector('#second-commit-select').addEventListener('change', function() {
            PubSub.publish('commitChange', {
                type: 'right',
                commit: this.value
            });
        });
    }
}