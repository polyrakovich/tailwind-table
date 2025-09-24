    const usersURL = 'https://jsonplaceholder.typicode.com/users';
    const roboUrl = `https://robohash.org/`;
    const tbody = document.querySelector('tbody');
    const fileLabel = document.querySelector('.fileUpload > span');
    const modalBtn = document.querySelector('#modalBtn');
    const fileInput = document.querySelector('input[name="avatar"]');
    const form = document.querySelector('#form');
    const editingForm = document.querySelector('#editingForm');
    const searchButton = document.querySelector('#searchButton');
    const formInputs = Array.from(document.querySelectorAll('.formInput'));
    const editingModalInputs = Array.from(document.querySelectorAll('.editingModalInput'));

//preloader
    fetch(usersURL)
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('users', JSON.stringify(data));
            updateTable();
        })
        .finally(
            () => {
                document.querySelector('#preloader').classList.add('hidden');
            }
        )
        .catch(error => console.log(error));

let parsedData = JSON.parse(localStorage.getItem('users'));

function updateTable() {
    tbody.innerHTML = '';

    let filteredData = parsedData.map(user => ({

        'avatar': user.avatar ? user.avatar : roboUrl + user.name,
        'name': user.name,
        'email': user.email,
        'phone': user.phone,
        'website': user.website,
        'company': user.company.name || user.company,

    }));
    filteredData.map((item) => {
            const row = document.createElement('tr');
            row.className = 'h-11 border-gray-500 border-b';
            row.setAttribute('id', `${filteredData.indexOf(item)}`);
            const nameCell = document.createElement('td');
            nameCell.innerHTML = `<div class="p-2 flex flex-auto gap-2">
                                            <img class="h-11 w-auto" id="avatarImg" alt="avatar" src="${item.avatar}">
                                            <div>
                                                <p class="p font-semibold">${item.name}</p>
                                                <p class="font-light">${item.email}</p>
                                            </div>
                                       </div>`;
            row.append(nameCell);

            ['phone', 'website', 'company'].forEach(key => {
                const td = document.createElement('td');
                td.className = 'p-2';
                td.innerHTML = `<p>${item[key]}</p>`;
                row.append(td);
            })

            const actionsCell = document.createElement('td');
            actionsCell.innerHTML = `<div class="p-2 flex flex-auto gap-2">
    <button type="button" class="deleteButton cursor-pointer">
        <svg width="24" height="24" viewBox="0 0 24 24" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color pointer-events-none"><path d="M16 7V4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" style="fill:none;stroke:#3B82F6;stroke-linecap:round;stroke-linejoin:round;stroke-width:2;pointer-events: none"/><path d="M18 20V7H6v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1M4 7h16" style="fill:none;stroke:#515257;stroke-linecap:round;stroke-linejoin:round;stroke-width:2"/></svg>
    </button>
    <button type="button" class="editButton cursor-pointer">
        <svg width="24" height="24" viewBox="0 0 24 24" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color pointer-events-none"><path style="fill:none;stroke:#3B82F6;stroke-linecap:round;stroke-linejoin:round;stroke-width:2; pointer-events: none" d="M21 21H3"/><path d="M19.88 7 11 15.83 7 17l1.17-4 8.88-8.88A2.09 2.09 0 0 1 20 4a2.09 2.09 0 0 1-.12 3" style="fill:none;stroke:#515257;stroke-linecap:round;stroke-linejoin:round;stroke-width:2"/></svg>
    </button>
</div>`;
            row.append(actionsCell);
        tbody.append(row);

    })

    Array.from(document.querySelectorAll('.deleteButton')).forEach((item) => {
        item.addEventListener('click', deleteRow)
    })
    Array.from(document.querySelectorAll('.editButton')).forEach((item) => {
        item.addEventListener('click', editRow)
    })
}

//Открытие модального окна
function openModal(e) {
    if (e.target === modalBtn) {
        document.querySelector('#modal').classList.remove('hidden');
    } else {
        document.querySelector('#editingModal').classList.remove('hidden');
    }
    document.querySelector('#modalBackdrop').classList.remove('hidden');

}


modalBtn.addEventListener('click', openModal)

//Работа с файлами
    let file;
    function getFile(e) {

        file = e.target.files[0];
        e.target.parentElement.classList.add('bg-green-500');//label
        e.target.previousElementSibling.textContent = `${file.name}`;//span inside label
        e.target.parentElement.nextElementSibling.classList.remove('hidden');//removing button

    }
    fileInput.addEventListener('change', getFile);
    document.querySelector('#editingFormAvatar').addEventListener('change', getFile);
    //отмена выбора аватара
    function deleteFile(e) {
        file = '';
        e.target.parentElement.querySelector('input').value = '';
        e.target.previousElementSibling.classList.remove('bg-green-500');//label
        e.target.getAttribute('id').includes('editingForm') ? e.target.previousElementSibling.querySelector('span').textContent = 'Change user\'s picture' : e.target.previousElementSibling.querySelector('span').textContent = 'Add user\'s picture'//span
        e.target.classList.add('hidden');//removing button

    }

    document.querySelector('#removingButton').addEventListener('click', deleteFile);
    document.querySelector('#editingFormRemovingButton').addEventListener('click', deleteFile);

//Закрытие модального окна

    document.querySelector('#closingBtn').addEventListener('click', () => {
        document.querySelector('#modal').classList.add('hidden');
        document.querySelector('#modalBackdrop').classList.add('hidden');
    });

    document.querySelector('#editingFormClosingBtn').addEventListener('click', () => {
        document.querySelector('#editingModal').classList.add('hidden');
        document.querySelector('#modalBackdrop').classList.add('hidden');
    });



