#!/usr/bin/env node

/**
 * Comprehensive integration test script
 * This script runs all tests and checks for common issues
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🔄 ${description}...`, 'blue');
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    log(`✅ ${description} completed successfully`, 'green');
    return { success: true, output };
  } catch (error) {
    log(`❌ ${description} failed:`, 'red');
    log(error.stdout || error.message, 'red');
    return { success: false, error: error.stdout || error.message };
  }
}

function checkFileExists(filePath, description) {
  if (existsSync(filePath)) {
    log(`✅ ${description} exists`, 'green');
    return true;
  } else {
    log(`❌ ${description} missing: ${filePath}`, 'red');
    return false;
  }
}

function checkPackageJson() {
  log('\n📦 Checking package.json configuration...', 'blue');
  
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    
    // Check required dependencies
    const requiredDeps = ['react', 'react-dom', 'vite-plugin-pwa'];
    const requiredDevDeps = ['@playwright/test', 'vitest', '@testing-library/react'];
    
    let allDepsPresent = true;
    
    requiredDeps.forEach(dep => {
      if (!packageJson.dependencies?.[dep]) {
        log(`❌ Missing dependency: ${dep}`, 'red');
        allDepsPresent = false;
      }
    });
    
    requiredDevDeps.forEach(dep => {
      if (!packageJson.devDependencies?.[dep]) {
        log(`❌ Missing dev dependency: ${dep}`, 'red');
        allDepsPresent = false;
      }
    });
    
    // Check scripts
    const requiredScripts = ['test', 'test:e2e', 'build', 'dev'];
    requiredScripts.forEach(script => {
      if (!packageJson.scripts?.[script]) {
        log(`❌ Missing script: ${script}`, 'red');
        allDepsPresent = false;
      }
    });
    
    if (allDepsPresent) {
      log('✅ All required dependencies and scripts present', 'green');
    }
    
    return allDepsPresent;
  } catch (error) {
    log(`❌ Error reading package.json: ${error.message}`, 'red');
    return false;
  }
}

function checkProjectStructure() {
  log('\n📁 Checking project structure...', 'blue');
  
  const requiredFiles = [
    'src/App.tsx',
    'src/main.tsx',
    'src/components/TimerDisplay/TimerDisplay.tsx',
    'src/components/TimerControls/TimerControls.tsx',
    'src/contexts/TimerContext.tsx',
    'src/services/Timer.ts',
    'vite.config.ts',
    'playwright.config.ts'
  ];
  
  const requiredDirs = [
    'src/components',
    'src/contexts',
    'src/services',
    'src/types',
    'src/utils',
    'e2e'
  ];
  
  let allFilesPresent = true;
  
  requiredFiles.forEach(file => {
    if (!checkFileExists(file, `Required file: ${file}`)) {
      allFilesPresent = false;
    }
  });
  
  requiredDirs.forEach(dir => {
    if (!checkFileExists(dir, `Required directory: ${dir}`)) {
      allFilesPresent = false;
    }
  });
  
  return allFilesPresent;
}

async function main() {
  log('🚀 Starting comprehensive integration test...', 'blue');
  
  const results = {
    packageJson: false,
    structure: false,
    lint: false,
    typeCheck: false,
    unitTests: false,
    build: false,
    e2eTests: false
  };
  
  // Check package.json
  results.packageJson = checkPackageJson();
  
  // Check project structure
  results.structure = checkProjectStructure();
  
  // Run linting
  const lintResult = runCommand('npm run lint', 'Running ESLint');
  results.lint = lintResult.success;
  
  // Run TypeScript type checking
  const typeCheckResult = runCommand('npx tsc --noEmit', 'Running TypeScript type check');
  results.typeCheck = typeCheckResult.success;
  
  // Run unit tests
  const unitTestResult = runCommand('npm run test', 'Running unit tests');
  results.unitTests = unitTestResult.success;
  
  // Build the project
  const buildResult = runCommand('npm run build', 'Building project');
  results.build = buildResult.success;
  
  // Run E2E tests (only if build succeeded)
  if (results.build) {
    const e2eResult = runCommand('npm run test:e2e', 'Running E2E tests');
    results.e2eTests = e2eResult.success;
  } else {
    log('⏭️ Skipping E2E tests due to build failure', 'yellow');
  }
  
  // Summary
  log('\n📊 Test Results Summary:', 'blue');
  log('========================', 'blue');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} ${test}`, color);
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const passRate = Math.round((passedTests / totalTests) * 100);
  
  log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed (${passRate}%)`, 
       passRate === 100 ? 'green' : passRate >= 80 ? 'yellow' : 'red');
  
  if (passRate === 100) {
    log('\n🎉 All tests passed! The application is ready for deployment.', 'green');
  } else if (passRate >= 80) {
    log('\n⚠️ Most tests passed, but some issues need attention.', 'yellow');
  } else {
    log('\n🚨 Multiple test failures detected. Please fix issues before deployment.', 'red');
  }
  
  // Exit with appropriate code
  process.exit(passRate === 100 ? 0 : 1);
}

main().catch(error => {
  log(`💥 Integration test script failed: ${error.message}`, 'red');
  process.exit(1);
});