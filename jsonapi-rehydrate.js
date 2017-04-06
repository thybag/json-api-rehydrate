/**
 * JSON:API Rehydrate
 *
 * @author Carl
 * @version 0.0.1
 * use as data = jsonApiRehydrate( json_API_response );
 */
(function(){
	let relationMap = {}; 

	// hydrate base item (figure out if its a collection or just the one)
	function hydrate(data){
		if(Array.isArray(data)){
			let collection = [];
			for(let item of data){
				collection.push(hydrateItem(item));
			}
			return collection;
		}else{
			if(typeof data == 'undefined') return null;
			return hydrateItem(data);
		}
	}

	// Hydrate an item, combine all its data + include the relations as part of rthe data set
	function hydrateItem(item){
		var newItem = item.attributes;
			newItem.id = item.id;

		for(let key in item.relationships){
			let relation = item.relationships[key];

			if(Array.isArray(relation.data)){
				newItem[key] = [];	
				for(let rel of relation.data){
					newItem[key].push(hydrate(relationMap[rel.type][rel.id]));
				}
			}else{
				newItem[key] = hydrate(relationMap[relation.data.type][relation.data.id]);
			}
		}

		return newItem;
	}

	// Make map of includes for quick lookup
	function generateIncludeMap(included){
		for(let item of included){
			if(typeof relationMap[item.type] === 'undefined'){
				relationMap[item.type] = {}; 
			}
			relationMap[item.type][item.id] = item; 
		}
	}

	// public
	window.jsonApiRehydrate = function(data){
		generateIncludeMap(data.included);
		return hydrate(data.data);
	};
})();