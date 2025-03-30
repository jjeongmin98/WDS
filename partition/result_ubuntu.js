document.addEventListener('DOMContentLoaded', function() {
  const diskData = JSON.parse(localStorage.getItem('partitions')) || [];
  const resultDisplay = document.getElementById('resultDisplay');
  let resultText = 'config:\n';

  diskData.forEach((disk, index) => {
      const diskName = 'sd' + String.fromCharCode(97 + index);
      const diskId = `disk-${diskName}`;

      let hasBootEfi = disk.partitions.some(partition => partition.name === '/boot/efi');
      console.log(`Has boot EFI for ${diskName}: `, hasBootEfi);

      resultText += `  # ${diskName}\n`;
      resultText += `  - type: disk\n`;
      resultText += `    id: ${diskId}\n`;
      resultText += `    path: /dev/${diskName}\n`;
      resultText += `    wipe: superblock-recursive\n`;
      resultText += `    ptable: gpt\n`;
      if (hasBootEfi) {
          resultText += `    grub_device: true\n`;
      }
      resultText += '\n';

      disk.partitions.forEach((partition, pIndex) => {
          const partitionIdName = (partition.name === '/') ? 'root' : partition.name.split('/').pop();
          const partitionId = `partition-${partitionIdName}`;
          resultText += `###############${partitionIdName}################ \n`;
          resultText += `  - type: partition\n`;
          resultText += `    id: ${partitionId}\n`;
          resultText += `    device: ${diskId}\n`;
          resultText += `    size: ${partition.isRemaining ? '-1' : partition.size + 'MB'}\n`;
          if (partition.isRemaining) {
              resultText += `    grow: true\n`;
          }
          if (partition.name === '/boot/efi') {
              resultText += `    flag: esp\n`;
              resultText += `    grub_device: true\n`;
          } else if (partition.flag) {
              resultText += `    flag: ${partition.flag}\n`;
          }
          if (partition.grubDevice) {
              resultText += `    grub_device: true\n`;
          }
          resultText += '\n';

          const formatId = `format-${partitionIdName}`;
          resultText += `  - type: format\n`;
          resultText += `    id: ${formatId}\n`;
          resultText += `    volume: ${partitionId}\n`;
          resultText += `    fstype: ${partition.fsType}\n`;
          
          if (partition.name === '/boot/efi') {
              resultText += `    label: EFI\n`;
          } else if (partition.label) {
              resultText += `    label: ${partition.label}\n`;
          }
          resultText += '\n';

          resultText += `  - type: mount\n`;
          resultText += `    id: mount-${partitionIdName}\n`;
          resultText += `    device: ${formatId}\n`;
          resultText += `    path: ${partition.name}\n`;
          if (partition.options) {
              resultText += `    options: ${partition.options}\n`;
          }
          resultText += '\n';
      });
  });

  resultDisplay.textContent = resultText;

  // Add copy functionality to the button
  document.getElementById('copyButton').addEventListener('click', function() {
      navigator.clipboard.writeText(resultText).then(() => {
          alert('코드가 복사되었습니다!');
      }).catch(err => {
          console.error('복사 실패:', err);
      });
  });
});