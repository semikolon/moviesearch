import express from 'express';
import search from './search';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

app.use(search());

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});

export default app;