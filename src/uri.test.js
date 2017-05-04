import * as uri from './uri.js';

describe('uri', () => {

	let setSearch = function(val) {
		Object.defineProperty(window.location, 'search', {
			writable: true,
			value: val
		});
	};

	describe('getQuery', () => {
		
		it('parses single level single value: ?foo=bar', () => {
			setSearch("?foo=bar");
			expect(uri.getQuery()).toEqual({"foo":"bar"});
		});

		it('parses single level multiple values: ?foo=bar&boo=far', () => {
			setSearch("?foo=bar&boo=far");
			expect(uri.getQuery()).toEqual({
				foo: "bar",
				boo: "far"
			});
		});

		it('parses multiple level values: ?foo.foofoo=1&foo.foobar=2', () => {
			setSearch("?foo.foofoo=1&foo.foobar=2");
			expect(uri.getQuery()).toEqual({
				foo: {
					foofoo: "1",
					foobar: "2"
				}
			});
		});

		it('parses namespaced values: ?foo.foofoo=1&foo.foobar=2&bar=3', () => {
			setSearch("?foo.foofoo=1&foo.foobar=2&bar=3");
			expect(uri.getQuery('foo')).toEqual({
				foofoo: "1",
				foobar: "2"
			});
		});
	
	});

});