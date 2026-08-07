#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { Octokit } from 'octokit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Build a comprehensive database of student dev notes and project submissions
 * This creates individual student profiles with all their content organized by date
 */

// Initialize Octokit with authentication
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

if (!process.env.GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN not found in environment variables');
  console.error('   Please create a .env file with your GitHub personal access token');
  console.error('   Copy .env.example to .env and add your token');
  process.exit(1);
}

async function fetchAllIssues(repoUrl) {
  const urlParts = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!urlParts) throw new Error('Invalid GitHub URL');

  const [, owner, repo] = urlParts;

  console.log(`📡 Fetching all issues from ${owner}/${repo}...`);

  try {
    // Use Octokit's paginate to get all issues
    const allIssues = await octokit.paginate(octokit.rest.issues.listForRepo, {
      owner,
      repo,
      state: 'all',
      per_page: 100,
    }, (response) => {
      // Filter out pull requests
      const issues = response.data.filter(issue => !issue.pull_request);
      if (issues.length > 0) {
        console.log(`   📄 Fetched ${issues.length} issues from this page`);
      }
      return issues;
    });

    console.log(`✅ Total issues fetched: ${allIssues.length}\n`);
    return allIssues;
  } catch (error) {
    console.error(`Error fetching issues from ${owner}/${repo}: ${error.message}`);
    return [];
  }
}

async function fetchAllComments(owner, repo, issueNumber) {
  try {
    const comments = await octokit.paginate(octokit.rest.issues.listComments, {
      owner,
      repo,
      issue_number: issueNumber,
      per_page: 100,
    });

    return comments;
  } catch (error) {
    console.error(`Error fetching comments for issue #${issueNumber}: ${error.message}`);
    return [];
  }
}

async function fetchUserRepositories(username, options = {}) {
  const { type = 'all', sort = 'updated' } = options;

  try {
    const repos = await octokit.paginate(octokit.rest.repos.listForUser, {
      username,
      type,
      sort,
      per_page: 100,
    });

    // Include all repos (including forks) since commits to forks count as user activity
    return repos;
  } catch (error) {
    if (error.status === 404) {
      console.log(`   ℹ️  User ${username} not found or has no public repos`);
    } else {
      console.error(`Error fetching repos for ${username}: ${error.message}`);
    }
    return [];
  }
}

async function fetchUserCommits(username, options = {}) {
  const { weeks = 4 } = options;
  const fourWeeksAgo = new Date(Date.now() - (weeks * 7 * 24 * 60 * 60 * 1000));
  const since = fourWeeksAgo.toISOString();

  console.log(`   🔍 Fetching commits for ${username} since ${since.split('T')[0]}...`);

  // First, get user's repositories
  const repos = await fetchUserRepositories(username, { sort: 'updated' });

  if (repos.length === 0) {
    return [];
  }

  console.log(`   📂 Found ${repos.length} repositories for ${username}`);

  const allCommits = [];

  // Limit to 20 most recently updated repos to avoid excessive API calls
  for (const repo of repos.slice(0, 20)) {
    try {
      const commits = await octokit.paginate(octokit.rest.repos.listCommits, {
        owner: repo.owner.login,
        repo: repo.name,
        author: username,
        since: since,
        per_page: 100,
      });

      if (commits.length > 0) {
        console.log(`   📝 Found ${commits.length} commits in ${repo.name}`);

        for (const commit of commits) {
          allCommits.push({
            message: commit.commit.message,
            date: parseDate(commit.commit.author.date),
            repository: repo.name
          });
        }
      }

    } catch (error) {
      if (error.status === 409) {
        // Repository is empty
        continue;
      }
      console.log(`   ⚠️  Could not fetch commits from ${repo.name}: ${error.message}`);
    }
  }

  // Sort commits by date (newest first)
  allCommits.sort((a, b) => new Date(b.date.iso) - new Date(a.date.iso));

  console.log(`   ✅ Total commits found: ${allCommits.length}`);
  return allCommits;
}

