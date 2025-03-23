'use strict';

const { Server } = require('node:http');
const path = require('node:path');
const fs = require('node:fs');

function createServer() {
  const server = new Server();

  server.on('request', (req, res) => {
    if (req.method === 'GET') {
      const filePath = path.join(__dirname, 'index.html');

      if (fs.existsSync(filePath)) {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(fs.readFileSync(filePath));

        return;
      } else {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('FIle not found');

        return;
      }
    }

    if (req.method !== 'POST') {
      res.statusCode = 400;
      res.end('Unexpected request method');

      return;
    }

    if (req.url !== '/add-expense') {
      res.statusCode = 404;
      res.end('No such directory');

      return;
    }

    let formData = '';

    req.on('data', (chunk) => (formData += chunk));

    req.on('end', () => {
      try {
        const dbPath = path.join(__dirname, '..', 'db', 'expense.json');

        if (!fs.existsSync(dbPath)) {
          fs.writeFileSync(dbPath, '[]');
        }

        const data = JSON.parse(formData);
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

        dbData.push(data);

        fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });

        const fileStream = fs.createReadStream(dbPath);

        fileStream.pipe(res);

        fileStream.on('error', (err) => {
          res.statusCode = 500;

          res.end(
            JSON.stringify({
              error: 'Problem with reading file',
              details: err.message,
            }),
          );
        });
      } catch (err) {
        res.statusCode = 400;

        res.end(
          JSON.stringify({ error: 'Invalid JSON data', details: err.message }),
        );
      }
    });
  });

  return server;
}

module.exports = {
  createServer,
};
