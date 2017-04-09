/**
 * JSON:API Rehydrate
 *
 * @author Carl
 * @version 0.1.1
 *
 * var hydratedData = jsonApiReHydrate.rehydrate( json_api_payload );
 * console.log(hydratedData.relation.attribute);
 */
(function(){
	"use strict";

	/**
	 * json:api Re-hydrater
	 * This is responsible for all the heavy lifting involved in rehydrating a json:api response
	 */ 
	var jsonReHydrater = function(){
		// Store relations for quick lookup
		this.relationMap = {}; 
		// Keep tract of hydrated items for reuse
		this.hydratedItemMap = {};

		/**
		 * Attempt to rehydrate this item, flatten json:api structure a little
		 * and reattach all of its relations
		 */ 
		this.hydrate = function(data){
			var item, key = data.type+':'+data.id;

			// Create basic data
			item = data.attributes;
			item.id = data.id;

			// Add to map
			this.hydratedItemMap[key] = item;

			// Apply relations
			for(var relName in data.relationships){
				if(data.relationships.hasOwnProperty(relName)){
					var relation = data.relationships[relName];
					item[relName] = this.loadRelation(relation.data);
				}
			}
			return item;
		};

		/**
		 * Load a given relation. Can be either singular or a collection
		 */ 
		this.loadRelation = function(relation){
			// Is relation empty?
			if(relation === null) return null;

			// If this is a collection relation, call self with each item & return em all as an array
			if(Array.isArray(relation)){
				var collection = [];

				for(var r in relation){
					if(relation.hasOwnProperty(r)){
						collection.push(this.loadRelation(relation[r]));
					}
				}
				return collection;
			}

			var key = relation.type+':'+relation.id;
			// Check if we have loaded this already, if not grab it from the map & hydrate it
			if(this.hydratedItemMap[key]){
				return this.hydratedItemMap[key];
			}else{
				return this.hydrate(this.relationMap[key]);
			}
		};

		/**
		 * Create a quick lookup map for all include-able relations so we can access them quickly without 
		 * additional looping
		 */ 
		this.generateIncludeMap = function(data){
			var i, item, includes = [].concat(data.data);

			if(data.included){
				includes = includes.concat(data.included);
			}

			for(i in includes){
				if(includes.hasOwnProperty(i)){
					item = includes[i];
					this.relationMap[item.type+':'+item.id] = item; 
				}
			}
		};

		/**
		 * Parse json:api payload & return rehydrated object
		 */ 
		this.parse = function(payload){
			// Create quick lookup for includes
			this.generateIncludeMap(payload);

			// Hydrate the main data set (if collection)
			if(Array.isArray(payload.data)){
				var collection = [];

				for(var item in payload.data){
					if(payload.data.hasOwnProperty(item)){
						collection.push(this.hydrate(payload.data[item]));
					}
				}
				return collection;
			}
			// or of singular
			return this.hydrate(payload.data);	
		};
	};

	/**
	 * jsonReHydratePublic
	 * Public api for the json:api rehydrater
	 */ 
	var jsonApiReHydratePublic = {};
	jsonApiReHydratePublic.rehydrate = function(payload){
		var jrh = new jsonReHydrater();
		return jrh.parse(payload);	
	};

	// Add ourselves to the outside world / global name-space
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
		module.exports = jsonApiReHydratePublic;
	} else {
		if (typeof define === "function" && define.amd) {
			define([], function() {
				return jsonApiReHydratePublic;
			});
		} else {
			window.jsonApiReHydrate = jsonApiReHydratePublic;
		}
	}
})();