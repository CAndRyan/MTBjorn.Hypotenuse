// TODO: replace class-implementation with custom HTML tags (where should they be registered?) -- https://www.html5rocks.com/en/tutorials/webcomponents/customelements/

const noOpEventHandler = () => Promise.resolve();

const ReactiveComponent = ({
    onBeforeElementRender = noOpEventHandler,
    onAfterElementRender = noOpEventHandler,
    children
}) => (
    <reactive-component className="reactive-component" onBeforeElementRender={onBeforeElementRender} onAfterElementRender={onAfterElementRender}>
        {children}
    </reactive-component>
);
ReactiveComponent.handlesChildrenExplicitly = true; // TODO: handle more gracefully than requiring a property to denote children will be handled by JS

const registerReactiveComponentElement = () => {
    var reactiveComponentElement = document.registerElement('reactive-component', {
        prototype: Object.create(HTMLDivElement.prototype, {
            onBeforeElementRender: noOpEventHandler,
            onAfterElementRender: noOpEventHandler
        }),
        extends: 'div'
    });
    return reactiveComponentElement;
};

export {
    ReactiveComponent,
    registerReactiveComponentElement
};
