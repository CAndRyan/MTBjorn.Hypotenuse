// TODO: replace class-implementation with custom HTML tags (where should they be registered?) -- https://www.html5rocks.com/en/tutorials/webcomponents/customelements/

const noOpEventHandler = () => Promise.resolve();

const ReactiveComponent = ({
    onBeforeElementRender = noOpEventHandler,
    onAfterElementRender = noOpEventHandler,
    children
}) => (
    <div className="reactive-component" onBeforeElementRender={onBeforeElementRender} onAfterElementRender={onAfterElementRender}>
        {children}
    </div>
);

export default ReactiveComponent;
