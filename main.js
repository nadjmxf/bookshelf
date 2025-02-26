// Do your work here...
let books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('bookForm');
    const submitButton = document.getElementById('bookFormSubmit');
    const checkbox = document.getElementById('bookFormIsComplete');
    
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
            submitButton.innerHTML = 'Masukkan Buku ke rak <span>Selesai dibaca</span>';
        } else {
            submitButton.innerHTML = 'Masukkan Buku ke rak <span>Belum selesai dibaca</span>';
        }   
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }

    function addBook() {
        const bookTitle = document.getElementById('bookFormTitle').value;
        const bookAuthor = document.getElementById('bookFormAuthor').value;
        const bookYear = document.getElementById('bookFormYear').value;
        const isCompleted = checkbox.checked;

        const generatedID = generateId();
        const newBook = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, isCompleted);
        books.push(newBook);

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function generateId() {
        return +new Date();
    }

    function generateBookObject(id, title, author, year, isCompleted) {
        return { id, title, author, year, isCompleted };
    }

    document.addEventListener(RENDER_EVENT, function () {
        const incompletedBook = document.getElementById('incompleteBookList');
        incompletedBook.innerHTML = '';

        const completedBook = document.getElementById('completeBookList');
        completedBook.innerHTML = '';

        for (const book of books) {
            const bookElement = makeBookElement(book);
            if (!book.isCompleted) {
                incompletedBook.append(bookElement);
            } else {
                completedBook.append(bookElement);
            }
        }
    });

    function makeBookElement(book) {
        const textBookTitle = document.createElement('h3');
        textBookTitle.innerText = book.title;

        const textBookAuthor = document.createElement('p');
        textBookAuthor.innerText = `Author: ${book.author}`;

        const textBookYear = document.createElement('p');
        textBookYear.innerText = `Year: ${book.year}`;

        const textContainer = document.createElement('div');
        textContainer.classList.add('inner');
        textContainer.append(textBookTitle, textBookAuthor, textBookYear);

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('buttonContainer');

        if (book.isCompleted) {
            const notFinishedButton = document.createElement('button');
            notFinishedButton.innerText = 'Mark as Incomplete';
            notFinishedButton.classList.add('notFinishedButton');
            notFinishedButton.addEventListener('click', function () {
                undoBookFromCompleted(book.id);
            });

            const trashButton = document.createElement('button');
            trashButton.innerText = 'Delete';
            trashButton.classList.add('trashButton');
            trashButton.addEventListener('click', function () {
                removeBook(book.id);
            });

            const editButton = document.createElement('button');
            editButton.innerText = 'Edit';
            editButton.classList.add('editButton');
            editButton.addEventListener('click', function () {
                editBook(book.id);
            });

            buttonContainer.append(notFinishedButton, trashButton, editButton);
            
        } else {
            const finishedButton = document.createElement('button');
            finishedButton.innerText = 'Mark as Complete';
            finishedButton.classList.add('finishedButton');
            finishedButton.addEventListener('click', function () {
                addBookToCompleted(book.id);
            });

            const trashButton = document.createElement('button');
            trashButton.innerText = 'Delete';
            trashButton.classList.add('trashButton');
            trashButton.addEventListener('click', function () {
                removeBook(book.id);
            });

            const editButton = document.createElement('button');
            editButton.innerText = 'Edit';
            editButton.classList.add('editButton');
            editButton.addEventListener('click', function () {
                editBook(book.id);
            });

            buttonContainer.append(finishedButton, trashButton, editButton);
        }

        const container = document.createElement('div');
        container.classList.add('item', 'shadow');
        container.append(textContainer, buttonContainer);
        container.setAttribute('id', `book-${book.id}`);
        return container;
    }

    function addBookToCompleted(bookId) {
        const book = findBook(bookId);
        if (!book) return;

        book.isCompleted = true;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function undoBookFromCompleted(bookId) {
        const book = findBook(bookId);
        if (!book) return;

        book.isCompleted = false;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function removeBook(bookId) {
        const bookIndex = findBookIndex(bookId);
        if (bookIndex === -1) return;

        books.splice(bookIndex, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function editBook(bookId) {
        const book = findBook(bookId);
        if (!book) return;

        const newTitle = prompt('Edit Title:', book.title);
        const newAuthor = prompt('Edit Author:', book.author);
        const newYear = prompt('Edit Year:', book.year);

        if (newTitle !== null) book.title = newTitle;
        if (newAuthor !== null) book.author = newAuthor;
        if (newYear !== null) book.year = newYear;

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    const searchSubmit = document.getElementById('searchSubmit');
    function findBooksByTitle(title) {
        return books.find(book => book.title.toLowerCase() === title.toLowerCase());
    }

    searchSubmit.addEventListener('click', function () {
        findBooksByTitle(title);
        const searchInput = document.getElementById("searchBookTitle");
        const title = searchInput.value.trim();

        const foundBook = findBooksByTitle(title);

        if (foundBook) {
            alert(`Book found: ${foundBook.title}`);
        } else {
            alert("Book not found!");
        }
    });

    function saveData() {
        if (isStorageExist()) {
            const parsed = JSON.stringify(books);
            localStorage.setItem(STORAGE_KEY, parsed);
            document.dispatchEvent(new Event(SAVED_EVENT));
        }
    }

    function isStorageExist() {
        return typeof Storage !== 'undefined';
    }

    function loadDataFromStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        if (serializedData) {
            books = JSON.parse(serializedData);
        }
        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});
