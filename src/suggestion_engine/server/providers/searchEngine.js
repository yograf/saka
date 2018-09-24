import { MAX_RESULTS } from './index.js';

export default async function searchEngineSuggestions(searchText) {
  try {
    const baseURL =
      'https://www.google.com/complete/search?client=chrome-omni&q=';
    const response = await fetch(`${baseURL}${encodeURIComponent(searchText)}`);
    const json = await response.json();
     return json[1].slice(0, MAX_RESULTS).map(result => ({
      type: 'searchEngine',
      score: undefined,
      title: result,
      url: 'https://www.google.co.il/search?q=' + result
    }));
  } catch (e) {
    return [];
  }
}
