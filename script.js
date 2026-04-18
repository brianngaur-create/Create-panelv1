const usernameInput = document.getElementById('username');
const btnRandomUser = document.getElementById('btnRandomUser');
const form = document.getElementById('panelForm');
const btnSubmit = document.getElementById('btnSubmit');

const modal = document.getElementById('resultModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const credentialsArea = document.getElementById('credentialsArea');
const resUser = document.getElementById('resUser');
const resPass = document.getElementById('resPass');
const btnCloseModal = document.getElementById('btnCloseModal');

// Fungsi Generate String Acak
function generateRandomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Event Dadu untuk Username Acak
btnRandomUser.addEventListener('click', () => {
  usernameInput.value = 'user_' + generateRandomString(8).toLowerCase();
});

// Fungsi Copy Text
function copyText(elementId) {
  const textToCopy = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(textToCopy).then(() => {
    alert('✓ Berhasil disalin: ' + textToCopy);
  }).catch(err => {
    console.error('Gagal menyalin text: ', err);
  });
}

// Tutup Modal
btnCloseModal.addEventListener('click', () => {
  modal.classList.add('hidden');
  form.reset();
});

// Handle Submit Form
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = usernameInput.value.trim();
  const jenisPanel = document.getElementById('jenisPanel').value;
  const ram = document.getElementById('ram').value;
  const password = generateRandomString(12);
  
  // Validasi
  if (!username) {
    alert('Username tidak boleh kosong!');
    return;
  }
  
  btnSubmit.innerText = "Memproses...";
  btnSubmit.disabled = true;
  
  try {
    // Kirim ke Vercel Serverless Function
    const response = await fetch('/api/create-panel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
        email: username + '@panel.local',
        panel_type: jenisPanel,
        ram: ram
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Tampilan Berhasil
      modalTitle.innerText = "✓ Panel Berhasil Dibuat!";
      modalTitle.style.color = "#4ade80";
      modalMessage.innerText = "User panel telah berhasil dibuat. Harap simpan kredensial dengan baik.";
      
      resUser.innerText = username;
      resPass.innerText = password;
      credentialsArea.classList.remove('hidden');
    } else {
      throw new Error(result.message || "Gagal membuat panel");
    }
    
  } catch (error) {
    // Tampilan Gagal
    modalTitle.innerText = "✗ Gagal Membuat Panel";
    modalTitle.style.color = "#ef4444";
    modalMessage.innerText = "Error: " + error.message;
    credentialsArea.classList.add('hidden');
    console.error('Error:', error);
  } finally {
    modal.classList.remove('hidden');
    btnSubmit.innerText = "Submit";
    btnSubmit.disabled = false;
  }
});