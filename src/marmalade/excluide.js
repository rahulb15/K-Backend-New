const data ={
    "TOKENS": ["t:Ze8fUGr0_gGvr-YKveu5-TPQI696afBXL0uZ_MkhPJI"
              ],
  
    "IMAGES": [
              ],
  
    "COLLECTIONS": [
                   ]
  };
  

const to_element = x => [x,true]

const _images_map = new Map(data.IMAGES.map(to_element))
const _tokens_map = new Map(data.TOKENS.map(to_element))
const _collection_map = new Map(data.COLLECTIONS.map(to_element))

module.exports = {
    disabled_image: x => _images_map.has(x),
    enabled_image: x => !_images_map.has(x),
    disabled_token: x => _tokens_map.has(x),
    enabled_token: x => !_tokens_map.has(x),
    disabled_collection: x => _collection_map.has(x),
    enabled_collection: x => !_collection_map.has(x)
}
