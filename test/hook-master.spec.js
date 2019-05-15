const HookMaster = require(__dirname + "/../src/hook-master.js");
const { assert, expect } = require("chai");

describe("HookMaster class", function() {
	it("can add, remove and trigger [sync and async] as expected", function(done) {
		this.timeout(15000);
		const results = [];
		const hooks = HookMaster.create();

		hooks.initialize("init");

		hooks.add(
			"init",
			function(result, ...parameters) {
				//console.log("order 11");
				expect(parameters).to.deep.equal(["a", "b"]);
				results.push(2);
				expect(result).to.equal(1);
				return result + 10;
			},
			{ order: 11 }
		);

		hooks.add(
			"init",
			function(result, ...parameters) {
				//console.log("order 10");
				expect(parameters).to.deep.equal(["a", "b"]);
				results.push(1);
				expect(result).to.equal(0);
				return result + 1;
			},
			{ order: 10 }
		);

		hooks.add(
			"init",
			function(result, ...parameters) {
				//console.log("order 12");
				expect(parameters).to.deep.equal(["a", "b"]);
				results.push(3);
				expect(result).to.equal(11);
				return result + 3;
			},
			{ order: 12 }
		);

		hooks.add(
			"init",
			function(result, ...parameters) {
				//console.log("order 13");
				expect(parameters).to.deep.equal(["a", "b"]);
				expect(result).to.equal(14);
				results.push(4);
				return new Promise((resolve, reject) => {
					return resolve(result + 6);
				});
			},
			{ order: 13 }
		);

		hooks
			.trigger("init", 0, "a", "b")
			.then(function(data) {
				//console.log("ok!");
				expect(data).to.equal(20);
				expect(results).to.deep.equal([1, 2, 3, 4]);
				return done();
			})
			.catch(console.log);
	});

	it("makes the example of the docs work as expected!", function(done) {
		this.timeout(15000);
		const hook = HookMaster.create();
		hook.add(
			"hello",
			function(result, ...parameters) {
				return result + "!";
			},
			{ order: 40 }
		);
		hook.add(
			"hello",
			function(result = "", ...parameters) {
				return result + "Hell";
			},
			{ order: 20 }
		);
		hook.add(
			"hello",
			function(result, ...parameters) {
				return result + "o World";
			},
			{ order: 30 }
		);
		hook
			.trigger("hello", "")
			.then((message) => {
				expect(message).to.equal("Hello World!");
				hook.remove("hello", function(hook) {
					if (hook.HOOK_MASTER_METADATA.order === 40) {
						return false;
					} else {
						return true;
					}
				});
				hook.add("hello", function(result, ...parameters) {
					return result + "?";
				});
				hook.add("hello", function() {});
				hook.add("hello", function() {
					return new Promise(function(resolve, reject) {
						return resolve();
					});
				});
				hook
					.trigger("hello")
					.then((message) => {
						expect(message).to.equal("Hello World?");
						expect(Array.isArray(hook.hooks.hello)).to.equal(true);
						hook.remove("hello");
						expect(Array.isArray(hook.hooks.hello)).to.equal(false);
						return done();
					})
					.catch(console.log);
			})
			.catch(console.log);
	});

	it("can reproduce the example of the README", function(doneTest) {
		this.timeout(4000);

		const hook = HookMaster.create();

		// Asynchronous event lastly executed by the hook "hello" (because the order is 40):
		hook.add(
			"hello",
			function(result, parameters) {
				return new Promise(function(resolve, reject) {
					return resolve(result + "!");
				});
			},
			{ order: 40 }
		);

		// Synchronous event firstly executed by the hook "hello" (because the order is 20):
		hook.add(
			"hello",
			function(result, parameters) {
				return result + "Hell";
			},
			{ order: 20 }
		);

		// Synchronous event executed in the second position by the hook "hello" (because the order is 30):
		hook.add(
			"hello",
			function(result, parameters) {
				return result + "o World";
			},
			{ order: 30 }
		);

		// Execution of the event calling `hook.trigger(hook name, initial result, ...parameters)`:
		hook.trigger("hello", "", []).then((message) => {
			expect(message).to.equal("Hello World!");
		});

		// In async/await context, you can simply do:
		// const message = await hook.trigger("hello", "");

		hook.add("bye", function(result, parameters) {
			expect(result).to.equal("Hello World!");
			return result + " Good bye";
		});

		hook.add("bye", function(result, parameters) {
			expect(result).to.equal("Hello World! Good bye");
			return result + " World!";
		});

		hook
			.trigger(["hello", "bye"], "", [])
			.then((message) => {
				expect(message).to.equal("Hello World! Good bye World!");
				return doneTest();
			})
			.catch(console.log);
	});

	it("fails if you provide bad parameters to trigger", function() {
		expect(function() {
			HookMaster.create().trigger(null);
		}).to.throw("InvalidArgumentTypeError");
	});

	it("fails if you provide a name of not existing trigger", function(doneTest) {
		try {
			HookMaster.create().trigger("gogogo!", "Message");
		} catch (error) {
			expect(error.name).to.equal("Error");
			expect(error.message).to.equal("HookNameNotFoundError");
			return doneTest();
		}
	});
});
