/**
 * Database seeder — creates sample data and admin credentials.
 * Run with: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initDatabase, queryOne, runStatement } = require('./config/database');

async function seed() {
  console.log('[SEED] Initializing database...');
  await initDatabase();

  // ─── Seed admin credentials ─────────────────────────────────────
  const existingAdmin = queryOne('SELECT id FROM admin_credentials LIMIT 1');
  if (!existingAdmin) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'changeme';
    const hash = await bcrypt.hash(password, 12);

    runStatement('INSERT INTO admin_credentials (username, password_hash) VALUES (?, ?)', [username, hash]);
    console.log(`[SEED] Admin user "${username}" created with hashed password.`);
  } else {
    console.log('[SEED] Admin credentials already exist, skipping.');
  }

  // ─── Seed sample projects ──────────────────────────────────────
  /*const projectCount = queryOne('SELECT COUNT(*) as count FROM projects');
  if (!projectCount || projectCount.count === 0) {
    runStatement(
      'INSERT INTO projects (title, slug, content, tags) VALUES (?, ?, ?, ?)',
      [
        'Physics Engine v.0',
        'physics-engine',
        `# Physics Engine v.0\n\nA real-time 2D physics simulation built from scratch using JavaScript and the HTML5 Canvas API.\n\n## Features\n\n- **Rigid body dynamics** with collision detection and response\n- **Gravity simulation** with configurable gravitational constant\n- **Constraint solving** for joints and springs\n- **Spatial hashing** for O(n) broadphase collision detection\n\n## Technical Details\n\nThe engine uses a Verlet integration scheme for numerical stability and implements the Separating Axis Theorem (SAT) for narrow-phase collision detection between convex polygons.\n\n\`\`\`javascript\nclass RigidBody {\n  constructor(x, y, mass) {\n    this.position = new Vector2(x, y);\n    this.velocity = new Vector2(0, 0);\n    this.mass = mass;\n    this.inverseMass = mass > 0 ? 1 / mass : 0;\n  }\n}\n\`\`\`\n\nThe engine processes approximately 10,000 particles at 60fps on modern hardware.\n\n## What I Learned\n\nBuilding a physics engine from scratch taught me the importance of numerical methods, spatial data structures, and the surprising complexity behind seemingly simple physical interactions.`,
        JSON.stringify(['javascript', 'physics', 'canvas', 'simulation'])
      ]
    );

    runStatement(
      'INSERT INTO projects (title, slug, content, tags) VALUES (?, ?, ?, ?)',
      [
        'Deep Water Portfolio',
        'deep-water-portfolio',
        `# Deep Water Portfolio\n\nThe very site you're exploring right now — a modular portfolio platform with a dynamic scroll-linked theme.\n\n## Architecture\n\n- **Backend**: Node.js + Express.js with EJS server-side rendering\n- **Database**: SQLite via sql.js\n- **Security**: Helmet.js, rate limiting, bcrypt, JWT authentication\n- **Theme**: CSS variable-driven depth transitions\n\n## The Deep Water Concept\n\nAs you scroll deeper into any page, the background transitions from a surface cyan (\`#0077be\`) to an abyssal black-blue (\`#00001a\`), creating an immersive underwater diving experience.\n\nThe scroll-depth script calculates the user's position as a percentage of the total scrollable height and interpolates between the surface and abyss RGB values in real-time.\n\n## Security Measures\n\n- **XSS Protection**: All user input is sanitized using the xss library\n- **Rate Limiting**: 100 req/15min global, 3 POST/hr for submissions\n- **Admin Shield**: JWT stored in HttpOnly cookies with strict SameSite policy\n- **Helmet.js**: Comprehensive HTTP security headers`,
        JSON.stringify(['node.js', 'express', 'sqlite', 'security', 'css'])
      ]
    );

    runStatement(
      'INSERT INTO projects (title, slug, content, tags) VALUES (?, ?, ?, ?)',
      [
        'Terminal Portfolio Concept',
        'terminal-portfolio',
        `# Terminal Portfolio Concept\n\nAn interactive terminal-style portfolio interface that processes commands like a real shell.\n\n## Available Commands\n\n| Command | Description |\n|---------|------------|\n| \`help\` | List all available commands |\n| \`about\` | Display developer bio |\n| \`github\` | Fetch live data from GitHub API |\n| \`projects\` | List portfolio projects |\n| \`clear\` | Clear the terminal output |\n\n## Implementation\n\nThe terminal captures keyboard input and processes commands against a registry. The \`github\` command makes a real API call to fetch live repository data.\n\n\`\`\`javascript\nasync function processCommand(cmd) {\n  if (cmd === 'github') {\n    const response = await fetch('https://api.github.com/users/fakadoey');\n    const data = await response.json();\n    createLine(\\\`User: \\\${data.login}\\\`);\n    createLine(\\\`Public Repos: \\\${data.public_repos}\\\`);\n  }\n}\n\`\`\`\n\nThis was the original homepage concept before the Deep Water redesign.`,
        JSON.stringify(['javascript', 'terminal', 'api', 'interactive'])
      ]
    );

    console.log('[SEED] 3 sample projects inserted.');
  } else {
    console.log(`[SEED] ${projectCount.count} projects already exist, skipping.`);
  }

  // ─── Seed sample comments ──────────────────────────────────────
  const commentCount = queryOne('SELECT COUNT(*) as count FROM comments');
  if (!commentCount || commentCount.count === 0) {
    const physicsProject = queryOne('SELECT id FROM projects WHERE slug = ?', ['physics-engine']);
    if (physicsProject) {
      runStatement(
        'INSERT INTO comments (project_id, author, content) VALUES (?, ?, ?)',
        [physicsProject.id, 'Anonymous Diver', 'This is incredible work! The spatial hashing optimization is really clever.']
      );
      runStatement(
        'INSERT INTO comments (project_id, author, content) VALUES (?, ?, ?)',
        [physicsProject.id, 'Deep Sea Explorer', 'How does the Verlet integration compare to Euler for stability? I\'d love to see a comparison.']
      );
      console.log('[SEED] 2 sample comments inserted.');
    }
  } else {
    console.log(`[SEED] ${commentCount.count} comments already exist, skipping.`);
  }*/

  console.log('[SEED] Database seeding complete! ✓');
  process.exit(0);
}

seed().catch(err => {
  console.error('[SEED] Fatal error:', err);
  process.exit(1);
});
