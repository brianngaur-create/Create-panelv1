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

// Fungsi Generate String Acak (Untuk Password & Username)
function generateRandomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Event Dadu untuk Username Acak
btnRandomUser.addEventListener('click', () => {
  usernameInput.value = 'user_' + generateRandomString(5).toLowerCase().replace(/[^a-z0-9]/g, '');
});

// Fungsi Copy Text
function copyText(elementId) {
  const textToCopy = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(textToCopy).then(() => {
    alert('Berhasil disalin: ' + textToCopy);
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
  
  const username = usernameInput.value;
  const ram = document.getElementById('ram').value;
  const password = generateRandomString(10); // Generate Password Acak 10 karakter
  
  btnSubmit.innerText = "Memproses...";
  btnSubmit.disabled = true;
  
  try {
    /* ==================================================================
    CATATAN: Ini adalah contoh struktur fetch untuk API Pterodactyl.
    Namun, karena masalah CORS, request ini akan GAGAL jika dijalankan 
    langsung dari browser. Kamu harus mengirim data ini ke file PHP mu, 
    lalu PHP yang melakukan request cURL ke Pterodactyl menggunakan PLTA.
    ==================================================================
    */
    
    // MOCK REQUEST (Simulasi keberhasilan untuk keperluan UI)
    // Hapus Promise ini dan gunakan fetch sungguhan ke backend-mu.
    await new Promise(resolve => setTimeout(resolve, 1500));
    const isSuccess = true; // Ubah ke false untuk test tampilan error
    
    if (isSuccess) {
      // Tampilan Berhasil
      modalTitle.innerText = "Panel Berhasil Dibuat!";
      modalTitle.style.color = "#4ade80"; // Hijau
      modalMessage.innerText = "Berikut adalah detail login Anda. Harap simpan dengan baik.";
      
      resUser.innerText = username;
      resPass.innerText = password;
      credentialsArea.classList.remove('hidden');
    } else {
      throw new Error("Gagal terhubung ke server atau kuota habis.");
    }
    
  } catch (error) {
    // Tampilan Gagal
    modalTitle.innerText = "Gagal Membuat Panel";
    modalTitle.style.color = "#ef4444"; // Merah
    modalMessage.innerText = "Error: " + error.message;
    credentialsArea.classList.add('hidden');
  } finally {
    modal.classList.remove('hidden');
    btnSubmit.innerText = "Submit";
    btnSubmit.disabled = false;
  }
});