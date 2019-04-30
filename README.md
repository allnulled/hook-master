 


# HookMaster

![](https://img.shields.io/badge/hook--master-v1.0.0-green.svg) ![](https://img.shields.io/badge/tests-passing-green.svg) ![](https://img.shields.io/badge/statements--coverage-100%25-green.svg) ![](https://img.shields.io/badge/branches--coverage-100%25-green.svg) ![](https://img.shields.io/badge/functions--coverage-100%25-green.svg) ![](https://img.shields.io/badge/lines--coverage-100%25-green.svg) ![](https://img.shields.io/badge/full--coverage-yes-green.svg)

Create, remove and trigger synchronous or asynchronous events easily.

## Why?

Mainly, HookMaster was created to build:

- events that are declared independently one of each other
- events that are sync or asynchronously chainable
- events that can be sorted with custom criterias
- events that accept common parameters
- events that pass one to each other some value
- events that finally return a result

## Install

`~$ npm install hook-master`

## Usage

```js
const HookMaster = require("hook-master");

const hook = HookMaster.create({
 sorter: HookMaster.DEFAULT_OPTIONS.sorter
}); // this 'options' parameter is redundant, but explicative

// Asynchronous event lastly executed by the hook "hello" (because the order is 40):
hook.add("hello", function(parameters, result) {
 return new Promise(function(resolve, reject) {
   return resolve(result + "!");
 });
}, {order: 40});

// Synchronous event firstly executed by the hook "hello" (because the order is 20):
hook.add("hello", function(parameters, result) {
 return result + "Hell";
}, {order: 20});

// Synchronous event executed in the second position by the hook "hello" (because the order is 30):
hook.add("hello", function(parameters, result) {
 return result + "o World";
}, {order: 30});

// Execution of the event calling `hook.trigger(hook name, initial result, ...parameters)`:
hook.trigger("hello", "", []).then(message => {
 expect(message).to.equal("Hello World!");
});

// In async/await context, you can simply do:
// const message = await hook.trigger("hello", "");

```

Take a look to the tests to see a full demo of the API.


## API Reference


### HookMaster = require("hook-master");


**Name:** `HookMaster`

**Description:** Master class of the API.

**Type:** `class`




 


----

### HookMaster.create(...args)


**Name:** `HookMaster.create`

**Description:** Instantiantes a new `HookMaster` instance.

**Type:** `static method`

**Parameter:** `...args:Any`. Parameters passed to the constructor of the class.

**Return:** `HookMaster:Object`. The new `HookMaster` instance created.





 


----

### HookMaster.DEFAULT_OPTIONS


**Name:** `HookMaster.DEFAULT_OPTIONS`

**Description:** Object that has the default options that a new `HookMaster` will take by default.

**Type:** `Object`.

**Default value:** `{sorter:function(...) {...}}`. The `sorter` function is responsible of sorting the values when a hook name is triggered.




 


----

### hookMaster = new HookMaster(options = {})


**Name:** `HookMaster constructor`

**Description:** The constructor method of the `HookMaster` class. This class can hold an entire set of hooks, each of them identified by an exclusive name, and provided with its own set of events.

**Type:** `constructor method`.

**Parameter:** `options:Object`. **Optional**. Options to be passed to the current `HookMaster` instance.

**Return:** `HookMaster`. Returns a new `HookMaster` instance.





 


----

### hookMaster.add(name, event, meta = {})


**Name:** `hookMaster.add`

**Description:** Adds a new hook (`event`) to the `HookMaster` instance (by a `name`) assigning its own metadata (by `meta`).

**Type:** `instance method`

**Parameter:** `name:String`. Name of the hook into which the events is going to be added.

**Parameter:** `event:Function`. Function that is the event added to the specified hook.
This function:

 - receives: 2 parameters.
    - `result`: the value passed as `initialResult` by the `trigger` method, or the result returned by the previous event of this hook.
    - `...parameters` (any number of them): the parameters passed through the `trigger` method.
 - must return one of these:
    - `undefined` or nothing: this means that the previous `result` or the `initialResult` is maintained for the next event call.
    - `any` value: this option will alter the result received by the next event of the same hook, or the value returned finally by the `trigger` method (asynchronously, of course).
    - `Promise`: this option will force the `trigger` method to resolve the `Promise` returned by the function, and find out the value that the event is trying to pass to the next event in the chain of events.


**Parameter:** `meta:Object`. **Optional**.
Metadata object for the current event.
This object is statically added to the event function through its `__hook_metadata__` property.
This data can be useful to remove items by identifiers or other metadata properties, for example.

**Return:** `undefined`. Nothing.




 


----

### hookMaster.remove(name, filter = undefined)


**Name:** `hookMaster.remove`

**Description:** Removes a whole hook or the filtered events of a hook.

**Type:** `instance method`

**Parameter:** `name:String`. Name of the hook to be removed.

**Parameter:** `filter:Function`. **Optional**. Name of the hook.

**Return:** `undefined`. Nothing.





 


----

### hookMaster.trigger(name, initialResult = undefined, ...parameters)


**Name:** `hookMaster.trigger`

**Description:** Triggers a specific hook. It can pass parameters (which will be shared by all of the events) and an initial result (which will be altered in each event, unless the event returns `undefined`, or nothing, in which case the result will be maintained).

**Type:** `instance method`

**Parameter:** `name:String`. Name of the hook to be triggered.

**Parameter:** `initialResult:Any`. Result that will be passed through all the events of the hook, allowing a decorator design pattern in every hook.

**Parameter:** `...parameters:Any`. Parameters that all the events of the hook will receive.

**Return:** `result:Promise`. Use the `then` of this `Promise` to access to the final `result` of the chained events of the hook. You can use the `catch` method too, as usual in Promises.





 


## Tests

`~$ npm run test`

## Code coverage

`~$ npm run coverage`

## Document

`~$ npm run docs`

## Conclusion

Simple library to create easily sync/async systems of hooks. It can be useful if you have in mind something pluggable.




