# JSON:API rehydrate

JSON:API rehydrate is a small utility for "rehydrating" a json:api payload back in to a hierarchical data structure for use on the frontend.

## Basic usage

 1. Download a copy of the `json-api-rehydrate.js`
 2. Include the library in to your webpage.
 3. Call it on your json:api payload `var data = jsonApiReHydrate.rehydrate( jsonApiPayload );`

Alternately you can;

* Install using NPM `run npm install json-api-rehydrate`

```
	var data = jsonApiReHydrate.rehydrate(data);
```