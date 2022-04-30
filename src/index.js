import {
    renderElement,
    renderElementAsAppend,
    replaceElement,
    ReactiveComponent,
    DelayedComponent
} from './ui';
import {
    initializeDataStore,
    setState,
    getState,
    addStateListener,
    getStateAndListenForChanges
} from './data';
import { resizeImage } from './utility';

const ui = {
    renderElement,
    renderElementAsAppend,
    replaceElement,
    ReactiveComponent,
    DelayedComponent
};

const data = {
    initializeDataStore,
    setState,
    getState,
    addStateListener,
    getStateAndListenForChanges
};

const utility = {
    resizeImage
};

export {
    ui,
    data,
    utility
};
