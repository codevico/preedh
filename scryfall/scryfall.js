const fs = require('fs')

const MILLISECONDS_DELAY = 100

const HEADERS = {
    'User-Agent': 'PREEdhApp/1.0',
    'Accept': '*/*'
}

async function fetchCards(query) {
    console.log('fetching', query)
    let page = 0
    let hasMore = true
    let cards = []
    while (hasMore) {
        console.log('fetching', page)
        const response = await fetch('https://api.scryfall.com/cards/search?' + new URLSearchParams({
            q: query,
            page: page
        }), { headers: HEADERS })
        const json = await response.json()
        cards = cards.concat(json.data.map(card => card.name))
        hasMore = json.has_more
        page += 1
        await new Promise(resolve => setTimeout(resolve, MILLISECONDS_DELAY))
    }
    console.log('found', cards.length, 'cards')
    return cards
}

async function fetchAndSave(query, filename) {
    const cards = await fetchCards(query)
    fs.writeFileSync(filename, JSON.stringify(cards))
}

async function fetchAll() {
    await fetchAndSave('banned:edh', 'cards/banned.json')
    await fetchAndSave('f:edh kw:partner', 'cards/partner.json')
    await fetchAndSave('f:edh (o:"your commander" or o:"a commander" or o:"color identity")', 'cards/commander.json')
    await fetchAndSave('f:edh is:ub -is:reprint', 'cards/ub.json')
}

fetchAll()