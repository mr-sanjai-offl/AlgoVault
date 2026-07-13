const https = require('https');

const query = `
  query IntrospectionQuery {
    __type(name: "SubmissionDetailsNode") {
      name
      fields {
        name
      }
    }
  }
`;

const data = JSON.stringify({ query });

const req = https.request({
  hostname: 'leetcode.com',
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'User-Agent': 'Mozilla/5.0'
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(JSON.parse(body)));
});

req.on('error', console.error);
req.write(data);
req.end();
