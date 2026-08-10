const http = require('http');

const data = JSON.stringify({
  key: "edo",
  hwid: "test-hwid",
  fileId: "5f2734fe-98a1-4752-a4d1-48d626fd5e87",
  secret: "e291d3ab-4e38-4a49-ad97-a01b46adab51",
  name: "ddddd",
  ownerid: "70f64684-e405-4b3c-8ee4-cb9dc93076fb",
  version: "1.0",
  ip: "127.0.0.1"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/license/download',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let chunks = [];
  res.on('data', (chunk) => {
    chunks.push(chunk);
  });
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    console.log(`Downloaded size: ${buffer.length} bytes`);
    if (res.statusCode !== 200) {
      console.log('Error content:', buffer.toString());
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
