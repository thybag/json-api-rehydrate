# JSON:API rehydrate

JSON:API rehydrate is a small, fast, dependencyless utility for "rehydrating" (or deserializing) [json:api](http://jsonapi.org/) responses back in to hierarchical data structures for easier use on the front-end.

## Installation

 1. Download a copy of the `json-api-rehydrate.js`
 2. Include the library in to your webpage.
 3. Call it on your json:api payload `var data = jsonApiReHydrate.rehydrate( jsonApiPayload );`

Alternately you can;

* Install using NPM run `npm install json-api-rehydrate`
* Install using Bower run `bower install json-api-rehydrate`

## Basic usage

By default the `jsonApiReHydrate` will be added to the window object making it globally available. (Unless loaded via AMD or otherwise).

To rehydrate a response with the utility simply call its `rehydrate` method with the json:api response you would like to hydrate.

```
// response = myApi.fetch("some-json-api-endpoint");
var data = jsonApiReHydrate.rehydrate(response);
console.log(data);
```

## Example

The json:api response below

```
{
	"data": {
		"type": "people",
		"id": "1",
		"attributes": {
			"name": "Dave"
		},
		"relationships": {
			"published": {
				"data": [
					{
						"type": "books",
						"id": "1"
					},
					{
						"type": "books",
						"id": "2"
					}
				]
			}
		}
	},
	"included": [
		{
			"type": "books",
			"id": "1",
			"attributes": {
				"title": "Foo",
				"year": 1991
			}
		},
		{
			"type": "books",
			"id": "2",
			"attributes": {
				"title": "Bar",
				"year": 2015
			}
		}
	]
}
```
Will produce the following output 

```
{
	"name": "Dave",
	"id": "1",
	"published": [
		{
			"title": "Foo",
			"year": 1991,
			"id": "1"
		},
		{
			"title": "Bar",
			"year": 2015,
			"id": "2"
		}
	]
}
```
## Additional features

A number of additional functions are available on each of the objects & arrays return by the json-api-rehydrator, in order to provide
easy access to the data in its original form.

* Rehydrated objects provide `getOriginal()`, `getId()`,  `getType()`, `getMeta()`, `getLinks()`, `getRelationships()` and `getAttributes()`.
* Rehydrated arrays provide `getOriginal()`, `getMeta()` and `getLinks()`