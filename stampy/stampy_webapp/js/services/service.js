/*
 * Security contexts
 */
/*
 * Service settings
 */
/*
 * Services
 */
var StampyAPI = new Apperyio.RestService({
    'url': 'https://api.appery.io/rest/1/proxy/tunnel',
    'proxyHeaders': {
        'appery-proxy-url': 'https://api.appery.io/rest/1/code/3ed7b4b0-4821-4953-af45-e8b17e3ca8f2/exec',
        'appery-transformation': 'checkTunnel',
        'appery-key': '1610458763164',
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