# Hypotenuse

A suite of tools to manage JSX conversion, component rendering, data storage, & various utility functions.
Uses select principles from React & Redux as a lightweight replacement framework.

## Getting Started

This library is separated into 4 categories: JSX conversion, ui rendering, data storage, & utility functions.

### JSX Conversion

JSX conversion is a lightweight replacement for React's own creation of HTML elements from JSX syntax ([adapted from here](https://betterprogramming.pub/how-to-use-jsx-without-react-21d23346e5dc)). This library supports most JSX features supported by React but also provides custom functionality, such as event handlers: `onBeforeElementRender` and `onAfterElementRender`. NOTE: this custom functionality is similar to React's lifecycle methods. To swap out React's JSX converter which Babel uses by default, a pragma & import statement can be added to each file containing JSX. Otherwise, the pragma statement can be defined globally via configuration on the preset: `@babel/preset-react`. The plugin, `babel-plugin-jsx-pragmatic`, can also be used to avoid explicitly importing Hypotenuse's build library in each JSX file.

1. Add an alias for webpack to resolve

    ````javascript
    resolve: {
        alias: {
            hypotenuse: path.resolve(__dirname, 'node_modules/@mtbjorn/hypotenuse/dist/')
        }
    }
    ````

    * While not stricly necessary, this step allows you to avoid explicitly importing the template converter within each JSX file or specifying as a file pragma by using the plugin: `babel-plugin-jsx-pragmatic`
1. Install `babel-plugin-jsx-pragmatic` and `@babel/preset-react`

    ````powershell
    npm install babel-plugin-jsx-pragmatic @babel/preset-react --save-dev
    ````

1. Configure Babel

    ````javascript
    {
        "presets": [
            "@babel/preset-env",
            [
                "@babel/preset-react",
                {
                    "pragma": "build.createElement",
                    "pragmaFrag": "build.createFragment"
                }
            ]
        ],
            "plugins": [
                "@babel/plugin-transform-runtime",
                [
                    "babel-plugin-jsx-pragmatic", {
                        "module": "src/build",	// Import alias defined in Webpack
                        "import": "build"		// NOTE: this plugin works with ES6 default exports
                    }
                ]
            ]
    }
    ````

### UI Rendering

Data rendering uses an element's ID, or an auto-generated ID if not specified, to locate elements within the DOM. It operates with a pseduo-asynchronous nature; i.e. while rendering is synchronous, a `Promise` can be provided as the element to render. Each render method returns a reference to the resultant DOM node so an application has full control over managing it's elements & their interactions.

* Render an element by appending to an existing element

    ````javascript
    import { renderElementAsAppend } from '@mtbjorn.hypotenuse/ui';
    const element = document.createElement('div');
    const domReference = await renderElementAsAppend(element, 'parent-element-id');
    ````

* Render an element by specifying exactly how

    ````javascript
    import { renderElement } from '@mtbjorn.hypotenuse/ui';
    import { SomeComponent } from 'component-library';
    const addElementLikeSo = (element) => {
        document.getElementById('some-parent').prepend(element);
    };
    const domReference = await renderElement(<SomeComponent />, addElementLikeSo);
    ````

* Render an element as a replacement for an existing element

    ````javascript
    import { replaceElement } from '@mtbjorn.hypotenuse/ui';
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
    import { initializeDataStore } from '@mtbjorn.hypotenuse/data';
    initializeDataStore();
    ````

    * NOTE: any data within the `local` segment (i.e. `globalState.local`) will automatically persist to `localStorage`. If local state is provided at initialization, the data is merged with whatever currently resides in `localStorage`
1. Set & retrieve state

    ````javascript
    import { setState, getState } from '@mtbjorn.hypotenuse/data';
    // globalState == { local: {} }
    setState('app.options', { enabled: true });
    const globalState = getState(); // { local: {}, { app: { options: { enabled: true } } } }
    const options = getState('app.options'); // { enabled: true }
    ````

1. Add state listener for if a node in the global state, or one of it's parents, is updated

    ````javascript
    import { addStateListener } from '@mtbjorn.hypotenuse/data';
    const onStateChange = () => {
        console.log('triggered');
    };
    const removeStateListenerFunc = addStateListener('app.options', onStateChange);
    setState('app.options', { enabled: true });         // console: 'triggered'
    setState('app', { options: { enabled: true } });    // console: 'triggered'
    ````

1. Add state listener for if a node in the global state, one of it's parents, or one of it's children, is updated

    ````javascript
    import { addStateListener } from '@mtbjorn.hypotenuse/data';
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
    import { resizeImage } from '@mtbjorn.hypotenuse/utility';
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
