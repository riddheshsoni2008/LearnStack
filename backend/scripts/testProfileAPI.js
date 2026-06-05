const http = require('http');

const loginOptions = {
  hostname: process.env.API_HOST || 'localhost',
  port: process.env.PORT || 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(loginOptions, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const resData = JSON.parse(data);
    const token = resData.token;
    
    if (!token) {
      console.log('Login failed');
      return;
    }

    const endpoints = [
      '/api/progress/me',
      '/api/tracks',
      '/api/badges',
      '/api/badges/me',
      '/api/badges/xp-history'
    ];

    endpoints.forEach(endpoint => {
      http.get({
        hostname: process.env.API_HOST || 'localhost',
        port: process.env.PORT || 5000,
        path: endpoint,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }, r => {
        let d = '';
        r.on('data', chunk => d += chunk);
        r.on('end', () => {
          console.log(`Endpoint ${endpoint} - Status: ${r.statusCode}`);
          if (r.statusCode !== 200) {
            console.log(d.substring(0, 100));
          }
        });
      });
    });
  });
});

req.write(JSON.stringify({ email: 'test@example.com', password: 'password123' }));
req.end();
