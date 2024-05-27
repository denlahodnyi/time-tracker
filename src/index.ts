import express from 'express';

const app = express();
const PORT = process.env.PORT;

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
