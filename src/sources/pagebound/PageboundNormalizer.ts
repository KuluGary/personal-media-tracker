import type { PageboundNormalizedBook, PageboundRawBook } from "./types";

/**
 * Transforms Pagebound API entities into canonical domain entities.
 */
export class PageboundNormalizer {
  /**
   * Converts a Pagebound book into the application's canonical book representation.
   */
  normalizeBooks(book: PageboundRawBook): PageboundNormalizedBook {
    return {
      kind: "book",
      title: book.title,

      source: "pagebound",
      externalId: book.edition_id ?? book.book_uuid,

      metadata: {
        author: book.author_name,
        description: undefined,
        publishedDate: undefined,
      },

    };
  }
}
