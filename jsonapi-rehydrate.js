/**
 * JSON:API Rehydrate
 *
 * @author Carl
 * @version 0.0.1
 * use as data = jsonApiRehydrate( json_API_response );
 */
(function(){
	let relationMap = {}; 
	let hydratedItemMap = {}

	// Hydrate an item, combine all its data + include the relations as part of rthe data set
	function hydrate(item){
		var newItem;
		var key = item.type+':'+item.id;
		if(typeof hydratedItemMap[key] === 'object'){
			newItem = hydratedItemMap[key];
		}else{
			newItem = {};
			newItem = Object.assign(newItem,item.attributes);
			newItem.id = item.id;

			hydratedItemMap[key] = newItem;
		}

		for(let relName in item.relationships){
			let relation = item.relationships[relName];
			newItem[relName] = loadRelation(relation.data);
		}
		return newItem;
	}

	function loadRelation(relation){
		if(Array.isArray(relation)){
			let collection = [];
			for(let rel of relation){
				collection.push(loadRelation(rel));
			}
			return collection;
		}

		if(hydratedItemMap[relation.type+':'+relation.id]){
			return hydratedItemMap[relation.type+':'+relation.id];
		}else{
			return hydrate(relationMap[relation.type+':'+relation.id]);
		}
	}

	// Make map of includes for quick lookup
	function generateIncludeMap(included){
		for(let item of included){
			relationMap[item.type+':'+item.id] = item; 
		}
	}

	// public
	window.jsonApiRehydrate = function(data){

		// Make includes map
		generateIncludeMap(data.included);

		if(Array.isArray(data.data)){
			let collection = [];
			for(let item of data.data){
				collection.push(hydrate(item));
			}
			return collection;
		}
		return hydrate(data.data);
	};
})();