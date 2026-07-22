import { describe, expect, it } from "vitest";

import { PageboundNormalizer } from "./PageboundNormalizer";

describe("pagebound normalizer", () => {
  const normalizer = new PageboundNormalizer();

  it("normalizes books into canonical book entities", () => {
    const result = normalizer.normalizeBooks({
      id: 26211832,
      uuid: "770be5fc-8e8c-4b6a-81d5-0402d5714071",
      book_id: 251,
      status: "finished",
      progress: 0,
      current_page: null,
      current_minute: null,
      total_minutes: null,
      title: "1984",
      author_name: "George Orwell",
      author_uuid: "0d94ed84-02a3-48a4-ae38-5b9e44facf6e",
      scheduled_for_year: null,
      scheduled_for_month: null,
      priority: null,
      image_url: "https://cdn.pagebound.co/books/7a13703c-2556-4952-b0a0-8014b10bcfb3_v1/temp.jpg",
      book_uuid: "7a13703c-2556-4952-b0a0-8014b10bcfb3",
      total_page_count: null,
      has_ever_finished: true,
      date_added: "12/28/17",
      dates_read: null,
      dates_read_copy: "Read 1x",
      edition_id: null,
      muted: false,
      owned: true,
      current_reading_instance: null,
      has_reading_updates: false,
      review: {
        id: 9108945,
        uuid: "17556864-23ae-47c2-9cdd-1edb59413735",
        overall_rating: "5.0",
        plot_rating: "5.0",
        character_rating: "5.0",
        quality_rating: "5.0",
        entertainment_rating: "5.0",
        audiobook_rating: null,
        emojis: [
        ],
        review: "Classic dystopia. With all of it's imperfections, I love it. I think it you like this genre, this is a must read for sure. ",
        user_id: 114369,
        username: "Eli-Aleth",
        user_image_url: "/assets/wizard.png",
        book_id: 251,
        is_dnf: false,
        is_spoiler: false,
        is_flagged: false,
        is_edited: true,
        upvotes: 0,
        is_liked: false,
        comment_count: 0,
        created_at: "Jan 08, 2026",
        user_is_paid_subscriber: false,
        is_blocked: false,
        is_publisher: false,
      },
      shelves: [
      ],
      reading_instances: [
        {
          id: 12471610,
          started_reading_at: null,
          finished_reading_at: null,
          finished: true,
          challenge_year: null,
          current: false,
          total_page_count: null,
          total_minutes: null,
          format: "print",
          tracking_mode: "pages",
          started_reading_at_date: null,
          finished_reading_at_date: null,
          book: null,
          user_book_id: 26211832,
          author_name: null,
          current_user_book: null,
          review: null,
          has_reading_updates: false,
          progress_method: null,
        },
      ],
    });

    expect(result).toEqual({
      kind: "book",
      title: "1984",
      source: "pagebound",
      externalId: "7a13703c-2556-4952-b0a0-8014b10bcfb3",
      metadata: {
        author: "George Orwell",
        description: undefined,
        publishedDate: undefined,
      },
    });
  });
});
