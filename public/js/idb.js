const indexedDB = 
    window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

let db;
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = ({ target }) => {
    db = target.result
    db.createObjectStore('pending', { autoIncrement: true })
}

request.onsuccess = ({ target }) => {
    db = target.result
    if (navigator.onLine) {
        checkDatabase()
    }
}

request.onerror = event => {
    console.log(event.target.errorCode)
}

const saveRecord = record => {
    const transaction = db.transaction(['pending'], 'readWrite')
    const store = transaction.objectStore('pending')
    store.add(record)
}

function checkDatabase() {
    
}