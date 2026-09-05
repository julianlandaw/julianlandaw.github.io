document.querySelectorAll('[data-current-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

const search = document.querySelector('#publication-search');
if (search) {
  const year = document.querySelector('#publication-year');
  const papers = [...document.querySelectorAll('.publication')];
  const status = document.querySelector('#results-status');
  const filter = () => {
    const words = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let count = 0;
    papers.forEach(paper => {
      paper.hidden = !(words.every(word => paper.textContent.toLowerCase().includes(word)) && (!year.value || paper.dataset.year === year.value));
      if (!paper.hidden) count++;
    });
    document.querySelectorAll('.pub-group').forEach(group => { group.hidden = !group.querySelector('.publication:not([hidden])'); });
    status.textContent = `${count} of ${papers.length} works shown`;
    document.querySelector('#no-results').hidden = count > 0;
  };
  document.querySelector('.filter-bar').hidden = false;
  search.addEventListener('input', filter);
  year.addEventListener('change', filter);
  const revealHash = () => {
    const paper = papers.find(p => `#${p.id}` === location.hash);
    if (paper) { search.value = ''; year.value = ''; filter(); paper.scrollIntoView(); }
  };
  window.addEventListener('hashchange', revealHash);
  filter();
  if (location.hash) revealHash();
}
