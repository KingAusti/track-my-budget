const indexedDB = 
    window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

let db;
const request = indexedDB.open('budget', 1);
// trigger if database version changes
request.onupgradeneeded = ({ target }) => {
    // save reference to database
    db = target.result
    // create object store for transactions
    db.createObjectStore('pending', { autoIncrement: true })
}

request.onsuccess = ({ target }) => {
    db = target.result
    // check internet connection
    if (navigator.onLine) {
        // if connected, upload data
        checkDatabase()
    }
}
// trigger if there's an issue with the database
request.onerror = event => {
    console.log(event.target.errorCode)
}
// save transaction if no connection exists
const saveRecord = record => {
    // open new transaction
    const transaction = db.transaction(['pending'], 'readWrite')
    // access object store for 'new_transaction'
    const store = transaction.objectStore('pending')
    // add record to object store
    store.add(record)
}
// upload data once connection is restored
function checkDatabase() {
    const transaction = db.transaction(['pending'], 'readWrite')
    const store = transaction.objectStore('pending')
    // set all records from the store to a variable
    const getAll = store.getAll()
    getAll.onsuccess = () =>{
        if(getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(() => {
                const transaction = db.transaction(['pending'], 'readWrite')
                const store = transaction.objectStore('pending')
                // clear store
                store.clear()
            })
        }
    }
}
// listen for app coming online
window.addEventListener('online', checkDatabase);