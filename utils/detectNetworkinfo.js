function detectNetworkInfo(line) {
    let hasNetworkInfo = false

    if (!line || typeof line !== "string") {
        return false
    }

    // Domain pattern - matches common domain names
    // Supports: example.com, sub.example.co.uk, localhost, etc.
    const domainPattern = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/gi

    // IPv4 pattern
    const ipv4Pattern =
        /\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g

    // IPv6 pattern (simplified)
    const ipv6Pattern = /(?:[a-f0-9]{1,4}:){7}[a-f0-9]{1,4}|::1|(?:[a-f0-9]{1,4}:){1,7}:|:(?::[a-f0-9]{1,4}){1,7}/gi

    // Find domains
    const domainMatches = line.match(domainPattern)
    if (domainMatches) {
        hasNetworkInfo = true
    }

    // Find IPv4 addresses
    const ipv4Matches = line.match(ipv4Pattern)
    if (ipv4Matches) {
        hasNetworkInfo = true
    }

    // Find IPv6 addresses
    const ipv6Matches = line.match(ipv6Pattern)
    if (ipv6Matches) {
        hasNetworkInfo = true
    }

    return hasNetworkInfo
}

module.exports = detectNetworkInfo
