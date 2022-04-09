import { v4 as uuidv4 } from 'uuid';

let globalState = {};

const localStorageRootKey = 'mtbjorn-hypotenuse';

// NOTE: any data within the 'local' segment will persist to local storage
export const localDataStateKey = 'local';

const getInitialState = (initialRuntimeState, initialPersistentState) => {
	const localDataJson = localStorage.getItem(localStorageRootKey);
	const localDataFromStorage = localDataJson ? JSON.parse(localDataJson) : {};
    const localData = { ...localDataFromStorage, ...initialPersistentState };;
	const initialState = {
		...initialRuntimeState,
		[localDataStateKey]: localData
	};

	return initialState;
};

export const initializeDataStore = (initialRuntimeState = {}, initialPersistentState = {}) => {
    globalState = getInitialState(initialRuntimeState, initialPersistentState);

    // TODO: something?
};

// A collection of objects { key: 'string', listener: func, includeChildren: bool }, indexed by UUID
const stateListeners = {};

const saveToLocalStorage = async () => {
	const localData = await getState(localDataStateKey);
	const json = JSON.stringify(localData);
	localStorage.setItem(localStorageRootKey, json);
};

const getStateNodeAndFinalKey = (selectionKey) => {
	if (!selectionKey)
		return [globalState, null];

	const keyHierarchy = selectionKey.split('.');

	let currentNode = globalState;
	for (let i = 0; i < keyHierarchy.length - 1; i++) {
		const key = keyHierarchy[i];

		let nextNode = currentNode[key];
		if (nextNode === undefined) {
			currentNode[key] = {};
			nextNode = currentNode[key];
		}
		currentNode = nextNode;
	}

	const finalKey = keyHierarchy[keyHierarchy.length - 1];

	return [ currentNode, finalKey ];
}

const nodeIsParentOfOtherNode = (firstNode, secondNode) => secondNode.substring(0, firstNode.length) === firstNode;

const isKeyAffectedBySelection = (selectionKey, { key, includeChildren }) => nodeIsParentOfOtherNode(selectionKey, key) || (includeChildren && nodeIsParentOfOtherNode(key, selectionKey));

const getStateListenerTrigger = ({ key, listener }) => async () => {
	const updatedStateForListener = await getState(key);
	console.log(`Executing state listener for key '${key}'`);

	await listener(updatedStateForListener);
};

// Trigger a state listener if the selection key that was updated represents a parent node of the listener, or the listener's node itself
// If the listener is attached for children as well, include updates to child nodes
const triggerStateListeners = async (selectionKey) => {
	const listenerTriggers = Object.values(stateListeners)
		.filter((stateListener) => isKeyAffectedBySelection(selectionKey, stateListener))
		.map(getStateListenerTrigger);
	const listenerTasks = listenerTriggers.map((trigger) => trigger());

	await Promise.all(listenerTasks);
};

export const setState = async (selectionKey, data) => {
	const [ stateNode, finalKey ] = getStateNodeAndFinalKey(selectionKey);

	if (!finalKey)
		stateNode = data;
	else
		stateNode[finalKey] = data;
	
	await saveToLocalStorage(); // TODO: consider running parallel to state listeners, but devise method to prevent listeners from modifying state within themselves
	await triggerStateListeners(selectionKey);
};

export const getState = async (selectionKey) => {
	const [ stateNode, finalKey ] = getStateNodeAndFinalKey(selectionKey);

	if (finalKey === null)
		return stateNode;

	return stateNode[finalKey];
};

const getRemoveStateListener = (stateListenerId) => () => {
	delete stateListeners[stateListenerId];
};

export const addStateListener = (selectionKey, onStateChange, triggerOnChildUpdate = false) => {
	const onStateChangeType = typeof onStateChange;
	if (onStateChangeType !== 'function')
		throw `Expected a function as state listener but received '${onStateChangeType}'`;

	const stateListenerId = uuidv4();

	stateListeners[stateListenerId] = {
		key: selectionKey,
		listener: onStateChange,
		includeChildren: triggerOnChildUpdate
	};

	return getRemoveStateListener(stateListenerId);
};

export const getStateAndListenForChanges = async (selectionKey, onStateChange, triggerOnChildUpdate = false) => {
	const removeStateListener = addStateListener(selectionKey, onStateChange, triggerOnChildUpdate);
	const state = await getState(selectionKey);

	return [state, removeStateListener];
};