function parseDate(dateString) {
  const date = new Date(dateString);
  return {
    iso: date.toISOString(),
    date: date.toISOString().split('T')[0], // YYYY-MM-DD
    formatted: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
}

function extractUrls(text) {
  if (!text) return [];

  const urlPattern = /https?:\/\/[^\s<>"\]]+/g;
  const urls = text.match(urlPattern) || [];

  return urls.map(url => url.replace(/[.,;!?)\]_]*$/, '')).filter(url =>
    url.includes('netlify.app') ||
    url.includes('vercel.app') ||
    url.includes('github.io') ||
    url.includes('surge.sh') ||
    url.includes('github.com')
  );
}

function parseStudentDetails(issueBody) {
  if (!issueBody) return null;

  const details = {
    name: null,
    website: null,
    socialLinks: []
  };

  // Extract student name
  const nameMatch = issueBody.match(/### Student Name\s*\n\s*(.*?)(?:\n|$)/i);
  if (nameMatch && nameMatch[1].trim() && !nameMatch[1].includes('_No response_')) {
    details.name = nameMatch[1].trim();
  }

  // Extract website URL
  const websiteMatch = issueBody.match(/### Website URL\s*\n\s*(https?:\/\/[^\s\n]+)/i);
  if (websiteMatch && websiteMatch[1].trim() && !websiteMatch[1].includes('_No response_')) {
    details.website = websiteMatch[1].trim();
  }

  // Extract social links
  const socialLinkPattern = /### Social Link \d+ \(Optional\)\s*\n\s*(.*?)(?:\n|$)/gi;
  let socialMatch;
  while ((socialMatch = socialLinkPattern.exec(issueBody)) !== null) {
    const socialLink = socialMatch[1].trim();
    if (socialLink && !socialLink.includes('_No response_') && socialLink.startsWith('http')) {
      details.socialLinks.push(socialLink);
    }
  }

  return details;
}


async function buildStudentDatabase(options = {}) {
  const { skipCommits = false, commitWeeks = 4 } = options;
  const repositories = [
    {
      name: 'web2025-dev-notes',
      url: 'https://github.com/open-making/web2025-dev-notes',
      type: 'dev-notes',
      description: 'Daily development notes and progress updates'
    },
    {
      name: 'web2025',
      url: 'https://github.com/open-making/web2025',
      type: 'submissions',
      description: 'Project submissions and student work'
    }
  ];

  const studentDatabase = {
    generatedAt: new Date().toISOString(),
    repositories: repositories.map(r => ({ name: r.name, type: r.type, description: r.description })),
    students: {},
    statistics: {
      totalIssues: 0,
      totalComments: 0,
      totalStudents: 0,
      dateRange: { earliest: null, latest: null }
    }
  };

  let allDates = [];

  for (const repo of repositories) {
    console.log(`\n🔍 Processing ${repo.name}...`);

    const urlParts = repo.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    const [, owner, repoName] = urlParts;

    const issues = await fetchAllIssues(repo.url);
    studentDatabase.statistics.totalIssues += issues.length;

    for (const issue of issues) {
      console.log(`📝 Processing issue #${issue.number}: ${issue.title}`);

      const issueDate = parseDate(issue.created_at);
      allDates.push(new Date(issue.created_at));

      // Process issue body if it exists (only for submission repos, not dev-notes)
      if (issue.body && issue.body.trim() && repo.type !== 'dev-notes') {
        const author = issue.user.login;

        // Skip specific users
        if (author === 'thedivtagguy') {
          continue;
        }

        const urls = extractUrls(issue.body);
        const studentDetails = parseStudentDetails(issue.body);

        if (!studentDatabase.students[author]) {
          studentDatabase.students[author] = {
            username: author,
            name: studentDetails?.name || author,
            website: studentDetails?.website || null,
            socialLinks: studentDetails?.socialLinks || [],
            devNotes: [],
            submissions: [],
            statistics: {
              totalNotes: 0,
              totalSubmissions: 0,
              totalCommits: 0,
              firstActivity: issueDate.iso,
              lastActivity: issueDate.iso,
              mostActiveDay: null
            },
            commitsByDate: {}
          };
        } else {
          // Update student details if we found them and they're not already set
          if (studentDetails?.name && !studentDatabase.students[author].name) {
            studentDatabase.students[author].name = studentDetails.name;
          }
          if (studentDetails?.website && !studentDatabase.students[author].website) {
            studentDatabase.students[author].website = studentDetails.website;
          }
          if (studentDetails?.socialLinks && studentDetails.socialLinks.length > 0 && studentDatabase.students[author].socialLinks.length === 0) {
            studentDatabase.students[author].socialLinks = studentDetails.socialLinks;
          }
        }

        const entry = {
          id: `${repo.type}-${issue.number}-issue`,
          type: 'issue-body',
          repository: repo.name,
          issueNumber: issue.number,
          issueTitle: issue.title,
          content: issue.body,
          urls: urls,
          wordCount: issue.body.split(/\s+/).length,
          date: issueDate,
          issueUrl: issue.html_url
        };

        if (repo.type === 'dev-notes') {
          studentDatabase.students[author].devNotes.push(entry);
          studentDatabase.students[author].statistics.totalNotes++;
        } else {
          studentDatabase.students[author].submissions.push(entry);
          studentDatabase.students[author].statistics.totalSubmissions++;
        }
      }

      // Fetch and process comments
      const comments = await fetchAllComments(owner, repoName, issue.number);
      studentDatabase.statistics.totalComments += comments.length;

      for (const comment of comments) {
        const author = comment.user.login;

        // Skip specific users
        if (author === 'thedivtagguy') {
          continue;
        }

        const commentDate = parseDate(comment.created_at);
        allDates.push(new Date(comment.created_at));

        if (comment.body && comment.body.trim()) {
          const urls = extractUrls(comment.body);

          if (!studentDatabase.students[author]) {
            studentDatabase.students[author] = {
              username: author,
              name: null, // Will be updated when we find student details from issue body
              website: null,
              socialLinks: [],
              devNotes: [],
              submissions: [],
              statistics: {
                totalNotes: 0,
                totalSubmissions: 0,
                totalCommits: 0,
                firstActivity: commentDate.iso,
                lastActivity: commentDate.iso,
                mostActiveDay: null
              },
              commitsByDate: {}
            };
          }

          const entry = {
            id: `${repo.type}-${issue.number}-comment-${comment.id}`,
            type: 'comment',
            repository: repo.name,
            issueNumber: issue.number,
            issueTitle: issue.title,
            commentId: comment.id,
            content: comment.body,
            urls: urls,
            wordCount: comment.body.split(/\s+/).length,
            date: commentDate,
            commentUrl: comment.html_url
          };

          if (repo.type === 'dev-notes') {
            studentDatabase.students[author].devNotes.push(entry);
            studentDatabase.students[author].statistics.totalNotes++;
          } else {
            studentDatabase.students[author].submissions.push(entry);
            studentDatabase.students[author].statistics.totalSubmissions++;
          }

          // Update student activity dates
          const student = studentDatabase.students[author];
          if (new Date(commentDate.iso) < new Date(student.statistics.firstActivity)) {
            student.statistics.firstActivity = commentDate.iso;
          }
          if (new Date(commentDate.iso) > new Date(student.statistics.lastActivity)) {
            student.statistics.lastActivity = commentDate.iso;
          }
        }
      }
    }
  }

  // Fetch commits for each student (if not skipped)
  if (!skipCommits) {
    console.log('\n💻 Fetching GitHub commits for all students...');
    const studentUsernames = Object.keys(studentDatabase.students).filter(username => username !== 'thedivtagguy');

    const commitPromises = studentUsernames.map(async (username, i) => {
      console.log(`\n👤 Processing commits for ${username} (${i + 1}/${studentUsernames.length})...`);

      try {
        const commits = await fetchUserCommits(username, { weeks: commitWeeks });
        studentDatabase.students[username].statistics.totalCommits = commits.length;

        // Update activity dates based on commits
        if (commits.length > 0) {
          const commitDates = commits.map(c => new Date(c.date.iso));
          const earliestCommit = new Date(Math.min(...commitDates));
          const latestCommit = new Date(Math.max(...commitDates));

          const currentFirst = new Date(studentDatabase.students[username].statistics.firstActivity);
          const currentLast = new Date(studentDatabase.students[username].statistics.lastActivity);

          if (earliestCommit < currentFirst) {
            studentDatabase.students[username].statistics.firstActivity = earliestCommit.toISOString();
          }
          if (latestCommit > currentLast) {
            studentDatabase.students[username].statistics.lastActivity = latestCommit.toISOString();
          }

          // Organize commits by date
          studentDatabase.students[username].commitsByDate = commits.reduce((acc, commit) => {
            const date = commit.date.date;
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push({
              message: commit.message,
              repository: commit.repository,
              time: commit.date.formatted
            });
            return acc;
          }, {});

          return { username, commitDates };
        }

        return { username, commitDates: [] };
      } catch (error) {
        console.error(`   ❌ Error fetching commits for ${username}: ${error.message}`);
        studentDatabase.students[username].statistics.totalCommits = 0;
        studentDatabase.students[username].commitsByDate = {};
        return { username, commitDates: [] };
      }
    });

    const results = await Promise.all(commitPromises);
    
    // Collect all commit dates for global statistics
    results.forEach(result => {
      if (result.commitDates.length > 0) {
        allDates.push(...result.commitDates);
      }
    });
  } else {
    console.log('\n⏭️  Skipping GitHub commits (--no-commits flag)');
  }

  // Calculate statistics
  studentDatabase.statistics.totalStudents = Object.keys(studentDatabase.students).length;
  studentDatabase.statistics.totalCommits = Object.values(studentDatabase.students)
    .reduce((total, student) => total + student.statistics.totalCommits, 0);

  if (allDates.length > 0) {
    allDates.sort((a, b) => a - b);
    studentDatabase.statistics.dateRange = {
      earliest: allDates[0].toISOString(),
      latest: allDates[allDates.length - 1].toISOString()
    };
  }

  // Sort each student's entries by date and calculate additional statistics
  for (const [username, student] of Object.entries(studentDatabase.students)) {
    student.devNotes.sort((a, b) => new Date(a.date.iso) - new Date(b.date.iso));
    student.submissions.sort((a, b) => new Date(a.date.iso) - new Date(b.date.iso));

    // Find most active day (including commits)
    const dayActivity = {};
    [...student.devNotes, ...student.submissions].forEach(entry => {
      const day = entry.date.date;
      dayActivity[day] = (dayActivity[day] || 0) + 1;
    });

    // Add commits to daily activity
    Object.keys(student.commitsByDate).forEach(date => {
      const commitCount = student.commitsByDate[date].length;
      dayActivity[date] = (dayActivity[date] || 0) + commitCount;
    });

    const mostActiveDay = Object.entries(dayActivity).reduce((max, [day, count]) =>
      count > max.count ? { day, count } : max, { day: null, count: 0 });

    student.statistics.mostActiveDay = mostActiveDay.day;
    student.statistics.totalEntries = student.devNotes.length + student.submissions.length;
    student.statistics.averageWordCount = student.statistics.totalEntries > 0
      ? Math.round([...student.devNotes, ...student.submissions]
          .reduce((sum, entry) => sum + entry.wordCount, 0) / student.statistics.totalEntries)
      : 0;

    // Commits are already organized by date during fetching
  }

  return studentDatabase;
}

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

async function saveStudentDatabase(database, outputDir = 'src/lib/data') {
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Load existing metadata files
  const metadataFiles = await loadMetadataFiles(outputDir);
  
  // Save complete database
  const fullDatabasePath = path.join(outputDir, 'student-database.json');
  await fs.writeFile(fullDatabasePath, JSON.stringify(database, null, 2));

  console.log(`📁 Complete database saved to: ${fullDatabasePath}`);

  // Save individual student files with matched metadata
  const studentsDir = path.join(outputDir, 'students');
  await fs.mkdir(studentsDir, { recursive: true });

  for (const [username, student] of Object.entries(database.students)) {
    // Match student with metadata files
    const metadataMatches = await matchStudentWithMetadata(student, metadataFiles);
    
    const studentPath = path.join(studentsDir, `${username}.json`);
    const studentData = {
      ...student,
      generatedAt: database.generatedAt,
      repositories: database.repositories,
      projectSubmissions: metadataMatches // Add matched metadata
    };

    await fs.writeFile(studentPath, JSON.stringify(studentData, null, 2));
  }

  console.log(`👥 Individual student files saved to: ${studentsDir}/`);

  // Save summary statistics
  const summaryPath = path.join(outputDir, 'database-summary.json');
  const summary = {
    generatedAt: database.generatedAt,
    statistics: database.statistics,
    repositories: database.repositories,
    studentList: Object.keys(database.students).sort(),
    topContributors: Object.entries(database.students)
      .map(([username, student]) => ({
        username,
        totalEntries: student.statistics.totalEntries,
        totalCommits: student.statistics.totalCommits,
        totalWords: [...student.devNotes, ...student.submissions]
          .reduce((sum, entry) => sum + entry.wordCount, 0),
        totalActivity: student.statistics.totalEntries + student.statistics.totalCommits
      }))
      .sort((a, b) => b.totalActivity - a.totalActivity)
      .slice(0, 10)
  };

  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`📊 Summary statistics saved to: ${summaryPath}`);

  return {
    fullDatabase: fullDatabasePath,
    studentsDirectory: studentsDir,
    summary: summaryPath
  };
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node build-student-database.js [options]

Options:
  --output-dir <dir>    Output directory (default: src/lib/data)
  --no-commits          Skip fetching GitHub commits (faster but less complete)
  --commit-weeks <num>  Number of weeks to look back for commits (default: 4)
  --help, -h            Show this help message

This script creates a comprehensive database of all student dev notes and submissions:
- src/lib/data/student-database.json (complete database)
- src/lib/data/students/[username].json (individual student files)
- src/lib/data/database-summary.json (statistics and overview)

The database will include:
- All dev notes from web2025-dev-notes repository
- All submissions from web2025 repository
- GitHub commits from last 4 weeks for each student
- Content organized by student and date
- URL extraction and content categorization
- Activity statistics and code contribution metrics

Examples:
  node build-student-database.js --output-dir src/lib/data
  node build-student-database.js --no-commits (faster, skip commit fetching)
  node build-student-database.js --commit-weeks 2 (last 2 weeks only)
    `);
    process.exit(0);
  }

  let outputDir = 'src/lib/data';
  let skipCommits = false;
  let commitWeeks = 4;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output-dir' && i + 1 < args.length) {
      outputDir = args[++i];
    } else if (args[i] === '--no-commits') {
      skipCommits = true;
    } else if (args[i] === '--commit-weeks' && i + 1 < args.length) {
      commitWeeks = parseInt(args[++i]);
    }
  }

  console.log('🗄️  Building comprehensive student database...\n');

  buildStudentDatabase({ skipCommits, commitWeeks })
    .then(database => {
      console.log('\n📊 Database Statistics:');
      console.log(`   • Total students: ${database.statistics.totalStudents}`);
      console.log(`   • Total issues: ${database.statistics.totalIssues}`);
      console.log(`   • Total comments: ${database.statistics.totalComments}`);
      console.log(`   • Total commits: ${database.statistics.totalCommits}`);
      console.log(`   • Date range: ${database.statistics.dateRange.earliest?.split('T')[0]} to ${database.statistics.dateRange.latest?.split('T')[0]}`);

      return saveStudentDatabase(database, outputDir);
    })
    .then(paths => {
      console.log('\n✅ Student database build complete!');
      console.log('   You can now use this data to create individual student pages.');
    })
    .catch(error => {
      console.error('❌ Failed to build student database:', error.message);
      console.error(error.stack);
      process.exit(1);
    });
}

export { buildStudentDatabase, saveStudentDatabase };