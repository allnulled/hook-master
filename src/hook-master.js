/**
 *
 * # HookMaster
 * 
 * ![](https://img.shields.io/badge/hook--master-v1.0.3-green.svg) ![](https://img.shields.io/badge/tests-passing-green.svg) ![](https://img.shields.io/badge/statements--coverage-100%25-green.svg) ![](https://img.shields.io/badge/branches--coverage-100%25-green.svg) ![](https://img.shields.io/badge/functions--coverage-100%25-green.svg) ![](https://img.shields.io/badge/lines--coverage-100%25-green.svg) ![](https://img.shields.io/badge/full--coverage-yes-green.svg)
 * 
 * Create, remove and trigger synchronous or asynchronous events easily. No dependencies. Less than 100 lines.
 *
 * ## Why?
 *
 * Mainly, HookMaster was created to build:
 *
 *  - events that are declared independently one of each other
 *  - events that are sync or asynchronously chainable
 *  - events that can be sorted with custom criterias
 *  - events that accept common parameters
 *  - events that pass one to each other some value
 *  - events that finally return a result
 *
 * ## Install
 *
 * `~$ npm install hook-master`
 *
 * ## Usage
 *
 * ```js
 * const HookMaster = require("hook-master");
 * const hook = HookMaster.create({ // This is the default parameter, so you can skip and use simply HookMaster.create()
 * 	sorter: function(a, b) {
 * 	 return a.HOOK_MASTER_METADATA.order >= b.HOOK_MASTER_METADATA.order ? 1 : -1;
 * 	}
 * });
 * 
 * // Asynchronous event lastly executed by the hook "hello" (because the order is 40):
 * hook.add("hello", function(result, parameters) {
 *   return new Promise(function(resolve, reject) {
 *     return resolve(result + "!");
 *   });
 * }, { order: 40 });
 * 
 * // Synchronous event firstly executed by the hook "hello" (because the order is 20):
 * hook.add("hello", function(result, parameters) {
 *   return result + "Hell";
 * }, { order: 20 });
 * 
 * // Synchronous event executed in the second position by the hook "hello" (because the order is 30):
 * hook.add("hello", function(result, parameters) {
 *   return result + "o World";
 * }, { order: 30 });
 * 
 * // Execution of the event calling `hook.trigger(hook name, initial result, ...parameters)`:
 * hook.trigger("hello", "", []).then((message) => {
 *   expect(message).to.equal("Hello World!");
 * });
 * 
 * // In async/await context, you can simply do:
 * // const message = await hook.trigger("hello", "");
 * 
 * hook.add("bye", function(result, parameters) {
 *   expect(result).to.equal("Hello World!");
 *   return result + " Good bye";
 * });
 * 
 * hook.add("bye", function(result, parameters) {
 *   expect(result).to.equal("Hello World! Good bye");
 *   return result + " World!";
 * });
 * 
 * hook.trigger(["hello", "bye"], "", []).then((message) => {
 *   expect(message).to.equal("Hello World! Good bye World!");
 *   return doneTest();
 * }).catch(console.log);
 * ```
 * 
 * Take a look to the tests to see a full demo of the API.
 * 
 * 
 * ## API Reference
 *
 *
 * ### HookMaster = require("hook-master");
 *
 * @name `HookMaster`
 * @description Master class of the API.
 * @type `class`
 *
 */
class HookMaster {
	/**
	 *
	 * ----
	 *
	 * ### HookMaster.create(...args)
	 *
	 * @name `HookMaster.create`
	 * @description Instantiantes a new `HookMaster` instance.
	 * @type `static method`
	 * @parameter `...args:Any`. Parameters passed to the constructor of the class.
	 * @return `HookMaster:Object`. The new `HookMaster` instance created.
	 *
	 *
	 */
	static create(...args) {
		return new HookMaster(...args);
	}

	/**
	 *
	 * ----
	 *
	 * ### HookMaster.DEFAULT_OPTIONS
	 *
	 * @name `HookMaster.DEFAULT_OPTIONS`
	 * @description Object that has the default options that a new `HookMaster` will take by default.
	 * @type `Object`.
	 * @default_value `{sorter:function(...) {...}}`. The `sorter` function is responsible of sorting the values when a hook name is triggered.
	 *
	 */
	static get DEFAULT_OPTIONS() {
		return {
			sorter: function(a, b) {
				return a.HOOK_MASTER_METADATA.order >= b.HOOK_MASTER_METADATA.order ? 1 : -1;
			}
		};
	}

	/**
	 *
	 * ----
	 *
	 * ### hookMaster = new HookMaster(options = {})
	 *
	 * @name `HookMaster constructor`
	 * @description The constructor method of the `HookMaster` class. This class can hold an entire set of hooks, each of them identified by an exclusive name, and provided with its own set of events.
	 * @type `constructor method`.
	 * @parameter `options:Object`. **Optional**. Options to be passed to the current `HookMaster` instance.
	 * @return `HookMaster`. Returns a new `HookMaster` instance.
	 *
	 *
	 */
	constructor(options = {}) {
		this.hooks = {};
		this.options = Object.assign({}, this.constructor.DEFAULT_OPTIONS, options);
	}

