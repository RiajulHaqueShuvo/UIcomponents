/*
 * Create an admin account, or reset an existing admin's password.
 *
 *   npm run admin:create -- you@example.com
 *
 * You'll be asked for the password (typing is hidden). For automation you can
 * pass it in the ADMIN_PASSWORD environment variable instead.
 */
import { createInterface } from 'node:readline';
import { hashPassword } from '../src/auth.ts';
import { db, now } from '../src/db.ts';

const email = (process.argv[2] ?? '').trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('\n  Usage: npm run admin:create -- you@example.com\n');
  process.exit(1);
}

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const out = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
    let shown = false;
    out._writeToOutput = (s: string) => {
      if (!shown) {
        out.output.write(s); // the question itself
        shown = true;
      }
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

const password = process.env.ADMIN_PASSWORD ?? (await askHidden('  Password (min 10 characters): '));
if (password.length < 10) {
  console.error('\n  ✗ Password must be at least 10 characters.\n');
  process.exit(1);
}
if (!process.env.ADMIN_PASSWORD) {
  const again = await askHidden('  Repeat password: ');
  if (again !== password) {
    console.error('\n  ✗ Passwords did not match.\n');
    process.exit(1);
  }
}

const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: number } | undefined;
if (existing) {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(password), existing.id);
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(existing.id); // log out everywhere
  console.log(`\n  ✓ Password updated for ${email} (all sessions logged out)\n`);
} else {
  db.prepare('INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)').run(email, hashPassword(password), now());
  console.log(`\n  ✓ Admin created: ${email}\n    Log in at /admin\n`);
}
