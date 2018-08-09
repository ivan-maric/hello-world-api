const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const port = 8000;

const server = http.createServer(function(req,res){

    const parsedUrl = url.parse(req.url, true);

    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    const method = req.method.toLowerCase();

    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function() {
        buffer += decoder.end();

        const chosenHandler = method === 'post' && typeof(router[trimmedPath]) !== 'undefined'
            ? router[trimmedPath]
            : handlers.notFound;

        const data = {
            trimmedPath,
            method,
            incomingPayload: bufferParser(buffer)
        };

        chosenHandler(data, function(statusCode, outgoingPayload){

            statusCode = typeof statusCode === 'number' ? statusCode : 200;

            outgoingPayload = typeof outgoingPayload === 'object'? outgoingPayload : {};

            const outgoingPayloadString = JSON.stringify(outgoingPayload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(outgoingPayloadString);

            console.log("Returning this response to user: ", statusCode, outgoingPayloadString);

        });
    });
});

server.listen(port, function() {
    console.log('The server is up and running on port ' + port);
});

const handlers = {};

handlers.hello = function(data, callback){
    callback(200, {
        message: 'Welcome to /hello route',
        you_sent_me: data.incomingPayload
    });
};

handlers.notFound = function(data,callback){
    callback(404);
};

const router = {
    'hello' : handlers.hello
};

function bufferParser(buffer) {
    let obj;

    try {
        obj = JSON.parse(buffer);
    }
    catch(error) {
        obj = buffer;
    }

    return obj;
}