form.addEventListener('submit', function(e) {
    e.preventDefault();
    checkValidation(formInputs) && getData(e, form);
});
    //Валидация
function checkValidation(inputList) {

    if (hasInvalidInput(inputList)) {
        typeTest();
        for (let i = 0; i < inputList.length; i++) {
            clearErrors(inputList[i]);
            checkRequired(inputList[i]);
            patternTest(inputList[i]);
        }
        return false;
    } else {
        return true;
    }
}

    function hasInvalidInput(inputs) {
        return inputs.some(inputElement => !inputElement.validity.valid);
    }

    function showError(input, message) {
        let small = document.querySelector(`.${input.getAttribute('id')}Error`);

        if (small) {
            small.textContent = message;
            small.classList.add('text-red-700');
        }
    }

    function clearErrors(input) {
        const inputAttr = input.getAttribute('id');
        let small = document.getElementById(`${inputAttr}Error`);
        if (small) {
            small.innerText = '';
            input.classList.remove('shadow-red-700');
        }
    }

    function checkRequired(input) {
    if (input.value === '') {
            showError(input, `${input.parentElement.textContent} area is required.`);
            input.classList.add('shadow-red-700');
        } else {
            input.classList.remove('shadow-red-700');
        }
    }

    function typeTest() {
        const email = document.querySelector('[type ="email"]');
        if (email.validity.typeMismatch) {
            showError(email, `E-mail area is mismatch.`);
            email.classList.add('shadow-red-700');
        }
    }

    function patternTest(input) {

        if (input.validity.patternMismatch) {
            showError(input, `${input.parentElement.textContent} area is mismatch.`);
            input.classList.add('shadow-red-700');
        }
    }


//Обработка данных формы и добавление новой строки

    function getData(e, form) {
        e.preventDefault();

        const formData = new FormData(form);
        const newUser = Object.fromEntries(formData);

        file ? newUser.avatar = URL.createObjectURL(file) : newUser.avatar = null;

        parsedData.push(newUser);
        localStorage.setItem('users', JSON.stringify(parsedData));

        e.target.reset();

        file = '';
        fileLabel.parentElement.classList.remove('bg-green-500');
        fileLabel.textContent = 'Add user\'s picture';
        document.querySelector('#removingButton').classList.add('hidden');

        updateTable();

        document.querySelector('#modal').classList.add('hidden');
        document.querySelector('#modalBackdrop').classList.add('hidden');
    }

//////////////////////////////////////

//Удаление строки таблицы
    function deleteRow(e) {
        parsedData[e.target.closest('tr').getAttribute('id')] = null;
        parsedData = parsedData.filter(Boolean);
        localStorage.setItem('users', JSON.stringify(parsedData));
        updateTable();
    }

//Редактирование строки таблицы
    let obj;
    let closestTr;

    function editRow(e) {
        openModal(e);
        closestTr = e.target.closest('tr');
        obj = parsedData[closestTr.getAttribute('id')];

        if (obj.avatar !== undefined) {
            document.querySelector('#editingFormRemovingButton').classList.remove('hidden');
        }

        editingModalInputs.forEach((editingModalInput) => {
            for (let prop in obj) {
                if (prop === editingModalInput.getAttribute('name')) {
                    editingModalInput.value = obj[prop];//заполнение инпутов данными из строки
                }
            }
        })

        const formSelectOptions = document.querySelectorAll('.editingFormFormSelect > option');
        formSelectOptions.forEach((option) => {
            if (option.value === obj.company.name) {
                option.selected = true; //заполянем селект
            }
        })
    }

    editingForm.addEventListener('submit', function (e) {
        e.preventDefault();
        checkValidation(editingModalInputs) && submitEditingForm(e);
    })

    function submitEditingForm(e) {
        e.preventDefault();

        const formData = new FormData(editingForm);
        const newUser = Object.fromEntries(formData);//получаем данные из формы

        if(!document.querySelector('#editingFormRemovingButton').classList.contains('hidden')) {
            file ? newUser.avatar = URL.createObjectURL(file) : newUser.avatar = obj.avatar;
        } else {
            newUser.avatar = null;
        }
        obj.avatar = newUser.avatar;

        for (let keys in obj) {//редактируем основной объект
            Object.hasOwn(newUser, keys) ? obj[keys] = newUser[keys] : null;
        }

        localStorage.setItem('users', JSON.stringify(parsedData));
        updateTable();

        file = '';
        document.querySelector('#editingFormAvatar').parentElement.classList.remove('bg-green-500');
        document.querySelector('#editingFormAvatar').previousElementSibling.textContent = 'Change user\'s picture';
        document.querySelector('#editingFormRemovingButton').classList.add('hidden');

        document.querySelector('#editingModal').classList.add('hidden');
        document.querySelector('#modalBackdrop').classList.add('hidden');
    }

    //Фильтрация
    function filterTable() {
        updateTable();
        const searchInputValue = document.querySelector('#searchInput').value.toLowerCase().trim();
        const tr = tbody.querySelectorAll('tr');

        for (let i = 0; i < tr.length; i++) {
            const content = tr[i].textContent.toLowerCase();
            if (!content.includes(searchInputValue)) {
                tr[i].classList.add('hidden');
            }
        }
    }

    searchButton.addEventListener('click', filterTable)
    document.querySelector('#searchInput').addEventListener('keyup', function (e) {
        if (e.keyCode === 13) {
            filterTable();
        }
    });



