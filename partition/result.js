document.addEventListener('DOMContentLoaded', function() {
    const storedData = localStorage.getItem('partitions');
    const diskData = storedData ? JSON.parse(storedData) : [];
    console.log('Disk data:', diskData); // 데이터 구조 확인

    const resultDisplay = document.getElementById('resultDisplay');
    let resultText = '';

    diskData.forEach((disk, index) => {
        const diskName = 'sd' + String.fromCharCode(97 + index);
        resultText += `# ${diskName} partitioning\n`;

        disk.partitions.forEach((partition) => {
            // size와 fsType이 존재하는지 확인
            if (partition.size !== undefined && partition.fsType) {
                const sizeOption = partition.isRemaining ? '--size=1 --grow' : `--size=${partition.size}`;
                resultText += `part ${partition.name} --fstype="${partition.fsType}" ${sizeOption} --ondisk=${diskName}\n`;
            } else {
                console.warn(`Partition data missing for ${partition.name}`);
            }
        });

        resultText += '\n';
    });

    resultDisplay.textContent = resultText;
    
    document.getElementById('copyButton').addEventListener('click', function() {
        navigator.clipboard.writeText(resultText).then(() => {
            alert('코드가 복사되었습니다!');
        }).catch(err => {
            console.error('복사 실패:', err);
        });
    });
});