import { v4 as uuidv4 } from 'uuid';

const renderElementAsync = async (elementId, elementAsync, addElementToDom) => {
	const resolvedElement = await elementAsync;
	resolvedElement.id = elementId;

	return await renderElement(resolvedElement, addElementToDom);
};

export const renderElement = async (element, addElementToDom) => {
	const elementId = element.id || uuidv4();

	if (element instanceof Promise)
		return await renderElementAsync(elementId, element, addElementToDom);

	if (!element.id)
		element.id = elementId;

	addElementToDom(element);

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
