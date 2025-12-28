const sendOrderConfirmation = async (phoneNumber, orderDetails) => {
  try {
    // Konfigurasi API WhatsApp (Sesuaikan dengan provider Anda, misal Fonnte, Twilio, dll)
    // Simpan kredensial di .env
    const API_URL = process.env.WHATSAPP_API_URL || 'https://api.fonnte.com/send';
    const API_TOKEN = process.env.WHATSAPP_API_TOKEN;

    if (!API_TOKEN) {
      console.warn('⚠️ WHATSAPP_API_TOKEN belum diset di .env. Pesan tidak dikirim.');
      return;
    }

    // Format Pesan
    const itemsList = orderDetails.items.map(item => 
      `- ${item.namaProduk} (${item.namaUkuran}) x${item.quantity} @ ${formatCurrency(item.subtotal)}`
    ).join('\n');

    const message = `
Halo *${orderDetails.namaPelanggan}*,
Pesanan Anda *#${orderDetails.pesananId}* telah divalidasi dan sedang *DIPROSES*! 🍳

*Detail Pesanan:*
${itemsList}

*Total: ${formatCurrency(orderDetails.totalHarga)}*
Alamat Pengiriman: ${orderDetails.alamatPengiriman}

Terima kasih telah berbelanja di The Candil's!
    `.trim();

    // Payload (Sesuaikan dengan dokumentasi provider Anda)
    // Contoh untuk Fonnte:
    const payload = {
      target: phoneNumber,
      message: message,
      countryCode: '62', // Optional
    };

    console.log('📤 Mengirim WhatsApp ke', phoneNumber, '...');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('✅ WhatsApp Response:', result);
    return result;

  } catch (error) {
    console.error('❌ Gagal mengirim WhatsApp:', error.message);
    // Jangan throw error agar tidak mengganggu flow update status
  }
};

const sendOrderShipped = async (phoneNumber, orderDetails) => {
  try {
    const API_URL = process.env.WHATSAPP_API_URL || 'https://api.fonnte.com/send';
    const API_TOKEN = process.env.WHATSAPP_API_TOKEN;

    if (!API_TOKEN) return;

    const message = `
Halo *${orderDetails.namaPelanggan}*,
Pesanan Anda *#${orderDetails.pesananId}* sedang *DIKIRIM*! 🚚

Kurir kami sedang menuju ke lokasi Anda.
Mohon pastikan ada penerima di alamat tujuan.
${orderDetails.trackingInfo ? `\n*Link Tracking / Resi:*\n${orderDetails.trackingInfo}\n` : ''}
*Alamat Pengiriman:*
${orderDetails.alamatPengiriman}

Terima kasih!
    `.trim();

    const payload = {
      target: phoneNumber,
      message: message,
      countryCode: '62',
    };

    await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

  } catch (error) {
    console.error('❌ Gagal mengirim WhatsApp (Dikirim):', error.message);
  }
};

const sendOrderCompleted = async (phoneNumber, orderDetails) => {
  try {
    const API_URL = process.env.WHATSAPP_API_URL || 'https://api.fonnte.com/send';
    const API_TOKEN = process.env.WHATSAPP_API_TOKEN;

    if (!API_TOKEN) return;

    let frontendUrl = process.env.FRONTEND_URL || 'https://dev-the-candils-app.vercel.app';
    if (!frontendUrl.startsWith('http')) {
        frontendUrl = `https://${frontendUrl}`;
    }
    
    // Generate Review Links
    let reviewSection = '';
    if (orderDetails.items && orderDetails.items.length > 0) {
      const links = orderDetails.items.map(item => 
        `- ${item.namaProduk}:\n  ${frontendUrl}/products/${item.produkId}`
      ).join('\n\n');
      
      reviewSection = `
*Berikan Ulasan Produk:*
${links}
      `.trim();
    }

    const message = `
Halo *${orderDetails.namaPelanggan}*,
Pesanan Anda *#${orderDetails.pesananId}* telah *SELESAI*! ✅

Terima kasih telah berbelanja di The Candil's.
Kami harap Anda menyukai produk kami! 🌟

${reviewSection}

Sampai jumpa di pesanan berikutnya.
    `.trim();

    const payload = {
      target: phoneNumber,
      message: message,
      countryCode: '62',
    };

    await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

  } catch (error) {
    console.error('❌ Gagal mengirim WhatsApp (Selesai):', error.message);
  }
};

// Helper untuk format rupiah
const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

const sendOrderCancelled = async (phoneNumber, orderDetails) => {
  try {
    const API_URL = process.env.WHATSAPP_API_URL || 'https://api.fonnte.com/send';
    const API_TOKEN = process.env.WHATSAPP_API_TOKEN;

    if (!API_TOKEN) return;

    const message = `
Halo *${orderDetails.namaPelanggan}*,
Pesanan Anda *#${orderDetails.pesananId}* telah *DIBATALKAN* ❌

Alasan: *${orderDetails.alasan || 'Permintaan Pelanggan / Stok Kosong'}*

Mohon maaf atas ketidaknyamanan ini. 
Jika Anda sudah melakukan pembayaran, silakan hubungi admin kami untuk proses pengembalian dana (refund).

Terima kasih.
    `.trim();

    const payload = {
      target: phoneNumber,
      message: message,
      countryCode: '62',
    };

    await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`📤 Notifikasi Drop pesanan #${orderDetails.pesananId} dikirim ke ${phoneNumber}`);

  } catch (error) {
    console.error('❌ Gagal mengirim WhatsApp (Dibatalkan):', error.message);
  }
};

module.exports = {
  sendOrderConfirmation,
  sendOrderShipped,
  sendOrderCompleted,
  sendOrderCancelled
};
