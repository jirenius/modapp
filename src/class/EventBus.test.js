import EventBus from './EventBus.js';

describe('EventBus', () => {
	let eventBus;
	let objA, objB;

	beforeEach(() => {
		jest.useFakeTimers();
		eventBus = new EventBus();
		objA = {};
		objB = {};
	});

	describe('on', () => {

		it('calls handler on simple object event', () => {
			let callback = jest.fn();
			eventBus.on(objA, 'foo', callback);
			eventBus.emit(objA, 'foo', "Foo");

			expect(callback).not.toBeCalled();

			jest.runAllTimers();

			expect(callback).toBeCalled();
			expect(setTimeout.mock.calls.length).toBe(1);
			expect(callback.mock.calls.length).toBe(1);

			expect(callback.mock.calls[0][0]).toBe("Foo");
			expect(callback.mock.calls[0][1]).toBe(objA);
			expect(callback.mock.calls[0][2]).toBe('foo');
			expect(callback.mock.calls[0][3]).toBe(null);
		});

		it('calls handler on namespaced object event', () => {
			let callback = jest.fn();
			eventBus.on(objA, 'bar', callback, 'foo');
			eventBus.emit(objA, 'bar', "Bar", 'foo');

			jest.runAllTimers();

			expect(callback).toBeCalled();
			expect(callback.mock.calls.length).toBe(1);

			expect(callback.mock.calls[0][0]).toBe("Bar");
			expect(callback.mock.calls[0][1]).toBe(objA);
			expect(callback.mock.calls[0][2]).toBe('foo.bar');
			expect(callback.mock.calls[0][3]).toBe(null);
		});

		it('calls handler on "foo.bar" object event when listening to "foo"', () => {
			let callback = jest.fn();
			eventBus.on(objA, 'foo', callback);
			eventBus.emit(objA, 'foo.bar', "Bar");

			jest.runAllTimers();

			expect(callback).toBeCalled();
			expect(callback.mock.calls.length).toBe(1);

			expect(callback.mock.calls[0][0]).toBe("Bar");
			expect(callback.mock.calls[0][1]).toBe(objA);
			expect(callback.mock.calls[0][2]).toBe('foo.bar');
			expect(callback.mock.calls[0][3]).toBe('bar');
		});

		it('calls handler on simple non-object event', () => {
			let callback = jest.fn();
			eventBus.on('foo', callback);
			eventBus.emit('foo', "Foo");

			expect(callback).not.toBeCalled();

			jest.runAllTimers();

			expect(callback).toBeCalled();
			expect(setTimeout.mock.calls.length).toBe(1);
			expect(callback.mock.calls.length).toBe(1);

			expect(callback.mock.calls[0][0]).toBe("Foo");
			expect(callback.mock.calls[0][1]).toBe(null);
			expect(callback.mock.calls[0][2]).toBe('foo');
			expect(callback.mock.calls[0][3]).toBe(null);
		});

		it('subscribes to all objects when target is not provided', () => {
			let callback = jest.fn();
			eventBus.on('bar', callback, 'foo');
			eventBus.emit(objA, 'bar', "ABar", 'foo');
			eventBus.emit(objB, 'bar', "BBar", 'foo');

			jest.runAllTimers();

			expect(callback).toBeCalled();
			expect(callback.mock.calls.length).toBe(2);

			expect(callback.mock.calls[0][0]).toBe("ABar");
			expect(callback.mock.calls[0][1]).toBe(objA);
			expect(callback.mock.calls[0][2]).toBe('foo.bar');
			expect(callback.mock.calls[0][3]).toBe(null);

			expect(callback.mock.calls[1][0]).toBe("BBar");
			expect(callback.mock.calls[1][1]).toBe(objB);
			expect(callback.mock.calls[1][2]).toBe('foo.bar');
			expect(callback.mock.calls[1][3]).toBe(null);
		});

		it('subscribes to all object events when event is null', () => {
			let callback = jest.fn();
			eventBus.on(objA, null, callback);
			eventBus.emit(objA, 'foo.bar', "Bar");
			eventBus.emit(objB, 'foo', "Foo");

			jest.runAllTimers();

			expect(callback).toBeCalled();
			expect(callback.mock.calls.length).toBe(1);

			expect(callback.mock.calls[0][0]).toBe("Bar");
			expect(callback.mock.calls[0][1]).toBe(objA);
			expect(callback.mock.calls[0][2]).toBe('foo.bar');
			expect(callback.mock.calls[0][3]).toBe('foo.bar');
		});

		it('subscribes to all events when target is not provided, and event is null', () => {
			let callback = jest.fn();
			eventBus.on(null, callback);
			eventBus.emit(objA, 'foo.bar', "Bar");
			eventBus.emit(objB, 'foo', "Foo");

			jest.runAllTimers();

			expect(callback).toBeCalled();
			expect(callback.mock.calls.length).toBe(2);

			expect(callback.mock.calls[0][0]).toBe("Bar");
			expect(callback.mock.calls[0][1]).toBe(objA);
			expect(callback.mock.calls[0][2]).toBe('foo.bar');
			expect(callback.mock.calls[0][3]).toBe('foo.bar');

			expect(callback.mock.calls[1][0]).toBe("Foo");
			expect(callback.mock.calls[1][1]).toBe(objB);
			expect(callback.mock.calls[1][2]).toBe('foo');
			expect(callback.mock.calls[1][3]).toBe('foo');
		});

	});

	describe('off', () => {

		it('does not call handler on removed object event', () => {
			let callback = jest.fn();
			eventBus.on(objA, 'foo', callback);
			eventBus.off(objA, 'foo', callback);
			eventBus.emit(objA, 'foo', "Foo");

			jest.runAllTimers();
			expect(callback).not.toBeCalled();
		});

		it('does not call handler on removed object event when target is not provided', () => {
			let callback = jest.fn();
			eventBus.on('foo', callback);
			eventBus.off('foo', callback);
			eventBus.emit(objA, 'foo', "Foo");

			jest.runAllTimers();
			expect(callback).not.toBeCalled();
		});

		it('does not call handler on removed object event when event is null', () => {
			let callback = jest.fn();
			eventBus.on(objA, null, callback);
			eventBus.off(objA, null, callback);
			eventBus.emit(objA, 'foo', "Foo");

			jest.runAllTimers();
			expect(callback).not.toBeCalled();
		});

		it('does not call handler on removed object event when target is not provided, and event is null', () => {
			let callback = jest.fn();
			eventBus.on(null, callback);
			eventBus.off(null, callback);
			eventBus.emit(objA, 'foo', "Foo");
			eventBus.emit(objB, 'bar', "Bar");
			eventBus.emit('baz', "Baz");

			jest.runAllTimers();
			expect(callback).not.toBeCalled();
		});

		it('calls multiple handlers on namespaced object event', () => {
			let callback1 = jest.fn();
			let callback2 = jest.fn();
			eventBus.on(objA, 'bar', callback1, 'foo');
			eventBus.on(objA, 'bar', callback2, 'foo');
			eventBus.emit(objA, 'bar', "Bar", 'foo');

			jest.runAllTimers();

			expect(callback1).toBeCalled();
			expect(callback1.mock.calls.length).toBe(1);

			expect(callback1.mock.calls[0][0]).toBe("Bar");
			expect(callback1.mock.calls[0][1]).toBe(objA);
			expect(callback1.mock.calls[0][2]).toBe('foo.bar');
			expect(callback1.mock.calls[0][3]).toBe(null);

			expect(callback2).toBeCalled();
			expect(callback2.mock.calls.length).toBe(1);

			expect(callback2.mock.calls[0][0]).toBe("Bar");
			expect(callback2.mock.calls[0][1]).toBe(objA);
			expect(callback2.mock.calls[0][2]).toBe('foo.bar');
			expect(callback2.mock.calls[0][3]).toBe(null);
		});

	});

	describe('emit', () => {

		it('calls handlers triggered during other handler sequentially', () => {
			let secondCallback = jest.fn();
			let callback = jest.fn(() => {
				eventBus.emit(objA, 'bar', "Bar");
				expect(secondCallback).not.toBeCalled();
			});

			eventBus.on(objA, 'foo', callback);
			eventBus.on(objA, 'bar', secondCallback);
			eventBus.emit(objA, 'foo', "Foo");

			jest.runAllTimers();

			expect(callback).toBeCalled();
			expect(callback.mock.calls.length).toBe(1);
			expect(secondCallback).toBeCalled();
			expect(secondCallback.mock.calls.length).toBe(1);

			expect(callback.mock.calls[0][0]).toBe("Foo");
			expect(callback.mock.calls[0][1]).toBe(objA);
			expect(callback.mock.calls[0][2]).toBe('foo');
			expect(callback.mock.calls[0][3]).toBe(null);

			expect(secondCallback.mock.calls[0][0]).toBe("Bar");
			expect(secondCallback.mock.calls[0][1]).toBe(objA);
			expect(secondCallback.mock.calls[0][2]).toBe('bar');
			expect(secondCallback.mock.calls[0][3]).toBe(null);
		});

	});

});
