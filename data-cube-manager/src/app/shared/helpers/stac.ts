export const collectionsByVersion = (data, version) => {
    const func = dictVersion[version]['collections']
    return func(data)
}

export const totalItemsByVersion = (data, version) => {
    const func = dictVersion[version]['totalItems']
    return func(data)
}

function version8collections(data) {
    const links = data['links']
    return links.filter(d => d.title).map(d => d.title)
}

function version8totalItems(data) {
    return data['numberMatched']
}

function version6_7collections(data) {
    const links = data['collections']
    return links.map(d => d.id)
}

function version6_7totalItems(data) {
    return data['meta']['found']
}

const dictVersion = {
    '0.8': {
        'collections': version8collections,
        'totalItems': version8totalItems
    },
    '0.7': {
        'collections': version6_7collections,
        'totalItems': version6_7totalItems
    },
    '0.6': {
        'collections': version6_7collections,
        'totalItems': version6_7totalItems
    }
}