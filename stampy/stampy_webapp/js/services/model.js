/**
 * Data models
 */
Apperyio.Entity = new Apperyio.EntityFactory({
    "String": {
        "type": "string"
    },
    "Number": {
        "type": "number"
    },
    "Boolean": {
        "type": "boolean"
    }
});
Apperyio.getModel = Apperyio.Entity.get.bind(Apperyio.Entity);
/**
 * Data storage
 */
Apperyio.storage = {
    "barcode_try": new $a.SessionStorage("barcode_try", "String"),
    "tru": new $a.SessionStorage("tru", "Boolean"),
    "fals": new $a.SessionStorage("fals", "Boolean")
};