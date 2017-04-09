# JSON:API rehydrate

JSON:API rehydrate is a small utility for "rehydrating" a [json:api](http://jsonapi.org/) response back in to a hierarchical data structure for easier use on the frontend.

## Installation

 1. Download a copy of the `json-api-rehydrate.js`
 2. Include the library in to your webpage.
 3. Call it on your json:api payload `var data = jsonApiReHydrate.rehydrate( jsonApiPayload );`

Alternately you can;

* Install using NPM `run npm install json-api-rehydrate`

## Basic usage

By default the `jsonApiReHydrate` will be added to the window object making it globally available. (unless loaded via AMD or otherwise).

To hydrate a response with the utility simply call its `rehydrate` method with the json:api response you would like to hydrate.

```
	// response = myApi.fetch("some-json-api-endpoint");
	var data = jsonApiReHydrate.rehydrate(response);
	console.log(data);
```