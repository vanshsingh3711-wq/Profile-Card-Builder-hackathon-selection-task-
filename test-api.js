const https = require('https');

const data = JSON.stringify({
  image: 'data:image/jpeg;base64,aGVsbG8=',
  profile: { name: 'Test' }
});

const options = {
  hostname: 'profile-card-builder-hackathon-sele.vercel.app',
  port: 443,
  path: '/api/share',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);

  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
