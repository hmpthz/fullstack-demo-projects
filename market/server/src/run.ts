import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(import.meta.dirname, '..', '.env') });

const app = await (await import('./index.js')).default;

const PORT = 8079;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});