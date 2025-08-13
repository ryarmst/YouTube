document.addEventListener('DOMContentLoaded', function() {
  const newWordInput = document.getElementById('newWord');
  const addWordBtn = document.getElementById('addWord');
  const wordList = document.getElementById('wordList');
  const toggleBtn = document.getElementById('toggleRedaction');
  const loadFileBtn = document.getElementById('loadFile');
  const wordFileInput = document.getElementById('wordFile');

  let redactionEnabled = false;
  let redactionWords = [];

  // Load saved words and state
  loadSavedData();

  // Add word button
  addWordBtn.addEventListener('click', function() {
    const word = newWordInput.value.trim();
    if (word && !redactionWords.includes(word)) {
      redactionWords.push(word);
      saveWords();
      displayWords();
      newWordInput.value = '';
    }
  });

  // Enter key in input field
  newWordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addWordBtn.click();
    }
  });

  // Toggle redaction
  toggleBtn.addEventListener('click', function() {
    redactionEnabled = !redactionEnabled;
    saveState();
    updateToggleButton();
    
    // Send message to content script
    browser.tabs.query({active: true, currentWindow: true}).then(function(tabs) {
      browser.tabs.sendMessage(tabs[0].id, {
        action: redactionEnabled ? 'enableRedaction' : 'disableRedaction',
        words: redactionWords
      });
    });
  });

  // Load from file
  loadFileBtn.addEventListener('click', function() {
    wordFileInput.click();
  });

  wordFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const content = e.target.result;
        const words = content.split('\n')
          .map(word => word.trim())
          .filter(word => word.length > 0);
        
        redactionWords = [...new Set([...redactionWords, ...words])];
        saveWords();
        displayWords();
      };
      reader.readAsText(file);
    }
  });

  function displayWords() {
    wordList.innerHTML = '';
    redactionWords.forEach(word => {
      const wordItem = document.createElement('div');
      wordItem.className = 'word-item';
      
      const wordText = document.createElement('span');
      wordText.textContent = word;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = 'Remove';
      removeBtn.onclick = function() {
        redactionWords = redactionWords.filter(w => w !== word);
        saveWords();
        displayWords();
      };
      
      wordItem.appendChild(wordText);
      wordItem.appendChild(removeBtn);
      wordList.appendChild(wordItem);
    });
  }

  function updateToggleButton() {
    if (redactionEnabled) {
      toggleBtn.textContent = 'Disable Redaction';
      toggleBtn.classList.remove('disabled');
    } else {
      toggleBtn.textContent = 'Enable Redaction';
      toggleBtn.classList.add('disabled');
    }
  }

  function saveWords() {
    browser.storage.local.set({redactionWords: redactionWords});
  }

  function saveState() {
    browser.storage.local.set({redactionEnabled: redactionEnabled});
  }

  function loadSavedData() {
    browser.storage.local.get(['redactionWords', 'redactionEnabled']).then(function(result) {
      redactionWords = result.redactionWords || [];
      redactionEnabled = result.redactionEnabled || false;
      displayWords();
      updateToggleButton();
    });
  }
}); 