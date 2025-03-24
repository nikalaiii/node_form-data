'use strict';

const { Server } = require('node:http');
const path = require('node:path');
const fs = require('node:fs');

function createServer() {
  const server = new Server();

  server.on('request', (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      const htmlPath = path.join(__dirname, 'index.html');

      if (fs.existsSync(htmlPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        console.log('status 200, response html');
        res.end(fs.readFileSync(htmlPath));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        console.log('status 404. error response html');
        res.end('File html not found');
      }

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      const expensePath = path.join(__dirname, '../', 'db', 'expense.json');

      console.log('expensePath is ' + expensePath.toString());

      let data = '';

      req.on('data', (chunk) => {
        data += chunk;
      });

      req.on('end', () => {
        try {
          const parsedData = JSON.parse(data);

          if (!parsedData.date || !parsedData.title || !parsedData.amount) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            console.log('status 400, data invalid');
            res.end('Invalid data format');

            return;
          }

          let expenseData = [];

          try {
            const fileData = fs.readFileSync(expensePath, 'utf-8');

            expenseData = JSON.parse(fileData);

            if (!Array.isArray(expenseData)) {
              expenseData = [];
            }
          } catch {
            expenseData = [];
          }

          expenseData.push(parsedData);
          fs.writeFileSync(expensePath, JSON.stringify(expenseData, null, 2));

          res.writeHead(302, { Location: '/' });
          console.log('status 302, location');
          res.end();
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          console.log('status 500 catch eror');
          res.end(`Server error: ${err}`);
        }
      });

      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  return server;
}

module.exports = {
  createServer,
};