	/**
	 *
	 * ----
	 *
	 * ### hookMaster.initialize(name)
	 *
	 * @name `hookMaster.initialize`
	 * @description Initializes a new hook in the `HookMaster` instance (by a `name`).
	 * @type `instance method`
	 * @parameter `name:String | names:Array<String>`. Name(s) of the new hook to be initialized.
	 * @return `undefined`. Nothing.
	 *
	 */
	initialize(name) {
		if (typeof name === "string" && (!(name in this.hooks))) {
			this.hooks[name] = [];
		} else if(Array.isArray(name)) {
			name.forEach(n => this.initialize(n));
		}
		return this;
	}

	/**
	 *
	 * ----
	 *
	 * ### hookMaster.add(name, event, meta = {})
	 *
	 * @name `hookMaster.add`
	 * @description Adds a new hook (`event`) to the `HookMaster` instance (by a `name`) assigning its own metadata (by `meta`).
	 * @type `instance method`
	 * @parameter `name:String`. Name of the hook into which the event is going to be added.
	 * @parameter `event:Function`. Function that is the event added to the specified hook.
	 * This function:
	 *
	 *   - receives: 2 parameters.
	 *      - `result`: the value passed as `initialResult` by the `trigger` method, or the result returned by the previous event of this hook.
	 *      - `...parameters` (any number of them): the parameters passed through the `trigger` method.
	 *   - must return one of these:
	 *      - `undefined` or nothing: this means that the previous `result` or the `initialResult` is maintained for the next event call.
	 *      - `any` value: this option will alter the result received by the next event of the same hook, or the value returned finally by the `trigger` method (asynchronously, of course).
	 *      - `Promise`: this option will force the `trigger` method to resolve the `Promise` returned by the function, and find out the value that the event is trying to pass to the next event in the chain of events.
	 *
	 * @parameter `meta:Object`. **Optional**.
	 * Metadata object for the current event.
	 * This object is statically added to the event function through its `HOOK_MASTER_METADATA` property.
	 * This data can be useful to remove items by identifiers or other metadata properties, for example.
	 * @return `undefined`. Nothing.
	 *
	 */
	add(name, event, meta = {}) {
		this.initialize(name);
		event.HOOK_MASTER_METADATA = meta;
		this.hooks[name].push(event);
		this.hooks[name].sort(this.options.sorter);
		return this;
	}

	/**
	 *
	 * ----
	 *
	 * ### hookMaster.remove(name, filter = undefined)
	 *
	 * @name `hookMaster.remove`
	 * @description Removes a whole hook or the filtered events of a hook.
	 * @type `instance method`
	 * @parameter `name:String`. Name of the hook to be removed.
	 * @parameter `filter:Function`. **Optional**. Name of the hook.
	 * @return `undefined`. Nothing.
	 *
	 *
	 */
	remove(name, filter = undefined) {
		if (typeof filter === "function") {
			this.hooks[name] = this.hooks[name].filter(filter);
		} else {
			delete this.hooks[name];
		}
		return this;
	}

	/**
	 *
	 * ----
	 *
	 * ### hookMaster.trigger(name, initialResult = undefined, ...parameters)
	 *
	 * @name `hookMaster.trigger`
	 * @description Triggers a specific hook. It can pass parameters (which will be shared by all of the events) and an initial result (which will be altered in each event, unless the event returns `undefined`, or nothing, in which case the result will be maintained).
	 * @type `instance method`
	 * @parameter `name:String|Array<String>`. Name(s) of the hook(s) to be triggered.
	 * @parameter `initialResult:Any`. Result that will be passed through all the events of the hook, allowing a decorator design pattern in every hook.
	 * @parameter `...parameters:Any`. Parameters that all the events of the hook will receive.
	 * @return `result:Promise`. Use the `then` of this `Promise` to access to the final `result` of the chained events of the hook. You can use the `catch` method too, as usual in Promises.
	 *
	 *
	 */
	trigger(nameOrNames, initialResult = undefined, ...parameters) {
		if(typeof nameOrNames === "string") {
			if(!(nameOrNames in this.hooks)) {
				throw new Error("HookNameNotFoundError", "[ERROR] HookMaster#trigger($1, ...) => $1: name of hook <" + nameOrNames + "> was not found in: <" + Object.keys(this.hooks).join("|") + ">");
			}
			const hooks = this.hooks[nameOrNames].sort(this.options.sorter);
			var result = initialResult;
			var index = 0;
			const next = function(resolve, reject) {
				if (!(index in hooks)) {
					return resolve(result);
				}
				const hook = hooks[index++];
				const resultTmp = hook(result, ...parameters);
				if (resultTmp instanceof Promise) {
					resultTmp.then(function(newResult) {
						if (typeof newResult !== "undefined") {
							result = newResult;
						}
						return next(resolve, reject);
					});
				} else {
					if (typeof resultTmp !== "undefined") {
						result = resultTmp;
					}
					return next(resolve, reject);
				}
			};
			return new Promise(next);
		} else if(Array.isArray(nameOrNames)) {
			return nameOrNames.reduce((promiseChain, name) => {
				return promiseChain.then(result => this.trigger(name, result, ...parameters));
			}, Promise.resolve(initialResult));
		} else throw new Error("InvalidArgumentTypeError", "[ERROR] HookMaster#trigger($1, ...) => $1: Only String or Array<String> accepted.")
	}
}

/**
 *
 * ## Tests
 *
 * `~$ npm run test`
 *
 * ## Code coverage
 *
 * `~$ npm run coverage`
 *
 * ## Document
 *
 * `~$ npm run docs`
 *
 * ## Conclusion
 *
 * Simple library to create easily sync/async systems of hooks. It can be useful if you have in mind something pluggable.
 *
 */
module.exports = HookMaster;
