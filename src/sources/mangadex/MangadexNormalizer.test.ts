import { describe, expect, it } from "vitest";

import { MangaDexNormalizer } from "./MangaDexNormalizer";

describe("mangadex normalizer", () => {
  const normalizer = new MangaDexNormalizer();

  it("normalizes manga into canonical manga entities", () => {
    const result = normalizer.normalizeManga({
      id: "90f33e51-c6e9-4d8f-8f6d-a461b954ac0a",
      type: "manga",
      attributes: {
        title: {
          en: "Kingdom Hearts: Chain of Memories",
        },
        altTitles: [
          {
            ja: "キングダム ハーツ チェイン オブ メモリーズ",
          },
        ],
        description: {
          en: "The door to Kingdom Hearts was sealed, dealing a blow to the heartless and restoring the worlds to normal, but Riku and King Mickey were trapped inside! Now Sora, Donald, and Goofy's search for their friends leads them to the mysterious Castle Oblivion, where a hooded figure tells them, \"Ahead lies something you need, but to claim it, you must lose something dear.\" What could be more dear than their very memories themselves? And what do the shadowy members of Organization XIII want with them?",
        },
        isLocked: false,
        links: {
          al: "30397",
          ap: "kingdom-hearts-chain-of-memories",
          kt: "899",
          mu: "0jxg5o7",
          mal: "397",
        },
        originalLanguage: "ja",
        lastVolume: "2",
        lastChapter: "13",
        publicationDemographic: "shounen",
        status: "completed",
        year: 2005,
        contentRating: "safe",
        tags: [
          {
            id: "07251805-a27e-4d59-b488-f0bfbec15168",
            type: "tag",
            attributes: {
              name: {
                en: "Thriller",
              },
              group: "genre",
            },
          },
          {
            id: "36fd93ea-e8b8-445e-b836-358f02b3d33d",
            type: "tag",
            attributes: {
              name: {
                en: "Monsters",
              },
              group: "theme",
            },
          },
          {
            id: "391b0423-d847-456f-aff0-8b0cfc03066b",
            type: "tag",
            attributes: {
              name: {
                en: "Action",
              },
              group: "genre",
            },
          },
          {
            id: "39730448-9a5f-48a2-85b0-a70db87b1233",
            type: "tag",
            attributes: {
              name: {
                en: "Demons",
              },
              group: "theme",
            },
          },
          {
            id: "3de8c75d-8ee3-48ff-98ee-e20a65c86451",
            type: "tag",
            attributes: {
              name: {
                en: "Animals",
              },
              group: "theme",
            },
          },
          {
            id: "4d32cc48-9f00-4cca-9b5a-a839f0764984",
            type: "tag",
            attributes: {
              name: {
                en: "Comedy",
              },
              group: "genre",
            },
          },
          {
            id: "87cc87cd-a395-47af-b27a-93258283bbc6",
            type: "tag",
            attributes: {
              name: {
                en: "Adventure",
              },
              group: "genre",
            },
          },
          {
            id: "9438db5a-7e2a-4ac0-b39e-e0d95a34b8a8",
            type: "tag",
            attributes: {
              name: {
                en: "Video Games",
              },
              group: "theme",
            },
          },
          {
            id: "a1f53773-c69a-4ce5-8cab-fffcd90b1565",
            type: "tag",
            attributes: {
              name: {
                en: "Magic",
              },
              group: "theme",
            },
          },
          {
            id: "b9af3a63-f058-46de-a9a0-e0c13906197a",
            type: "tag",
            attributes: {
              name: {
                en: "Drama",
              },
              group: "genre",
            },
          },
          {
            id: "cdc58593-87dd-415e-bbc0-2ec27bf404cc",
            type: "tag",
            attributes: {
              name: {
                en: "Fantasy",
              },
              group: "genre",
            },
          },
          {
            id: "e5301a23-ebd9-49dd-a0cb-2add944c7fe9",
            type: "tag",
            attributes: {
              name: {
                en: "Slice of Life",
              },
              group: "genre",
            },
          },
          {
            id: "eabc5b4c-6aff-42f3-b657-3e90cbd00b75",
            type: "tag",
            attributes: {
              name: {
                en: "Supernatural",
              },
              group: "theme",
            },
          },
          {
            id: "ee968100-4191-4968-93d3-f82d72be7e46",
            type: "tag",
            attributes: {
              name: {
                en: "Mystery",
              },
              group: "genre",
            },
          },
          {
            id: "f4122d1c-3b44-44d0-9936-ff7502c39ad3",
            type: "tag",
            attributes: {
              name: {
                en: "Adaptation",
              },
              group: "format",
            },
          },
          {
            id: "f8f62932-27da-4fe4-8ee1-6779a8c5edba",
            type: "tag",
            attributes: {
              name: {
                en: "Tragedy",
              },
              group: "genre",
            },
          },
        ],
        state: "published",
        createdAt: "2018-03-01T13:35:38+00:00",
        updatedAt: "2025-11-15T17:16:08+00:00",
        version: 10,
      },
      relationships: [
        {
          id: "76b3e44b-a288-4c88-a713-7ffd338b8122",
          type: "author",

        },
        {
          id: "274a3bb7-11de-4a99-aeb4-6878556a27ee",
          type: "artist",

        },
        {
          id: "a2f746b6-0cab-427f-b9c1-00621f1c72c1",
          type: "cover_art",

        },
        {
          id: "28b9bf3a-9481-4d59-a20f-e4538a356bc0",
          type: "manga",
        },
        {
          id: "2e0d9aa4-e652-4cdc-8d64-b87a74a62d29",
          type: "manga",

        },
        {
          id: "a741a7fe-5b79-4f1a-b430-da93db374839",
          type: "manga",
        },
        {
          id: "c487f9a2-4b94-4847-bb4a-0f42e675298b",
          type: "manga",

        },
      ],
    });

    expect(result).toEqual({
      kind: "manga",
      title: "Kingdom Hearts: Chain of Memories",
      source: "mangadex",
      externalId: "90f33e51-c6e9-4d8f-8f6d-a461b954ac0a",
      metadata: {
        description: "The door to Kingdom Hearts was sealed, dealing a blow to the heartless and restoring the worlds to normal, but Riku and King Mickey were trapped inside! Now Sora, Donald, and Goofy's search for their friends leads them to the mysterious Castle Oblivion, where a hooded figure tells them, \"Ahead lies something you need, but to claim it, you must lose something dear.\" What could be more dear than their very memories themselves? And what do the shadowy members of Organization XIII want with them?",
        lastChapter: "13",
        year: 2005,
        contentRating: "safe",
      },
    });
  });
});
