#!/usr/bin/env node
/**
 * Copy .env.{env} to .env based on current git branch.
 * Branch mapping: develop/dev -> development, qa -> qa, main/master -> production.
 * Run: npm run env:branch
 */
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const appDir = path.resolve(__dirname, '..');

function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

const branchToEnv = {
  develop: 'development',
  dev: 'development',
  qa: 'qa',
  main: 'production',
  master: 'production',
};

const branch = getCurrentBranch();
const envName = branch ? (branchToEnv[branch] || 'development') : 'development';

const source = path.join(appDir, `.env.${envName}`);
const dest = path.join(appDir, '.env');

if (!fs.existsSync(source)) {
  console.warn(`No ${path.basename(source)} found. Create it from .env or .env.example.`);
  process.exit(1);
}

fs.copyFileSync(source, dest);
console.log(`Branch: ${branch || 'unknown'} -> env: ${envName}. Copied .env.${envName} to .env`);
