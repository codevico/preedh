import bannedCards from './cards/banned.json'
import partnerCards from './cards/partner.json'
import commanderCards from './cards/commander.json'
import ubCards from './cards/ub.json'
import lotrCards from './cards/banned.json'

const bannedLookup = bannedCards.map(c => c.toLowerCase())
const parterLookup = partnerCards.map(c => c.toLowerCase())
const commanderLookup = commanderCards.map(c => c.toLowerCase())
const ubLookup = ubCards.map(c => c.toLowerCase())
const lotrLookup = lotrCards.map(c => c.toLowerCase())

const input = document.getElementById('input')
const results = document.getElementById('results')

function failIfPresent(card, list, reason) {
    if (list.includes(card)) {
        throw new Error(reason)
    }
}

function checkCard(card) {
    const realCardName = card.match(/(?:[\d]* )?(.*)/)[1]
    try {
        const lowercase = realCardName?.toLowerCase()
        failIfPresent(lowercase, bannedLookup, `it's banned in EDH`)
        failIfPresent(lowercase, parterLookup, `it has partner`)
        failIfPresent(lowercase, commanderLookup, `it references a commander`)
        failIfPresent(lowercase, ubLookup, `it's from Universes Beyond`)
        failIfPresent(lowercase, lotrLookup, `it's from the LOTR set`)
    } catch (error) {
        return {card: realCardName, reason: error.message}
    }
}

function checkCards(cards) {
    return cards.map(card => checkCard(card)).filter(error => error != null)
}

function decklistChanged() {
    const cards = [...new Set(input.value.split('\n'))].filter(card => !!card)
    if (cards.length > 0) {
        results.innerHTML = 'Calculating...'
        const errors = checkCards(cards)
        if (errors.length > 0) {
            results.innerHTML = ''
            for (const error of errors) {
                const li = results.appendChild(document.createElement('li'))
                const a = document.createElement('a')
                a.classList.add('invalid-card-link')
                a.innerText = error.card
                a.href = 'https://scryfall.com/search?' + new URLSearchParams({q: `!"${error.card}"`})
                a.target = '_blank'
                li.append(`The card `)
                li.append(a)
                li.append(` is invalid because ${error.reason}.`)
            }
        } else {
            results.innerHTML = `<span style="color:lightgreen;">All good!</span> Either your cards are all valid or they weren't found in our database.`
        }
    } else {
        results.innerHTML = 'Waiting for a decklist.<br><br>The format should be something like:<br><br>1 Counterspell<br>1 Lightning Bolt<br>1 Sol Ring<br>...and so on'
    }
}

for (const event of ['change', 'keyup', 'paste']) {
    input.addEventListener(event, decklistChanged)
}
decklistChanged()