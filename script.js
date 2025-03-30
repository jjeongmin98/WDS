let diskCount = 1;
const diskSizes = {}; // 각 디스크 용량 저장

function addDisk() {
    diskCount++;
    const diskContainer = document.getElementById('diskContainer');

    const diskDiv = document.createElement('div');
    diskDiv.className = 'diskItem';

    const input = document.createElement('input');
    input.type = 'number';
    input.placeholder = `디스크 ${diskCount} 용량`;
    input.className = 'diskInput';
    input.oninput = function () { convertToMB(input); };

    const select = document.createElement('select');
    select.className = 'unitSelect';
    select.onchange = function () { convertToMB(input); };
    ['MB', 'GB', 'TB'].forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        select.appendChild(option);
    });

    diskDiv.appendChild(input);
    diskDiv.appendChild(select);
    diskDiv.appendChild(createButton("+", addDisk));
    diskDiv.appendChild(createButton("-", removeLastDisk));

    diskContainer.appendChild(diskDiv);

    diskSizes[`disk${diskCount}`] = 0;
}

function removeLastDisk() {
    if (diskCount > 1) {
        const diskContainer = document.getElementById('diskContainer');
        diskContainer.removeChild(diskContainer.lastElementChild);
        delete diskSizes[`disk${diskCount}`];
        diskCount--;
        checkInputs();
    }
}

function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = onClick;
    return button;
}

function convertToMB(inputElement) {
    const unit = inputElement.nextElementSibling.value;
    let value = parseFloat(inputElement.value) || 0;

    if (unit === "GB") {
        value *= 1024;
    } else if (unit === "TB") {
        value *= 1024 * 1024;
    }

    inputElement.setAttribute("data-mb", value);
    
    checkInputs();
}

function checkInputs() {
    const diskInputs = document.querySelectorAll('.diskInput');
    const nextButton = document.getElementById('nextButton');

    const allFilled = Array.from(diskInputs).every(input => input.value.trim() !== '');
    nextButton.disabled = !allFilled;
}

function proceed() {
    const osSelection = document.getElementById('osSelection').value;
    const diskInputs = document.querySelectorAll('.diskInput');

    const diskQuantities = Array.from(diskInputs).map(input => input.getAttribute("data-mb"));

    localStorage.setItem('osSelection', osSelection);
    localStorage.setItem('diskQuantities', JSON.stringify(diskQuantities));

    console.log("디스크 MB 값:", diskQuantities);
    window.location.href = './partition/index.html';
}

function proceed() {
    const osSelection = document.getElementById('osSelection').value;
    const diskInputs = document.querySelectorAll('.diskInput');

    // Check if the selected OS is 'windows' or 'centos' and display an error if it is
    if (osSelection === 'windows' || osSelection === 'centos') {
        alert("선택하신 운영체제는 현재 개발 중입니다. 다른 운영체제를 선택해주세요.");
        return; // Exit the function early if the selected OS is not supported
    }

    const diskQuantities = Array.from(diskInputs).map(input => input.getAttribute("data-mb"));

    localStorage.setItem('osSelection', osSelection);
    localStorage.setItem('diskQuantities', JSON.stringify(diskQuantities));

    console.log("디스크 MB 값:", diskQuantities);
    
    // Proceed with navigation if the OS is not 'windows' or 'centos'
    window.location.href = './partition/index.html';
}