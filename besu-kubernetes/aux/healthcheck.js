const http = require('http');
const fs = require('fs');

let options = {
  'method': 'POST',
  'hostname': '127.0.0.1',
  'port': 8545,
  'path': '/',
  'headers': {
    'Content-Type': 'text/plain'
  }
};

const req = http.request(options, (res) => {
  let chunks = [];

  res.on("data", (chunk) => {
    chunks.push(chunk);
  });

  res.on("end", (chunk) => {
    let body = Buffer.concat(chunks);
    console.log(body.toString());
  });

  res.on("error", (error) => {
    console.error(error);
  });
});

let postData =  "{\"jsonrpc\":\"2.0\",\"method\":\"net_enode\",\"params\":[],\"id\":1}";

req.write(postData);

req.setTimeout(1000, function() {
  req.abort();
});

req.end();
