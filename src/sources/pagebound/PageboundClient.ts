import type { PageboundRawBook, PageboundUserBooksResponse } from "./types";

/**
 * Provides methods to interact with the Pagebound Web API for user and book data.
 */
export class PageboundClient {
  /**
   * Create a new Pagebound API Client.
   * @param userId Pagebound user identifier
   */
  constructor(
    private userId: string,
  ) { }

  /**
   * Fetches all books from the configured user's "finished" list.
   * Internally paginates through the Pagebound API until all books have been retrieved.
   */
  async fetchFinishedBooks(): Promise<PageboundRawBook[]> {
    const url = `https://prod-pagebound-api.onrender.com/api/v1/users/${this.userId}/user_books?status=finished&page=<PAGE>&sort_by=title&asc=true`;

    return this.fetchBooks(url);
  }

  /**
   * Fetches all books from the configured user's "current" list.
   * Internally paginates through the Pagebound API until all books have been retrieved.
   */
  async fetchCurrentBooks(): Promise<PageboundRawBook[]> {
    const url = `https://prod-pagebound-api.onrender.com/api/v1/users/${this.userId}/user_books?status=current&page=<PAGE>&sort_by=title&asc=true`;

    return this.fetchBooks(url);
  }

  /**
   * Fetches all books from the configured user's "to be read" list.
   * Internally paginates through the Pagebound API until all books have been retrieved.
   */
  async fetchToBeReadBooks(): Promise<PageboundRawBook[]> {
    const url = `https://prod-pagebound-api.onrender.com/api/v1/users/${this.userId}/user_books?status=tbr&page=<PAGE>&sort_by=title&asc=true`;

    return this.fetchBooks(url);
  }

  /**
   * Verifies that the configured user exists and that the API credentials are valid.
   */
  async validate() {
    await this.fetchUser();
  }

  /**
   * Retrieves metadata for the configured user.
   * Throws if the user does not exist or the API request fails.
   */
  private async fetchUser(): Promise<unknown> {
    const url = `https://prod-pagebound-api.onrender.com/api/v1/users/${this.userId}`;

    const res = await fetch(url);

    if (!res.ok)
      throw new Error(`Can't connect to Pagebound`);

    const json = await res.json();

    return json;
  }

  /**
   * Retrieves books from a given list for a specific user.
   * Internally paginates through the Pagebound API until all books have been retrieved.
   */
  private async fetchBooks(baseUrl: string): Promise<PageboundRawBook[]> {
    let hasMore = true;
    let currentPage = 1;

    const allData: PageboundRawBook[] = [];

    while (hasMore) {
      const url = baseUrl.replace("<PAGE>", currentPage.toString());

      const res = await fetch(url);

      if (!res.ok)
        throw new Error(`Pagebound fetch Error: ${res.status}`);

      const json = (await res.json()) as PageboundUserBooksResponse;

      allData.push(...json.user_books);

      currentPage++;
      hasMore = currentPage < json.total_pages;
    }

    return allData;
  }
}
