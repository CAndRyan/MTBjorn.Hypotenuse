import {
    renderElement,
    renderElementAsAppend,
    replaceElement
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
    replaceElement
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
