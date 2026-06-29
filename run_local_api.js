const app = require('./api/index.js');
const port = 5005;
app.listen(port, () => {
  console.log(`✅ Local Mock Backend running at http://localhost:${port}`);
});
