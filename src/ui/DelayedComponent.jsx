import { v4 as uuidv4 } from 'uuid';
import ReactiveComponent from './ReactiveComponent';
import { replaceElement } from './renderer';

const renderChildren = async (children, placeholderId) => {
    const placeholderElement = document.getElementById(placeholderId);
    await replaceElement(placeholderElement, children);
};

const getAfterRenderEventHandlerWithDeferredExecution = (generateChildren, placeholderId) => async () => {
    const children = await generateChildren();
    await renderChildren(children, placeholderId);
};

const getAfterRenderEventHandlerWithImmediateExecution = (generateChildren, placeholderId) => {
    const generateChildrenTask = generateChildren();

    return async () => {
        const children = await generateChildrenTask;
        await renderChildren(children, placeholderId);
    };
};

// TODO: add loading state option; perhaps show/hide as part of the before/after render event handlers?
const DelayedComponent = ({ generateChildren, waitUntilAfterParentIsRendered = false }) => {
    const placeholderId = uuidv4();
    console.log(placeholderId);
    const onAfterElementRender = waitUntilAfterParentIsRendered ?
        getAfterRenderEventHandlerWithDeferredExecution(generateChildren, placeholderId) :
        getAfterRenderEventHandlerWithImmediateExecution(generateChildren, placeholderId);
    const children = <div id={placeholderId}></div>; // TODO: update JSX converter so elements nested in a component's JSX are passed as the children props
    
    return (
        <ReactiveComponent onAfterElementRender={onAfterElementRender} children={children} />
    );
};

export default DelayedComponent;
