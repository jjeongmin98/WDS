document.addEventListener('DOMContentLoaded', function() {
    const diskQuantities = JSON.parse(localStorage.getItem('diskQuantities')) || [];
    const osSelection = localStorage.getItem('osSelection');
 
    const diskData = diskQuantities.map((quantity, index) => {
        const [value, unit] = quantity.split(" "); // Assuming you store 'value unit' in localStorage
        return {
            name: `디스크 ${index + 1}`,
            totalSize: convertToMB(unit, value),
            partitions: []
        };
    });
 
    function convertToMB(unit, value) {
        console.log(`Unit passed: ${unit}`);
        value = parseFloat(value) || 0;
        if (unit === "GB") {
            console.log(`Converting ${value} GB to ${value * 1024} MB`);
            return value * 1024;
        } else if (unit === "TB") {
            console.log(`Converting ${value} TB to ${value * 1024 * 1024} MB`);
            return value * 1024 * 1024;
        }
        console.log(`Value in MB: ${value}`);
        return value;
    }
 
    diskQuantities.forEach((quantity, index) => {
        const diskDiv = document.createElement('div');
        diskDiv.className = 'diskItem';
 
        const diskTitle = document.createElement('h3');
        diskTitle.textContent = `${diskData[index].name} 설정 (총 용량: ${diskData[index].totalSize} MB)`;
 
        const partitionContainer = document.createElement('div');
        partitionContainer.className = 'partitionContainer';
 
        diskDiv.appendChild(diskTitle);
        diskDiv.appendChild(partitionContainer);
 
        const addButton = document.createElement('button');
        addButton.textContent = '+';
        addButton.onclick = () => addPartition(partitionContainer, diskData[index]);
 
        const removeButton = document.createElement('button');
        removeButton.textContent = '-';
        removeButton.onclick = () => {
            removePartition(partitionContainer, diskData[index]);
            checkTotalSize();
        };
 
        diskDiv.appendChild(addButton);
        diskDiv.appendChild(removeButton);
        document.getElementById('diskSettings').appendChild(diskDiv);
 
        addPartition(partitionContainer, diskData[index]);
    });
 
    function addPartition(container, diskInfo) {
        const partitionDiv = document.createElement('div');
        partitionDiv.className = 'partitionItem';
 
        const nameInput = document.createElement('input');
        nameInput.setAttribute('list', `partitionOptions${diskInfo.name}`);
        nameInput.placeholder = '파티션 이름';
 
        function updateFsTypeOptions(selectedName) {
            fsTypeSelect.innerHTML = '';
 
            if (osSelection === 'rocky' && selectedName === '/boot/efi') {
                createAndAppendOption(fsTypeSelect, 'efi');
            } else if (selectedName === 'swap') {
                createAndAppendOption(fsTypeSelect, 'swap');
            } else if (osSelection === 'ubuntu' && selectedName === '/boot/efi') {
                createAndAppendOption(fsTypeSelect, 'fat32');
            } else {
                ['ext4', 'ext3', 'swap', 'ntfs', 'fat32', 'btrfs', 'xfs', 'efi'].forEach(fsType => {
                    createAndAppendOption(fsTypeSelect, fsType);
                });
            }
        }
 
        const dataList = document.createElement('datalist');
        dataList.id = `partitionOptions${diskInfo.name}`;
        ['/boot', '/boot/efi', 'swap', '/'].forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            dataList.appendChild(optionElement);
        });
 
        const fsTypeSelect = document.createElement('select');
        updateFsTypeOptions(nameInput.value.trim());
 
        const sizeInput = document.createElement('input');
        sizeInput.type = 'number';
        sizeInput.min = '0';
        sizeInput.placeholder = '용량';
 
        const unitSelect = document.createElement('select');
        ['MB', 'GB', 'TB'].forEach(unit => {
            createAndAppendOption(unitSelect, unit);
        });
 
        const remainingCheckbox = document.createElement('input');
        remainingCheckbox.type = 'checkbox';
 
        const checkLabel = document.createElement('label');
        checkLabel.textContent = ' 나머지';
 
        const updatePartitionData = () => {
            updateDiskData(diskInfo, container);
            updateDiskSize(container, diskInfo.totalSize);
            checkTotalSize();
        };
 
        nameInput.oninput = function() {
            updateFsTypeOptions(nameInput.value.trim());
            updatePartitionData();
        };
 
        sizeInput.oninput = unitSelect.onchange = remainingCheckbox.onchange = fsTypeSelect.onchange = function() {
            updatePartitionData();
        };
 
        partitionDiv.appendChild(nameInput);
        partitionDiv.appendChild(dataList);
        partitionDiv.appendChild(fsTypeSelect);
        partitionDiv.appendChild(sizeInput);
        partitionDiv.appendChild(unitSelect);
        partitionDiv.appendChild(remainingCheckbox);
        partitionDiv.appendChild(checkLabel);
 
        container.appendChild(partitionDiv);
        updateDiskData(diskInfo, container);
    }
 
    function createAndAppendOption(selectElement, value) {
        const optionElement = document.createElement('option');
        optionElement.value = value;
        optionElement.textContent = value;
        selectElement.appendChild(optionElement);
    }
 
    function removePartition(container, diskInfo) {
        if (container.children.length > 0) {
            container.removeChild(container.lastChild);
            updateDiskData(diskInfo, container);
        }
        checkTotalSize();
    }
 
    function updateDiskData(diskInfo, container) {
        diskInfo.partitions = Array.from(container.querySelectorAll('.partitionItem')).map(partition => {
            const sizeValue = partition.querySelector('input[type="number"]').value;
            const unitSelect = partition.querySelector('select:nth-of-type(2)'); // Use nth-of-type to distinguish
            const unitValue = unitSelect ? unitSelect.value : 'MB';
            return {
                name: partition.querySelector('input[placeholder="파티션 이름"]').value.trim(),
                fsType: partition.querySelector('select:first-of-type').value,
                size: convertToMB(unitValue, sizeValue),
                isRemaining: partition.querySelector('input[type="checkbox"]').checked
            };
        });
        console.log(diskInfo.partitions);
    }
 
    function updateDiskSize(container, totalDiskSize) {
        const totalSize = Array.from(container.querySelectorAll('.partitionItem')).reduce((acc, partitionItem) => {
            const input = partitionItem.querySelector('input[type="number"]');
            const unitSelect = partitionItem.querySelector('select:nth-of-type(2)'); // Use nth-of-type to distinguish
            if (input && unitSelect) {
                const valueInMB = convertToMB(unitSelect.value, input.value);
                console.log(`Original Value: ${input.value}, Unit: ${unitSelect.value}, Converted: ${valueInMB}`);
                return acc + valueInMB;
            }
            return acc;
        }, 0);
 
        if (totalSize > totalDiskSize && container.children.length > 0) {
            alert('파티션 용량이 디스크의 총 용량을 초과할 수 없습니다.');
            const lastInput = container.querySelector('.partitionItem:last-child input[type="number"]');
            if (lastInput) {
                lastInput.value = '';
            }
        }
    }
 
    function checkTotalSize() {
        const allDisksValid = diskData.every(disk => {
            const totalAssignedSize = disk.partitions.reduce((acc, p) => acc + p.size, 0);
            const isExactMatch = totalAssignedSize === disk.totalSize;
            const hasRemaining = disk.partitions.some(p => p.isRemaining);
            return (isExactMatch || hasRemaining) && disk.partitions.every(p => p.name.trim() !== '');
        });
 
        const nextButton = document.querySelector('button#submitButton');
        nextButton.disabled = !allDisksValid;
    }
 
    const submitButton = document.getElementById('submitButton');
    submitButton.addEventListener('click', function() {
        localStorage.setItem('partitions', JSON.stringify(diskData));
        console.log(diskData);
 
        let targetUrl = './result.html';
 
        if (osSelection === 'windows') {
            targetUrl = './result_windows.html';
        } else if (osSelection === 'ubuntu') {
            targetUrl = './result_ubuntu.html';
        }
 
        window.location.href = targetUrl;
    });
 });