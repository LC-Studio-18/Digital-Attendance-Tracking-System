import dotenv from 'dotenv';

dotenv.config();

const { default: app } = await import('./app.js');

const PORT = process.env.PORT;

if (!PORT) {
  throw new Error('PORT is not configured');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});