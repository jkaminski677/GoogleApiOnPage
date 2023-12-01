// Zmienne związane z Google Drive API
const CLIENT_ID = '651449741883-e2lqdofq9i78j4tciiqu2mm2q918ina3.apps.googleusercontent.com';
const API_KEY = 'AIzaSyB9fIJi2vQWEr-pHfTAdII_jpXDe5AjEnI';
const ROOT_FOLDER_ID = '179ezGslqWjoSMJ4rFK45A5jDZu8TbS_r';

let currentFolderId = ROOT_FOLDER_ID;

function listFiles(folderId = ROOT_FOLDER_ID, parentNode = null) {

    // Zapisz bieżący folder
    currentFolderId = folderId;

    // Żądanie do Google Drive API
    fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            displayFiles(data.files, parentNode, folderId);
        })
        .catch(error => console.error('Błąd pobierania plików:', error));            
}

// Funkcja do wywołania listFiles po załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    listFiles();
});

function displayFiles(files, parentNode, folderId) {
    const fileListElement = document.getElementById('fileList');
    const folderContentElement = document.getElementById('folderContent');
    const folderTitleElement = document.getElementById('folderTitle');
    const fileViewerElement = document.getElementById('fileViewer');
    const fileViewerElementV1 = document.getElementById('fileViewerV1');


    // Wyczyszczenie widoku pliku
    fileViewerElement.innerHTML = '';
    fileViewerElementV1.innerHTML = '';
    if (!parentNode) {
        fileListElement.innerHTML = ''; // Wyczyszczenie listy przed aktualizacją
    }

    if (files && files.length > 0) {
        // Sortowanie plików alfabetycznie
        files.sort((a, b) => a.name.localeCompare(b.name));

        files.forEach(file => {
            if (file.mimeType === 'application/vnd.google-apps.folder') {
                // Jeśli to folder, utwórz nowy element listy z klasą 'folder'
                const folderItem = document.createElement('li');
                folderItem.className = 'folder';
                folderItem.textContent = `${file.name} `;

                // Dodaj folder jako element nadrzędny dla kolejnych plików
                if (parentNode) {
                    parentNode.appendChild(folderItem);
                } else {
                    fileListElement.appendChild(folderItem);
                }

                // Dodaj obsługę kliknięcia na folder
                folderItem.addEventListener('click', () => {
                    folderContentElement.innerHTML = ''; // Wyczyszczenie prawego panelu
                    folderTitleElement.textContent = file.name; // Ustawienie tytułu folderu

                    // Rekurencyjnie wywołaj listFiles dla tego foldera
                    listFiles(file.id, folderContentElement);
                });
            } else {
                // Jeśli to plik, dodaj jako element listy
                const listItem = document.createElement('li');
                const fileLink = document.createElement('a');
                fileLink.textContent = file.name;

                // Dodaj obsługę kliknięcia na plik
                fileLink.addEventListener('click', () => {
                    // Wyświetl zawartość pliku w prawym panelu
                    displayFileContent(file, fileViewerElement, fileViewerElementV1);
                });

                listItem.appendChild(fileLink);

                // Dodaj do odpowiedniego foldera (jeśli jest)
                if (parentNode) {
                    parentNode.appendChild(listItem);
                } else {
                    fileListElement.appendChild(listItem);
                }
            }
        });
    } else {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Brak plików w folderze.';

        if (parentNode) {
            parentNode.appendChild(emptyMessage);
        } else {
            fileListElement.appendChild(emptyMessage);
        }
    }
}

function closePdfModal() {
    const pdfModal = document.getElementById('pdfModal');
    pdfModal.style.display = 'none';
    document.body.style.overflow = ''; // Przywróć scroll na body
}


function displayFileContent(file, fileViewerElement, fileViewerElementV1) {
    const supportedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'];
    const fileExtension = getFileExtension(file.name);

    if (file.mimeType === 'application/pdf') {
        // Obsługa pliku PDF
        const pdfModal = document.getElementById('pdfModal');

        fileViewerElement.innerHTML = `<iframe src="https://drive.google.com/file/d/${file.id}/preview" width="100%" height="100%"></iframe>`;
        pdfModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Ukryj scroll na body
    } else if (file.mimeType.startsWith('audio/')) {
        // Obsługa pliku dźwiękowego (np. MP3)
        fileViewerElementV1.innerHTML = `<audio controls><source src="https://drive.google.com/uc?id=${file.id}" type="${file.mimeType}"></audio>`;
    } else if (supportedImageExtensions.includes(fileExtension.toLowerCase())) {
        // Obsługa pliku graficznego (zdjęcia)
        fileViewerElement.innerHTML = `<img src="https://drive.google.com/uc?id=${file.id}" alt="${file.name}" style="max-width: 100%; max-height: 100%;">`;
        pdfModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Ukryj scroll na body
    } else {
        // Inne typy plików - do zaimplementowania dla konkretnych formatów
        fileViewerElementV1.innerHTML = `<p>Podgląd pliku "${file.name}" nie jest obsługiwany.</p>`;
    }
}

function getFileExtension(fileName) {
    return fileName.split('.').pop();
}


function goToParentFolder() {
    // // Znajdź ID folderu nadrzędnego (jeśli nie jest to główny folder)
    // if (currentFolderId !== ROOT_FOLDER_ID) {
    //     fetch(`https://www.googleapis.com/drive/v3/files/${currentFolderId}?key=${API_KEY}`)
    //         .then(response => response.json())
    //         .then(data => {
    //             if (data.parents && data.parents.length > 0) {
    //                 const parentId = data.parents[0];
    //                 listFiles(parentId);
    //             }
    //         })
    //         .catch(error => console.error('Błąd pobierania folderu nadrzędnego:', error));
    // }
    // Dodano sprawdzenie, czy panel na górze jest na całą szerokość
}
