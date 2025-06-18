import bcrypt from 'bcrypt';
import { writeFile } from 'fs/promises';

const users = [
  { uid: 1, email: 'alice@example.com', password: 'alicepass', display_name: 'Alice' },
  { uid: 2, email: 'bob@example.com', password: 'bobpass', display_name: 'Bob' },
  { uid: 3, email: 'carol@example.com', password: 'carolpass', display_name: 'Carol' }
];

const saltRounds = 12;

async function main() {
  let sql = 'INSERT INTO Users (uid, email, password_hash, display_name) VALUES\n';

  const values = [];
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, saltRounds);
    values.push(
      `(${user.uid}, '${user.email}', '${hash}', '${user.display_name}')`
    );
  }
  sql += values.join(',\n') + ';\n';

  await writeFile('src/database/populateUsers.sql', sql);
  console.log('SQL file written to src/database/populateUsers.sql');
}

main();