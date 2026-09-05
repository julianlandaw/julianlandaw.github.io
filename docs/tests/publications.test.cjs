const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'assets/js/site.js'), 'utf8');

test('page initialization preserves publication content and filters by publication year', () => {
  const html = fs.readFileSync(path.join(root, 'publications.html'), 'utf8');
  const papers = [...html.matchAll(/<article class="publication" id="([^"]+)" data-year="([^"]+)">([\s\S]*?)<\/article>/g)].map(([, id, year, content]) => ({
    id, dataset: { year }, hidden: false,
    get textContent() { return content.replace(/<[^>]*>/g, ' '); },
    set textContent(value) { throw new Error(`Publication ${id} was overwritten with ${value}`); },
  }));
  assert.equal(papers.length, 11);
  const footer = { textContent: '2026' };
  const search = { value: '', addEventListener(event, callback) { this[event] = callback; } };
  const year = { value: '', addEventListener(event, callback) { this[event] = callback; } };
  const status = {};
  const empty = {};
  const selectors = { '#publication-search': search, '#publication-year': year, '#results-status': status, '#no-results': empty, '.filter-bar': {} };
  const groups = [[...papers.slice(0, 9)], [papers[9]], [papers[10]]].map(entries => ({
    querySelector() { return entries.find(paper => !paper.hidden) || null; },
  }));
  vm.runInNewContext(script, {
    document: {
      querySelector: selector => selectors[selector],
      querySelectorAll(selector) {
        if (selector === '.publication') return papers;
        if (selector === '.pub-group') return groups;
        // Match both attributes so a return to the old selector reproduces the bug.
        if (selector === '[data-year]') return papers;
        if (selector === '[data-current-year]') {
          assert.match(html, /<span data-current-year>/);
          return [footer];
        }
        throw new Error(`Unexpected selector: ${selector}`);
      },
    },
    window: { addEventListener() {} }, location: { hash: '' }, Date,
  });
  assert.equal(footer.textContent, new Date().getFullYear());
  assert.equal(status.textContent, '11 of 11 works shown');
  assert.ok(groups.every(group => !group.hidden));
  year.value = '2019'; year.change();
  assert.deepEqual(papers.filter(paper => !paper.hidden).map(paper => paper.id), ['pub4', 'pub9']);
  year.value = ''; search.value = 'dissertation'; search.input();
  assert.deepEqual(papers.filter(paper => !paper.hidden).map(paper => paper.id), ['pub9']);
  search.value = 'nonexistent-publication'; search.input();
  assert.equal(empty.hidden, false);
  search.value = ''; search.input();
  assert.equal(status.textContent, '11 of 11 works shown');
  assert.ok(groups.every(group => !group.hidden));
});

test('both pages reserve the current-year marker for the footer', () => {
  for (const file of ['index.html', 'publications.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.equal((html.match(/data-current-year/g) || []).length, 1);
    assert.match(html, /<footer[\s\S]*<span data-current-year>/);
  }
});
