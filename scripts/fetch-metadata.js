#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { cleanFilename } from './screenshot.js';

function parseGitHubUrl(url) {
  // Single issue: https://github.com/owner/repo/issues/123
  const issueMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)$/);
  if (issueMatch) {
    return {
      type: 'single_issue',
      owner: issueMatch[1],
      repo: issueMatch[2],
      issueNumber: issueMatch[3]
    };
  }
  
  // Repository issues: https://github.com/owner/repo/issues
  const repoMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/issues\/?$/);
  if (repoMatch) {
    return {
      type: 'repo_issues',
      owner: repoMatch[1],
      repo: repoMatch[2]
    };
  }
  
  throw new Error('Invalid GitHub URL. Expected format: https://github.com/owner/repo/issues/123 or https://github.com/owner/repo/issues');
}

async function fetchRepoIssuesMetadata(repoUrl, options = {}) {
  const { filterPattern = null, state = 'all', per_page = 100 } = options;
  
  const { owner, repo } = parseGitHubUrl(repoUrl);
  
  // Fetch all issues from the repository
  let allIssues = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const issuesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=${state}&per_page=${per_page}&page=${page}`);
    const issues = await issuesResponse.json();
    
    if (issues.length === 0) {
      hasMore = false;
    } else {
      allIssues = allIssues.concat(issues);
      page++;
    }
  }
  
  console.log(`Found ${allIssues.length} issues in ${owner}/${repo}`);
  
  const urlPattern = /https?:\/\/[^\s<>"\]]+/g;
  const entries = [];
  
  // Process each issue and its comments
  for (const issue of allIssues) {
    // Skip pull requests (they appear in issues API)
    if (issue.pull_request) continue;
    
    // Extract URLs from issue body
    if (issue.body) {
      const urls = issue.body.match(urlPattern) || [];
      for (const url of urls) {
        const cleanUrl = url.replace(/[.,;!?)\]_]*$/, '');
        const imageName = await cleanFilename(cleanUrl);
        entries.push({
          url: cleanUrl,
          author: issue.user.login,
          authorType: 'issue_author',
          issueNumber: issue.number,
          issueTitle: issue.title,
          issueUrl: issue.html_url,
          createdAt: issue.created_at,
          imageName: `${imageName}.webp`
        });
      }
    }
    
    // Fetch and process comments for this issue
    const commentsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issue.number}/comments`);
    const comments = await commentsResponse.json();
    
    for (const comment of comments) {
      const urls = comment.body.match(urlPattern) || [];
      for (const url of urls) {
        const cleanUrl = url.replace(/[.,;!?)\]_]*$/, '');
        const imageName = await cleanFilename(cleanUrl);
        entries.push({
          url: cleanUrl,
          author: comment.user.login,
          authorType: 'commenter',
          issueNumber: issue.number,
          issueTitle: issue.title,
          issueUrl: issue.html_url,
          commentUrl: comment.html_url,
          createdAt: comment.created_at,
          imageName: `${imageName}.webp`
        });
      }
    }
  }
  
  // Apply filter pattern if provided
  let filteredEntries = entries;
  if (filterPattern) {
    const pattern = new RegExp(filterPattern, 'i');
    filteredEntries = entries.filter(entry => pattern.test(entry.url));
  }
  
  // Deduplicate by URL
  const uniqueEntries = filteredEntries.filter((entry, index, self) => 
    index === self.findIndex(e => e.url === entry.url)
  );
  
  return {
    repository: {
      name: `${owner}/${repo}`,
      url: `https://github.com/${owner}/${repo}`,
      issueCount: allIssues.length
    },
    entries: uniqueEntries,
    stats: {
      totalUrls: entries.length,
      uniqueUrls: uniqueEntries.length,
      filteredUrls: filterPattern ? filteredEntries.length : entries.length,
      issuesProcessed: allIssues.length
    }
  };
}

