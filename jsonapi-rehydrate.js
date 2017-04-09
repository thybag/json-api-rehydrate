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
		var newItem;
		if(typeof hydratedItemMap[item.type] === 'object' && hydratedItemMap[item.type][item.id] === 'object'){
			newItem = hydratedItemMap[item.type][item.id];
		}else{
			newItem = {};
			newItem = Object.assign(newItem,item.attributes);
			newItem.id = item.id;

			if(typeof hydratedItemMap[item.type] !== 'object'){
				hydratedItemMap[item.type] = {};
			}
			hydratedItemMap[item.type][item.id] = newItem;
		}

		for(let key in item.relationships){
			let relation = item.relationships[key];

			if(Array.isArray(relation.data)){
				newItem[key] = [];
				for(let rel of relation.data){
					if(hydratedItemMap[rel.type][rel.id]){
						item = hydratedItemMap[rel.type][rel.id];
					}else{
						item = hydrateItem(relationMap[rel.type][rel.id]);
					}
					newItem[key].push(item);
				}
			}else{
				if(typeof hydratedItemMap[relation.data.type] !== 'object'){
					hydratedItemMap[relation.data.type] = {};
				}	
				if(hydratedItemMap[relation.data.type][relation.data.id]){
					newItem[key] = hydratedItemMap[relation.data.type][relation.data.id];
				}else{
					newItem[key] = hydrateItem(relationMap[relation.data.type][relation.data.id]);
				}
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