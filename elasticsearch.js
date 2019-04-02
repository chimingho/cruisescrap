var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
   hosts: [ 'https://username:password@host:port']
});


client.ping({
    requestTimeout: 30000,
}, function(error) {
    if (error) {
        console.error('elasticsearch cluster is down!');
    } else {
        console.log('Everything is ok');
    }
});

client.index({
    index: 'blog',
    id: '1',
    type: 'posts',
    body: {
        "PostName": "Integrating Elasticsearch Into Your Node.js Application",
        "PostType": "Tutorial",
        "PostBody": "This is the text of our tutorial about using Elasticsearch in your Node.js application.",
    }
}, function(err, resp, status) {
    console.log(resp);
});




client.search({
    index: 'blog',
    type: 'posts',
    q: 'PostName:Node.js'
}).then(function(resp) {
    console.log(resp);
}, function(err) {
    console.trace(err.message);
});

client.search({
    index: 'blog',
    type: 'posts',
    body: {
        query: {
            match: {
                "PostName": 'Node.js'
            }
        }
    }
}).then(function(resp) {
    console.log(resp);
}, function(err) {
    console.trace(err.message);
});