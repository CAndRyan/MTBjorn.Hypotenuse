import { v4 as uuidv4 } from 'uuid';
import reactiveEventHandlerNames from './reactiveEventHandlerNames';

const renderElementAsync = async (elementId, elementAsync, addElementToDom) => {
	const resolvedElement = await elementAsync;
	resolvedElement.id = elementId;

	return await renderElement(resolvedElement, addElementToDom);
};

const noOpEventHandler = () => Promise.resolve();

const getEventHandlersFromElement = (element) => reactiveEventHandlerNames.reduce((aggregate, eventHandlerName) => ({
	...aggregate,
	[eventHandlerName]: element.hasOwnProperty(eventHandlerName) ? element[eventHandlerName] : noOpEventHandler
}), {});

// NOTE: if this element comes from a JSX fragment's children, it will actually be an array of elements...
// TODO: add support for this use case, where a component defined as a JSX fragment is converted into an array of elements
const getReactiveEventHandlersFromChildren = (element) => {
	const reactiveElements = [...element.getElementsByClassName('reactive-component')];
	if (element.classList.contains('reactive-component'))
		reactiveElements.unshift(element);

	// // TODO: ensure unresolved components pass their event handlers along
	// if (element.hasOwnProperty('onBeforeElementRender'))
	// 	await element.onBeforeElementRender(element); // TODO: accomodate both async & non?

	return reactiveElements.map(getEventHandlersFromElement);
};

export const renderElement = async (element, addElementToDom) => {
	const elementId = element.id || uuidv4();

	if (element instanceof Promise)
		return await renderElementAsync(elementId, element, addElementToDom);

	if (!element.id)
		element.id = elementId;

	const elementEventHandlers = getReactiveEventHandlersFromChildren(element);
	const beforeRenderTasks = elementEventHandlers.map(({ onBeforeElementRender }) => onBeforeElementRender(element)); // TODO: consider if the event handlers should accept the child element, or continue using only the parent actually being rendered -- while easy to do pre-render, there isn't currently a reference to children in the DOM...
	await Promise.all(beforeRenderTasks);

	addElementToDom(element);

	const afterRenderTasks = elementEventHandlers.map(({ onAfterElementRender }) => onAfterElementRender(element));
	await Promise.all(afterRenderTasks);

	return document.getElementById(element.id);
};

export const renderElementAsAppend = async (element, parentElementId) => await renderElement(element, (el) => document.getElementById(parentElementId).append(el));

const replaceElementAsync = async (existingElement, replacement) => {
	const resolvedElement = await replacement;

	return await replaceElement(existingElement, resolvedElement);
};

export const replaceElement = async (existingElement, replacement) => {
	if (replacement instanceof Promise)
		return await replaceElementAsync(existingElement, replacement);

	replacement.id = existingElement.id;

	return renderElement(replacement, (el) => existingElement.replaceWith(el));
};
