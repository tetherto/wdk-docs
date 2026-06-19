#!/usr/bin/env node

import fs from 'node:fs';

const sourceRepo = process.env.SOURCE_REPO || 'tetherto/wdk-wallet-solana-gasless';
const [owner, repo] = sourceRepo.split('/');

if (!owner || !repo) {
  console.error(`Invalid SOURCE_REPO value: ${sourceRepo}`);
  process.exit(2);
}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const headers = {
  accept: 'application/vnd.github+json',
  'user-agent': 'wdk-docs-source-watch',
  'x-github-api-version': '2022-11-28',
};

if (token) {
  headers.authorization = `Bearer ${token}`;
}

function escapeCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

async function requestJson(pathname) {
  const url = `https://api.github.com${pathname}`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}\n${body}`);
  }

  return await response.json();
}

async function listOpenPullRequests() {
  const pulls = [];

  for (let page = 1; ; page += 1) {
    const batch = await requestJson(
      `/repos/${owner}/${repo}/pulls?state=open&sort=updated&direction=desc&per_page=100&page=${page}`
    );

    pulls.push(...batch);

    if (batch.length < 100) {
      break;
    }
  }

  return pulls;
}

function renderReport(pulls) {
  const lines = [
    '# Solana Gasless Source Watch',
    '',
    `Source repository: \`${sourceRepo}\``,
    '',
  ];

  if (pulls.length === 0) {
    lines.push('No open source pull requests were found.');
    lines.push('');
    lines.push('The docs can be refreshed against the latest source before moving the docs PR out of draft.');
    return lines.join('\n');
  }

  lines.push(`Open source pull requests: ${pulls.length}`);
  lines.push('');
  lines.push('| PR | Title | Branch | Updated |');
  lines.push('|----|-------|--------|---------|');

  for (const pull of pulls) {
    lines.push(
      `| [#${pull.number}](${pull.html_url}) | ${escapeCell(pull.title)} | \`${escapeCell(pull.head.ref)}\` -> \`${escapeCell(pull.base.ref)}\` | ${escapeCell(pull.updated_at)} |`
    );
  }

  lines.push('');
  lines.push('Keep the docs PR in draft and refresh it after the source pull requests merge.');

  return lines.join('\n');
}

try {
  const pulls = await listOpenPullRequests();
  const report = renderReport(pulls);

  console.log(report);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`);
  }

  if (pulls.length > 0) {
    console.error(`Open pull requests remain in ${sourceRepo}.`);
    process.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}
