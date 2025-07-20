import bannedCards from './cards/banned.json'
import partnerCards from './cards/partner.json'
import commanderCards from './cards/commander.json'
import ubCards from './cards/ub.json'
import metadata from './metadata.json'

const bannedLookup = bannedCards.map(c => c.toLowerCase())
const parterLookup = partnerCards.map(c => c.toLowerCase())
const commanderLookup = commanderCards.map(c => c.toLowerCase())
const ubLookup = ubCards.map(c => c.toLowerCase())

const input = document.getElementById('input')
const results = document.getElementById('results')

const inputUrl = document.getElementById('url')
const buttonPaste = document.getElementById('button-paste')
const buttonFetch = document.getElementById('button-fetch')

function failIfPresent(card, list, reason) {
    if (list.includes(card)) {
        return card
    }
}

function checkCard(card) {
    const realCardName = card.match(/(?:[\d]* )?(.*)/)[1]
    const lowercase = realCardName?.toLowerCase()
    for (const check of [
        [bannedCards, bannedLookup, `it's banned in EDH`],
        [partnerCards, parterLookup, `it has partner`],
        [commanderCards, commanderLookup, `it references a commander`],
        [ubCards, ubLookup, `it's from Universes Beyond`]
    ]) {
        if (check[1].includes(lowercase)) {
            return {card: check[0].find(card => card.toLowerCase() === lowercase) || lowercase, reason: check[2]}
        }
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

async function decklistUrlChanged() {
    const url = inputUrl.value.trim()
    input.value = ''
    decklistChanged()
    if (url) {
        const response = await fetch('https://tolom.me/api/decklist/' + url)
        const data = await response.json()
        input.value = data.join('\n')
        decklistChanged()
    }
}

buttonPaste.addEventListener('click', async() => {
    const text = await navigator.clipboard.readText()
    inputUrl.value = text
    decklistUrlChanged()
})

buttonFetch.addEventListener('click', decklistUrlChanged)

for (const event of ['change', 'keyup', 'paste']) {
    input.addEventListener(event, decklistChanged)
}

decklistChanged()

document.querySelector('.commit-hash').textContent = metadata.commit
document.querySelector('.last-update').textContent = metadata.date