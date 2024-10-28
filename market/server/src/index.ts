import express from 'express';

const app = express();

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});

const PORT = 8079;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;