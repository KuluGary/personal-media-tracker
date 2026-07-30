export function createDefaultConfiguration(url: string, serviceKey: string) {
  return `
    [database]
    url = "${url}"
    serviceKey = "${serviceKey}"

    [sources]

    # [sources.steam]
    # apiKey = ""
    # steamId = ""

    # [sources.tumblr]
    # consumerKey = ""
    # blogIdentifier = ""

    # ...
    `;
}