async function fetchGitHubMetadata(githubUrl, options = {}) {
  const { filterPattern = null, includeIssueBody = true } = options;
  
  const parsed = parseGitHubUrl(githubUrl);
  
  if (parsed.type === 'repo_issues') {
    return await fetchRepoIssuesMetadata(githubUrl, options);
  }
  
  // Original single issue logic
  const { owner, repo, issueNumber } = parsed;
  
  // Fetch issue and comments
  const [issueResponse, commentsResponse] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`),
    fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`)
  ]);
  
  const issue = await issueResponse.json();
  const comments = await commentsResponse.json();
  
  const urlPattern = /https?:\/\/[^\s<>"\]]+/g;
  const entries = [];
  
  // Extract URLs from issue body if requested
  if (includeIssueBody && issue.body) {
    const urls = issue.body.match(urlPattern) || [];
    for (const url of urls) {
      const cleanUrl = url.replace(/[.,;!?)\]_]*$/, '');
      const imageName = await cleanFilename(cleanUrl);
      entries.push({
        url: cleanUrl,
        author: issue.user.login,
        authorType: 'issue_author',
        commentUrl: issue.html_url,
        createdAt: issue.created_at,
        title: issue.title,
        imageName: `${imageName}.webp`
      });
    }
  }
  
  // Extract URLs from comments
  for (const comment of comments) {
    const urls = comment.body.match(urlPattern) || [];
    for (const url of urls) {
      const cleanUrl = url.replace(/[.,;!?)\]_]*$/, '');
      const imageName = await cleanFilename(cleanUrl);
      entries.push({
        url: cleanUrl,
        author: comment.user.login,
        authorType: 'commenter',
        commentUrl: comment.html_url,
        createdAt: comment.created_at,
        title: issue.title,
        imageName: `${imageName}.webp`
      });
    }
  }
  
  // Apply filter pattern if provided
  let filteredEntries = entries;
  if (filterPattern) {
    const pattern = new RegExp(filterPattern, 'i');
    filteredEntries = entries.filter(entry => pattern.test(entry.url));
  }
  
  // Deduplicate by URL
  const uniqueEntries = filteredEntries.filter((entry, index, self) => 
    index === self.findIndex(e => e.url === entry.url)
  );
  
  return {
    issue: {
      title: issue.title,
      url: issue.html_url,
      author: issue.user.login,
      createdAt: issue.created_at
    },
    entries: uniqueEntries,
    stats: {
      totalUrls: entries.length,
      uniqueUrls: uniqueEntries.length,
      filteredUrls: filterPattern ? filteredEntries.length : entries.length
    }
  };
}

async function saveMetadata(issueUrl, outputName, options = {}) {
  const result = await fetchGitHubMetadata(issueUrl, options);
  
  // Ensure data directory exists
  await fs.mkdir('src/lib/data', { recursive: true });
  
  // Save as JSON to src/lib/data
  const metadataFile = path.join('src/lib/data', `${outputName}-metadata.json`);
  await fs.writeFile(metadataFile, JSON.stringify(result, null, 2));
  
  // Also save URLs as text for the screenshot script (in root for convenience)
  const urlsFile = `${outputName}.txt`;
  const urls = result.entries.map(entry => entry.url).join('\n');
  await fs.writeFile(urlsFile, urls);
  
  if (result.issue) {
    console.log(`📋 Issue: ${result.issue.title}`);
  } else if (result.repository) {
    console.log(`📂 Repository: ${result.repository.name} (${result.stats.issuesProcessed} issues)`);
  }
  
  console.log(`🔗 Found ${result.stats.uniqueUrls} unique URLs (${result.stats.totalUrls} total):`);
  result.entries.forEach(entry => {
    const type = entry.authorType === 'issue_author' ? '👑' : '💬';
    const issueInfo = entry.issueNumber ? ` [#${entry.issueNumber}]` : '';
    console.log(`  ${type} ${entry.url} by ${entry.author}${issueInfo}`);
  });
  
  console.log(`\n📁 Files saved:`);
  console.log(`  - ${metadataFile} (full metadata)`);
  console.log(`  - ${urlsFile} (URLs only)`);
  
  return result;
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: node fetch-metadata.js [options] <github-url> [output-name]

Arguments:
  github-url          GitHub URL - either:
                      • Single issue: https://github.com/owner/repo/issues/123
                      • All repo issues: https://github.com/owner/repo/issues
  output-name         Base name for output files (default: extracted from repo name)

Options:
  --filter <pattern>  Filter URLs by regex pattern (case-insensitive)
  --no-issue-body     Don't extract URLs from issue body, only comments
  --state <state>     Issue state for repo mode: open, closed, all (default: all)

Examples:
  # Single issue with all URLs/comments
  node fetch-metadata.js https://github.com/open-making/web2025-hey-jude/issues/1
  
  # All issues in a repository  
  node fetch-metadata.js https://github.com/open-making/web2025-short-stories/issues
  
  # Filter URLs and custom output name
  node fetch-metadata.js --filter "netlify" https://github.com/owner/repo/issues my-project
    `);
    process.exit(1);
  }

  let options = {
    filterPattern: null,
    includeIssueBody: true,
    state: 'all'
  };
  
  let issueUrl = null;
  let outputName = null;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--filter' && i + 1 < args.length) {
      options.filterPattern = args[++i];
    } else if (arg === '--state' && i + 1 < args.length) {
      options.state = args[++i];
    } else if (arg === '--no-issue-body') {
      options.includeIssueBody = false;
    } else if (arg.includes('github.com') && arg.includes('/issues')) {
      issueUrl = arg;
    } else if (!outputName && !arg.startsWith('--')) {
      outputName = arg;
    }
  }
  
  if (!issueUrl) {
    console.error('❌ No GitHub issue URL provided');
    process.exit(1);
  }
  
  // Generate output name from repo if not provided
  if (!outputName) {
    try {
      const { repo } = parseGitHubUrl(issueUrl);
      outputName = repo;
    } catch (error) {
      outputName = 'github-metadata';
    }
  }

  saveMetadata(issueUrl, outputName, options).catch(console.error);
}

export { fetchGitHubMetadata, saveMetadata, parseGitHubUrl };