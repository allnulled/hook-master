# Changelog

This file is just to register the changes of each version.

#### 1.0.3 (2019/06/02)

**Feature:** hook parameters injection from trigger method

One can inject parameters from:

```js
hookMaster.trigger(names, initialResult, ...parameters)
```

And then, receive them in the hook like:

```js
hookMaster.add("hookname", (result, ...parameters) => {});
```

**Feature:** multiple initializations in one call

From this version one can initialize multiple hooks at once like:

```js
hookMaster.initialize(["hook1", "hook2", "hook3"]).trigger(["hook1", "hook2", "hook3"]);
```