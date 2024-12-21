// Theme logic
const css = {
    day: { dark: '10, 10, 20', light: '255, 255, 255' },
    night: { dark: '255, 255, 255', light: '10, 10, 20' },
  };
  
  const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
  document.documentElement.style.setProperty('--color-dark', css[theme].dark);
  document.documentElement.style.setProperty('--color-light', css[theme].light);
  
  // Constants
  const BOOKS_PER_PAGE = 36;
  let matches = books;
  let page = 1;
  
  // Validate inputs
  if (!books || !Array.isArray(books)) throw new Error('Source required');
  if (!range || range.length < 2) throw new Error('Range must be an array with two numbers');
  
  // Render book previews
  const fragment = document.createDocumentFragment();
  const extracted = books.slice(0, BOOKS_PER_PAGE);
  
  for (const { author, image, title, id } of extracted) {
    const preview = createPreview({ author, id, image, title });
    fragment.appendChild(preview);
  }
  
  document.querySelector('[data-list-items]').appendChild(fragment);
  
  // Populate genres
  const genreFragment = document.createDocumentFragment();
  let element = document.createElement('option');
  element.value = 'any';
  element.innerText = 'All Genres';
  genreFragment.appendChild(element);
  
  for (const [id, name] of Object.entries(genres)) {
    element = document.createElement('option');
    element.value = id;
    element.innerText = name;
    genreFragment.appendChild(element);
  }
  
  document.querySelector('[data-search-genres]').appendChild(genreFragment);
  
  // Populate authors
  const authorFragment = document.createDocumentFragment();
  element = document.createElement('option');
  element.value = 'any';
  element.innerText = 'All Authors';
  authorFragment.appendChild(element);
  
  for (const [id, name] of Object.entries(authors)) {
    element = document.createElement('option');
    element.value = id;
    element.innerText = name;
    authorFragment.appendChild(element);
  }
  
  document.querySelector('[data-search-authors]').appendChild(authorFragment);
  
  // Show more button logic
  const updateShowMoreButton = () => {
    const remaining = matches.length - page * BOOKS_PER_PAGE;
    const button = document.querySelector('[data-list-button]');
    button.disabled = remaining <= 0;
    button.innerHTML = `
      <span>Show more</span>
      <span class="list__remaining">(${remaining > 0 ? remaining : 0})</span>
    `;
  };
  
  updateShowMoreButton();
  
  // Event listeners
  document.querySelector('[data-list-button]').addEventListener('click', () => {
    const start = page * BOOKS_PER_PAGE;
    const end = start + BOOKS_PER_PAGE;
    const fragment = document.createDocumentFragment();
    const extracted = matches.slice(start, end);
  
    for (const { author, image, title, id } of extracted) {
      const preview = createPreview({ author, id, image, title });
      fragment.appendChild(preview);
    }
  
    document.querySelector('[data-list-items]').appendChild(fragment);
    page += 1;
    updateShowMoreButton();
  });
  
  document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true;
    document.querySelector('[data-search-title]').focus();
  });
  
  document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false;
  });
  
  document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false;
  });
  
  document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const result = Object.fromEntries(formData);
  
    document.documentElement.style.setProperty('--color-dark', css[result.theme].dark);
    document.documentElement.style.setProperty('--color-light', css[result.theme].light);
    document.querySelector('[data-settings-overlay]').open = false;
  });
  
  document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = [];
  
    for (const book of books) {
      const titleMatch = !filters.title.trim() || book.title.toLowerCase().includes(filters.title.toLowerCase());
      const authorMatch = filters.author === 'any' || book.author === filters.author;
      let genreMatch = filters.genre === 'any';
  
      if (!genreMatch) {
        genreMatch = book.genres.includes(filters.genre);
      }
  
      if (titleMatch && authorMatch && genreMatch) {
        result.push(book);
      }
    }
  
    matches = result;
    page = 1;
  
    const listMessage = document.querySelector('[data-list-message]');
    if (matches.length < 1) {
      listMessage.classList.add('list__message_show');
    } else {
      listMessage.classList.remove('list__message_show');
    }
  
    const fragment = document.createDocumentFragment();
    const extracted = matches.slice(0, BOOKS_PER_PAGE);
  
    for (const { author, image, title, id } of extracted) {
      const preview = createPreview({ author, id, image, title });
      fragment.appendChild(preview);
    }
  
    document.querySelector('[data-list-items]').innerHTML = '';
    document.querySelector('[data-list-items]').appendChild(fragment);
    updateShowMoreButton();
    document.querySelector('[data-search-overlay]').open = false;
  });
  
  document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = event.composedPath();
    let active;
  
    for (const node of pathArray) {
      if (active) break;
      const previewId = node?.dataset?.preview;
  
      if (previewId) {
        active = books.find((book) => book.id === previewId);
      }
    }
  
    if (!active) return;
  
    const listActive = document.querySelector('[data-list-active]');
    listActive.open = true;
    document.querySelector('[data-list-blur]').src = active.image;
    document.querySelector('[data-list-image]').src = active.image;
    document.querySelector('[data-list-title]').innerText = active.title;
    document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
    document.querySelector('[data-list-description]').innerText = active.description;
  });
  