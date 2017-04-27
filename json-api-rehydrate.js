/**
 * JSON:API Rehydrate
 *
 * @author Carl
 * @version 0.2.0
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
			item = new HydratedObject(data);

			// Add to map
			this.hydratedItemMap[key] = item;

			// Apply relations
			for(var relName in data.relationships){
				if(data.relationships.hasOwnProperty(relName)){
					var relation = data.relationships[relName];
					item[relName] = this.loadRelation(relation);
				}
			}
			return item;
		};

		/**
		 * Load a given relation. Can be either singular or a collection
		 */ 
		this.loadRelation = function(relation){
			// Is relation empty?
			if(relation.data === null) return null;

			// If this is a collection relation, call self with each item & return em all as an array
			if(Array.isArray(relation.data)){
				var collection = new HydratedCollection(relation);

				for(var r in relation.data){
					if(relation.data.hasOwnProperty(r)){
						collection.push(this.loadRelation({data: relation.data[r]}));
					}
				}
				return collection;
			}

			var key = relation.data.type+':'+relation.data.id;
			// Check if we have loaded this already, if not grab it from the map & hydrate it
			if(this.hydratedItemMap[key]){
				return this.hydratedItemMap[key];
			}else if(this.relationMap[key]){
				return this.hydrate(this.relationMap[key]);
			}else{
				return null;
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
				var collection = new HydratedCollection(payload);

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
	 * hydratedObject
	 * Provides some helpers & data accessors for additional information found on
	 * a json:api payload object.
	 */
	function HydratedObject(original){

		// Populate json:api payload data in to object
		for(var attribute in original.attributes){
			if(original.attributes.hasOwnProperty(attribute)){
				this[attribute] = original.attributes[attribute];
			}
		}
		this.id = original.id;

		// Add helper methods for accessing useful data
		this.getOriginal = function(){
			return original;
		};
	}

	// Set prototype accessors
	HydratedObject.prototype.getId = function(){
		return this.getOriginal().id;
	};
	HydratedObject.prototype.getType = function(){
		return this.getOriginal().type;
	};
	HydratedObject.prototype.getMeta = function(){
		return (this.getOriginal().meta) ? this.getOriginal().meta : null;
	};
	HydratedObject.prototype.getLinks = function(){
		return (this.getOriginal().links) ? this.getOriginal().links : null;
	};
	HydratedObject.prototype.getRelationships = function(){
		return (this.getOriginal().relationships) ? this.getOriginal().relationships : null;
	};
	HydratedObject.prototype.getAttributes = function(){
		return (this.getOriginal().attributes) ? this.getOriginal().attributes : null;
	};

	/**
	 * hydratedCollection
	 * Provides additional functions to an array of hydrated Objects
	 */	
	function HydratedCollection(original){
		// Add helper methods for accessing useful data
		this.getOriginal = function(){
			return original;
		};
	}

	// Set prototype accessors
	HydratedCollection.prototype = new Array();
	HydratedCollection.prototype.getMeta = function(){
		return (this.getOriginal().meta) ? this.getOriginal().meta : null;
	};
	HydratedCollection.prototype.getLinks = function(){
		return (this.getOriginal().links) ? this.getOriginal().links : null;
	};

	/**
	 * jsonReHydratePublic
	 * Public api for the json:api rehydrater
	 */ 
	var jsonApiReHydratePublic = {};
	jsonApiReHydratePublic.rehydrate = function(payload){
		var jrh = new jsonReHydrater();
		return jrh.parse(JSON.parse(JSON.stringify(payload)));	
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