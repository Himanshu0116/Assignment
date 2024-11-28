let boardData = JSON.parse(localStorage.getItem('boardData')) || [];
const boardElement = document.getElementById('board');
const resetButton = document.getElementById('reset-board');
const addListButton = document.getElementById('add-list');

function initBoard() {
    boardElement.innerHTML = '';
    boardData.forEach(list => {
        createList(list.title, list.cards);
    });
}

function createList(title, cards = []) {
    const listElement = document.createElement('div');
    listElement.className = 'list';
    listElement.draggable = true;
    listElement.ondragstart = (e) => e.dataTransfer.setData('text/plain', title);

    const listTitle = document.createElement('h3');
    listTitle.innerText = title;

    const addCardButton = document.createElement('button');
    addCardButton.innerText = 'Add Card';
    addCardButton.onclick = () => addCard(listElement, cards);

    const deleteListButton = document.createElement('button');
    deleteListButton.innerText = 'Delete List';
    deleteListButton.onclick = () => deleteList(title);

    const cardsContainer = document.createElement('div');
    cards.forEach(card => createCard(cardsContainer, card));

    listElement.appendChild(listTitle);
    listElement.appendChild(addCardButton);
    listElement.appendChild(deleteListButton);
    listElement.appendChild(cardsContainer);
    boardElement.appendChild(listElement);
}

function addCard(listElement, cards) {
    const cardTitle = prompt('Enter card title:');
    if (cardTitle) {
        cards.push({ title: cardTitle });
        saveBoard();
        initBoard();
    }
}

function createCard(cardsContainer, card) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.innerText = card.title;
    cardElement.draggable = true;

    cardElement.ondragstart = (e) => e.dataTransfer.setData('text/plain', card.title);
    cardElement.onclick = () => editCard(card);

    cardsContainer.appendChild(cardElement);
}

function editCard(card) {
    const newTitle = prompt('Edit card title:', card.title);
    if (newTitle) {
        card.title = newTitle;
        saveBoard();
        initBoard();
    }
}

function deleteList(title) {
    boardData = boardData.filter(list => list.title !== title);
    saveBoard();
    initBoard();
 }

function saveBoard() {
    localStorage.setItem('boardData', JSON.stringify(boardData));
}

resetButton.onclick = () => {
    boardData = [];
    saveBoard();
    initBoard();
};

addListButton.onclick = () => {
    const listTitle = prompt('Enter list title:');
    if (listTitle) {
        boardData.push({ title: listTitle, cards: [] });
        saveBoard();
        initBoard();
    }
};

window.onload = initBoard;
boardElement.ondragover = (e) => {
    e.preventDefault();
};

boardElement.ondrop = (e) => {
    const title = e.dataTransfer.getData('text/plain');
    const targetList = e.target.closest('.list');
    if (targetList) {
        const targetTitle = targetList.querySelector('h3').innerText;
        const sourceList = boardData.find(list => list.cards.some(card => card.title === title));
        if (sourceList) {
            const cardToMove = sourceList.cards.find(card => card.title === title);
            sourceList.cards = sourceList.cards.filter(card => card.title !== title);
            const targetListData = boardData.find(list => list.title === targetTitle);
            targetListData.cards.push(cardToMove);
            saveBoard();
            initBoard();
        }
    }
};

const lists = document.querySelectorAll('.list');
lists.forEach(list => {
    list.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', list.querySelector('h3').innerText);
    };
    list.ondrop = (e) => {
        const draggedTitle = e.dataTransfer.getData('text/plain');
        const draggedList = boardData.find(list => list.title === draggedTitle);
        const targetTitle = list.querySelector('h3').innerText;
        const targetIndex = boardData.findIndex(list => list.title === targetTitle);
        const draggedIndex = boardData.findIndex(list => list.title === draggedTitle);
        if (draggedIndex !== targetIndex) {
            boardData.splice(draggedIndex, 1);
            boardData.splice(targetIndex, 0, draggedList);
            saveBoard();
            initBoard();
        }
    };
});

lists.forEach(list => {
    list.ondragend = () => {
        initBoard();
    };
});

const cards = document.querySelectorAll('.card');
cards.forEach(card => {
    card.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', card.innerText);
    };
    card.ondrop = (e) => {
        e.preventDefault();
        const draggedTitle = e.dataTransfer.getData('text/plain');
        const targetList = card.closest('.list');
        const targetCardsContainer = targetList.querySelector('div');
        const targetCard = card;

        const draggedCard = Array.from(targetCardsContainer.children).find(c => c.innerText === draggedTitle);
        if (draggedCard && draggedCard !== targetCard) {
            targetCardsContainer.insertBefore(draggedCard, targetCard.nextSibling);
            const listTitle = targetList.querySelector('h3').innerText;
            const listData = boardData.find(list => list.title === listTitle);
            const movedCard = listData.cards.find(c => c.title === draggedTitle);
            listData.cards = listData.cards.filter(c => c.title !== draggedTitle);
            listData.cards.splice(Array.from(targetCardsContainer.children).indexOf(targetCard), 0, movedCard);
            saveBoard();
            initBoard();
        }
    };
});

cards.forEach(card => {
    card.ondragover = (e) => {
        e.preventDefault();
    };
});