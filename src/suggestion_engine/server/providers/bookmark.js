// https://github.com/nwjs/chromium.src/blob/45886148c94c59f45f14a9dc7b9a60624cfa626a/components/omnibox/browser/bookmark_provider.cc
export default async function bookmarkSuggestions (searchText) {
  const searchCriteria = searchText === '' ? {} : searchText;
  const results = await browser.bookmarks.search(searchCriteria);
  return results
    .map(({ url, title, dateAdded }) => ({
      type: 'bookmark',
      score: -1,
      title,
      url
    }));
}
