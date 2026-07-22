import type { PageboundNormalizedBook, PageboundRawBook } from "./types";

export class PageboundNormalizer {
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
