# Hypotenuse

A suite of tools to manage component rendering, data storage, & various utility functions.
Uses select principles from React & Redux as a lightweight replacement framework.

## Getting Started

This library is separated into 3 categories: ui rendering, data storage, & utility functions.

### UI Rendering

Data rendering uses an element's ID, or an auto-generated ID if not specified, to locate elements within the DOM. It operates with a pseduo-asynchronous nature; i.e. while rendering is synchronous, a `Promise` can be provided as the element to render. Each render method returns a reference to the resultant DOM node so an application has full control over managing it's elements & their interactions.

* Render an element by appending to an existing element

    ````javascript
    import { renderElementAsAppend } from '@mtbjorn.hypotenuse/dist/ui';
    const element = document.createElement('div');
    const domReference = await renderElementAsAppend(element, 'parent-element-id');
    ````

* Render an element by specifying exactly how

    ````javascript
    import { renderElement } from '@mtbjorn.hypotenuse/dist/ui';
    import { SomeComponent } from 'component-library';
    const addElementLikeSo = (element) => {
        document.getElementById('some-parent').prepend(element);
    };
    const domReference = await renderElement(<SomeComponent />, addElementLikeSo);
    ````

* Render an element as a replacement for an existing element

    ````javascript
    import { replaceElement } from '@mtbjorn.hypotenuse/dist/ui';
    import { SomeComponent } from 'component-library';
    const existingElement = await renderElementAsAppend(document.createElement('div'), 'parent-id');
    const getComponentAsync = async () => {
        await doAsyncWork();
        return <SomeComponent />;
    }
    const domReference = await replaceElement(existingElement, getComponentAsync());
    ````

### Data Storage

The data store is just a global object partitioned into two segments, one for runtime data & another for data to be persisted in a browser's `localStorage`. State can be placed or retrieved by way of keys which represent a path of properties to follow in the global state, separated by periods. e.g. `local.foo.bar` corresponds to the data `{ baz: 1 }` for `globalState = { local: { foo: { bar: { baz: 1 } } } }`. State listeners can be attached by providing a key to watch along with a function to execute when data at the specified key is modified.

1. Initialize the data store before using within an application. Initial state can be provided as either runtime-only, via the first parameter, or persistant (to local storage) via the second parameter

    ````javascript
    import { initializeDataStore } from '@mtbjorn.hypotenuse/dist/data';
    initializeDataStore();
    ````

    * NOTE: any data within the `local` segment (i.e. `globalState.local`) will automatically persist to `localStorage`. If local state is provided at initialization, the data is merged with whatever currently resides in `localStorage`
1. Set & retrieve state

    ````javascript
    import { setState, getState } from '@mtbjorn.hypotenuse/dist/data';
    // globalState == { local: {} }
    setState('app.options', { enabled: true });
    const globalState = getState(); // { local: {}, { app: { options: { enabled: true } } } }
    const options = getState('app.options'); // { enabled: true }
    ````

1. Add state listener for if a node in the global state, or one of it's parents, is updated

    ````javascript
    import { addStateListener } from '@mtbjorn.hypotenuse/dist/data';
    const onStateChange = () => {
        console.log('triggered');
    };
    const removeStateListenerFunc = addStateListener('app.options', onStateChange);
    setState('app.options', { enabled: true });         // console: 'triggered'
    setState('app', { options: { enabled: true } });    // console: 'triggered'
    ````

1. Add state listener for if a node in the global state, one of it's parents, or one of it's children, is updated

    ````javascript
    import { addStateListener } from '@mtbjorn.hypotenuse/dist/data';
    const onStateChange = () => {
        console.log('triggered');
    };
    const removeStateListenerFunc = addStateListener('app.options', onStateChange, true);
    setState('app.options', { enabled: true });         // console: 'triggered'
    setState('app', { options: { enabled: true } });    // console: 'triggered'
    setState('app.options.enabled', true);              // console: 'triggered'
    ````

### Utility Functions

* Resize an image file (down) to a desired file size, within a specified tolerance

     ````javascript
    import { resizeImage } from '@mtbjorn.hypotenuse/dist/utility';
    const targetFileSizeKb = 1000;
    const maxDeviationKb = 50;
    const handleFileListUpload = async ({ target }) => {
        [...target.files].forEach((originalFile) => {
            const resizedImage = await resizeImage(originalFile, targetFileSizeKb, maxDeviationKb);
            console.log(resizedImage.size <= targetFileSizeKb);                     // true
            console.log(resizedImage.size >= targetFileSizeKb - maxDeviationKb);    // true
        });
    };
    document.getElementById('file-upload-element').addEventListener('onChange', handleFileListUpload);
    ````
