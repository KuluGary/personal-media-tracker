import { describe, expect, it } from "vitest";

import { FreshRSSNormalizer } from "./FreshRssNormalizer";

describe("freshrss normalizer", () => {
  const normalizer = new FreshRSSNormalizer();

  it("normalizes blog post into canonical blog post entities", () => {
    const result = normalizer.normalizeBlogPost({
      id: "tag:google.com,2005:reader/item/00064d0355f43ce0",
      crawlTimeMsec: "1773526582574",
      timestampUsec: "1773526582574304",
      published: 1721347200,
      title: "Fit-to-Width Text: A New Technique",
      canonical: [
        {
          href: "https://kizu.dev/fit-to-width/",
        },
      ],
      alternate: [
        {
          href: "https://kizu.dev/fit-to-width/",
        },
      ],
      categories: [
        "user/-/state/com.google/reading-list",
        "user/-/label/Blogs",
        "user/-/state/com.google/read",
        "user/-/state/com.google/starred",
      ],
      origin: {
        streamId: "feed/78",
        htmlUrl: "https://kizu.dev/",
        title: "Articles ＆ Experiments by Roman Komarov",
      },
      summary: {
        content: "Registered custom properties are now available in all modern browsers. Using some pre-existing techniques based on them and complex container query length units, I solved a years-long problem of fitting text to the width of a container, hopefully paving the path towards a proper native implementation.<p><a href=\"https://kizu.dev/fit-to-width/\">Read the full article on kizu.dev</a></p>",
      },
    });

    expect(result).toEqual({
      kind: "blog_post",
      title: "Fit-to-Width Text: A New Technique",
      source: "freshrss",
      externalId: "tag:google.com,2005:reader/item/00064d0355f43ce0",

      metadata: {
        url: "https://kizu.dev/fit-to-width/",
        author: "https://kizu.dev/",
        published: "1721347200",
        summary: "Registered custom properties are now available in all modern browsers. Using some pre-existing techniques based on them and complex container query length units, I solved a years-long problem of fitting text to the width of a container, hopefully paving the path towards a proper native implementation.<p><a href=\"https://kizu.dev/fit-to-width/\">Read the full article on kizu.dev</a></p>",
        categories: [
          "user/-/state/com.google/reading-list",
          "user/-/label/Blogs",
          "user/-/state/com.google/read",
          "user/-/state/com.google/starred",
        ],
        feedId: "feed/78",
        feedTitle: "Articles ＆ Experiments by Roman Komarov",
      },
    });
  });

  it("normalizes blogs into canonical blog entities", () => {
    const result = normalizer.normalizeBlog({
      id: "feed/64",
      title: "anderegg.ca",
      categories: [
        {
          id: "user/-/label/Blogs",
          label: "Blogs",
        },
      ],
      htmlUrl: "https://anderegg.ca/",
    });

    expect(result).toEqual({
      kind: "blog",
      title: "anderegg.ca",
      source: "freshrss",
      externalId: "feed/64",
      metadata: {
        url: "https://anderegg.ca/",
        categories: ["Blogs"],
      },
    });
  });
});
