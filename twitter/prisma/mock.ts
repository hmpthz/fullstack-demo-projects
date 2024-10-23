import { PGlite } from '@electric-sql/pglite';
import { PrismaPGlite } from 'pglite-prisma-adapter';
import { PrismaClient, type User } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const client = await PGlite.create(`file://${path.resolve(import.meta.dirname, './pglite')}`);
const adapter = new PrismaPGlite(client);
const prisma = new PrismaClient({ adapter });

async function main() {
    // execSql('./migrations/20241020143837_a1/migration.sql');
    // seedDb();
}

async function execSql(sqlFileRelativePath: string) {
    let filepath = path.resolve(import.meta.dirname, sqlFileRelativePath);
    let sql = fs.readFileSync(filepath, { encoding:'utf-8', flag:'r' });
    let result = await client.exec(sql);
    console.log(result);
}

async function seedDb() {
    const users: (Omit<User, 'id'>)[] = [
        {
            name: 'User A1',
            email: 'usera1@example.com',
            emailVerified: new Date(),
            image: ''
        },
        {
            name: 'User A2',
            email: 'usera2@example.com',
            emailVerified: new Date(),
            image: ''
        }
    ];
    await prisma.user.createMany({
        data: users
    });
}

main();