// JSX templating adapted from: https://betterprogramming.pub/how-to-use-jsx-without-react-21d23346e5dc
// Instead of using pragma statements at the top of each file, specify in babel config

import { registerReactiveComponentElement } from '../ui/ReactiveComponent';
import reactiveEventHandlerNames from '../ui/reactiveEventHandlerNames';

const classAttributePropName = 'className';

const getAttributeName = (propName) => {
	switch (propName) {
		case classAttributePropName:
			return 'class';
		default:
			return propName;
	}
};

const customTags = {};

const getElementWithAttributesAndEventHandlers = (tag, props) => {
	if (tag === 'reactive-component' && customTags.hasOwnProperty(tag)) { // TODO: either remove custom tag or get registration working...
		customTags[tag] = registerReactiveComponentElement();
		console.log('registered custom element');
	}

	const element = document.createElement(tag);

	Object.entries(props || {}).forEach(([name, value]) => {
		try {
			const attributeName = getAttributeName(name);

			if (reactiveEventHandlerNames.includes(attributeName))
				element[attributeName] = value; // TODO: verify this allows passing event handlers from JSX component to HTML element
			else if (attributeName.startsWith("on") && attributeName.toLowerCase() in window)
				element.addEventListener(attributeName.toLowerCase().substr(2), value);
			else if (value) // Ignore falsey values, the intended equivalence to no attribute (e.g. disabled="false" is still disabled in the DOM)
				element.setAttribute(attributeName, value.toString());
		}
		catch (error) {
			console.error(`Unable to add attribute '${attributeName}' with value '${value}'`);
		}
	});

	return element;
};

const appendChild = (parent, child) => {
	if (!child)
		return;

	if (Array.isArray(child))
		child.forEach(nestedChild => appendChild(parent, nestedChild));
	else
		parent.appendChild(child.nodeType ? child : document.createTextNode(child));
};

const createElement = (tag, props, ...children) => {
	if (!props)
		props = {};

	if (typeof tag === "function") {
		if (tag.handlesChildrenExplicitly) { // TODO: handle more gracefully than requiring a property to denote children will be handled by JS
			return tag({
				...props,
				children
			});
		}

		return tag(props, ...children);
	}

	const element = getElementWithAttributesAndEventHandlers(tag, props);

	children.forEach(child => {
		appendChild(element, child);
	});

	return element;
};

// To accomodate the JSX empty tag syntax '<>'
const createFragment = (props, ...children) => children;

export default {
	createElement, // TODO: look into how/if an async JSX pragma can be configured, to accomodate async components -- use lifecycle hooks instead
	createFragment
};
