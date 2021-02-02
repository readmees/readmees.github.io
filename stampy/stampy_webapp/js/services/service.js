/*
 * Security contexts
 */
/*
 * Service settings
 */
/*
 * Services
 */
var PHP_API = new Apperyio.RestService({
    'url': 'https://api.appery.io/rest/1/proxy/tunnel',
    'proxyHeaders': {
        'appery-proxy-url': 'https://stampy-php.herokuapp.com/ah_api/ah_api.php',
        'appery-transformation': 'checkTunnel',
        'appery-key': '1612302763647',
        'appery-rest': '3db0c867-49d3-4e8f-9948-59b1a4951d2b'
    },
    'dataType': 'json',
    'type': 'get',
    'defaultRequest': {
        "headers": {},
        "parameters": {},
        "body": null
    }
});
var BarcodeService = new Apperyio.BarCodeService({
    'defaultRequest': {
        "data": null
    }
});
var BOOL_API = new Apperyio.RestService({
    'url': 'https://api.appery.io/rest/1/proxy/tunnel',
    'proxyHeaders': {
        'appery-proxy-url': 'https://stampy-php.herokuapp.com/ah_api/return_bools.php',
        'appery-transformation': 'checkTunnel',
        'appery-key': '1612302763648',
        'appery-rest': '3db0c867-49d3-4e8f-9948-59b1a4951d2b'
    },
    'dataType': 'json',
    'type': 'get',
    'defaultRequest': {
        "headers": {},
        "parameters": {},
        "body": null
    }
});
var _1_service = new Apperyio.RestService({
    'url': 'https://api.appery.io/rest/1/code/862124a8-dd1f-456a-b2bc-7828606f5f67/exec',
    'dataType': 'json',
    'type': 'post',
    'contentType': false,
    'defaultRequest': {
        "headers": {
            "Content-Type": "text/plain"
        },
        "parameters": {},
        "body": null
    }
});