#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * Update existing student database with new metadata files
 * This script reuses the metadata joining logic without rebuilding the entire database
 */

async function matchStudentWithMetadata(student, metadataFiles) {
  const matches = {};
  
  for (const [metadataName, metadata] of Object.entries(metadataFiles)) {
    if (metadata.entries) {
      const studentEntries = metadata.entries.filter(entry => entry.author === student.username);
      if (studentEntries.length > 0) {
        matches[metadataName] = studentEntries;
      }
    }
  }
  
  return matches;
}

async function loadMetadataFiles(outputDir) {
  const metadataFiles = {};
  
  try {
    const files = await fs.readdir(outputDir);
    const metadataFileNames = files.filter(file => 
      file.endsWith('-metadata.json') && file !== 'student-database.json'
    );
    
    for (const fileName of metadataFileNames) {
      const filePath = path.join(outputDir, fileName);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const metadata = JSON.parse(content);
        const baseName = fileName.replace('-metadata.json', '');
        metadataFiles[baseName] = metadata;
        console.log(`📋 Loaded metadata file: ${fileName}`);
      } catch (error) {
        console.warn(`⚠️  Could not load metadata file ${fileName}: ${error.message}`);
      }
    }
  } catch (error) {
    console.log('ℹ️  No metadata files found or error reading directory');
  }
  
  return metadataFiles;
}

async function updateStudentMetadata(outputDir = 'src/lib/data') {
  // Load existing student database
  const fullDatabasePath = path.join(outputDir, 'student-database.json');
  
  try {
    const databaseContent = await fs.readFile(fullDatabasePath, 'utf8');
    const database = JSON.parse(databaseContent);
    
    console.log(`📚 Loaded existing database with ${Object.keys(database.students).length} students`);
    
    // Load metadata files
    const metadataFiles = await loadMetadataFiles(outputDir);
    
    if (Object.keys(metadataFiles).length === 0) {
      console.log('ℹ️  No metadata files found to join');
      return;
    }
    
    // Update individual student files with new metadata
    const studentsDir = path.join(outputDir, 'students');
    
    for (const [username, student] of Object.entries(database.students)) {
      // Match student with metadata files
      const metadataMatches = await matchStudentWithMetadata(student, metadataFiles);
      
      const studentPath = path.join(studentsDir, `${username}.json`);
      const studentData = {
        ...student,
        generatedAt: database.generatedAt,
        repositories: database.repositories,
        projectSubmissions: metadataMatches
      };

      await fs.writeFile(studentPath, JSON.stringify(studentData, null, 2));
    }
    
    console.log(`✅ Updated individual student files with new metadata`);
    console.log(`👥 Updated ${Object.keys(database.students).length} student files in: ${studentsDir}/`);
    
  } catch (error) {
    console.error('❌ Failed to update student metadata:', error.message);
    process.exit(1);
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node update-student-metadata.js [options]

Options:
  --output-dir <dir>    Output directory (default: src/lib/data)
  --help, -h            Show this help message

This script updates existing individual student files with new metadata:
- Loads existing student-database.json
- Loads all *-metadata.json files in the directory
- Updates individual student files in students/ directory with new project submissions
- Does NOT rebuild the entire database (much faster)

Examples:
  node update-student-metadata.js
  node update-student-metadata.js --output-dir src/lib/data
    `);
    process.exit(0);
  }

  let outputDir = 'src/lib/data';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output-dir' && i + 1 < args.length) {
      outputDir = args[++i];
    }
  }

  console.log('🔄 Updating student database with new metadata...\n');

  updateStudentMetadata(outputDir)
    .then(() => {
      console.log('\n✅ Student metadata update complete!');
    })
    .catch(error => {
      console.error('❌ Failed to update student metadata:', error.message);
      console.error(error.stack);
      process.exit(1);
    });
}

export { updateStudentMetadata };