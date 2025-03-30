document.addEventListener('DOMContentLoaded', function() {
    const diskData = JSON.parse(localStorage.getItem('partitions')) || [];

    const resultDisplay = document.getElementById('resultDisplay');
    let resultText = '';

    diskData.forEach((disk, index) => {
        // 디스크 이름을 'sda', 'sdb', 'sdc' 등으로 설정
        const diskName = 'sd' + String.fromCharCode(97 + index);

        resultText += `# ${diskName} partitioning\n`;
        
        disk.partitions.forEach((partition) => {
            const sizeOption = partition.isRemaining ? '--size=1 --grow' : `--size=${partition.size}`;
            resultText += `part ${partition.name} --fstype="${partition.fsType}" ${sizeOption} --ondisk=${diskName}\n`;
        });
        
        resultText += '\n';
    });

    resultDisplay.textContent = resultText;
});