/* eslint-disable */
const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname)));

app.get('/*', (req, res) => {
  console.log('Server running on port 4000');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(4000);
