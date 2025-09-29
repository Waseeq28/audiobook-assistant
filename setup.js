#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  for (const [placeholder, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(placeholder, 'g'), value);
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

function generateAndroidPackage(projectName, ownerName) {
  const cleanOwner = ownerName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanProject = projectName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `com.${cleanOwner}.${cleanProject}`;
}

function toTitleCase(kebabStr) {
  return kebabStr
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function setup() {
  try {
    const projectSlug = await question('App name (kebab-case): ');
    const projectName = toTitleCase(projectSlug);
    const ownerName = await question('Owner name: ');
    const androidPackage = generateAndroidPackage(projectSlug, ownerName);

    const replacements = {
      '{{PROJECT_NAME}}': projectSlug,
      '{{APP_NAME}}': projectName,
      '{{APP_SLUG}}': projectSlug,
      '{{APP_SCHEME}}': projectSlug,
      '{{ANDROID_PACKAGE}}': androidPackage,
    };

    ['package.json', 'app.json', 'app/index.tsx', 'README.md', 'LICENSE'].forEach((file) => {
      replaceInFile(file, replacements);
    });

    if (!fs.existsSync('.env')) {
      fs.copyFileSync('env.example', '.env');
    }

    console.log('Setup complete. Run "npm install" then "npm start".');
  } catch (error) {
    console.error('Setup failed:', error.message);
  }

  rl.close();
}

if (require.main === module) {
  setup();
}
