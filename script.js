// ===== 1. AMBIL ELEMEN =====
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");
const toast = document.getElementById("toast");
const form = document.getElementById("contact-form");

// ===== 2. HAMBURGER MENU =====
if (hamburger && navMenu) {
  hamburger.addEventListener("click", function () {
    const terbuka = navMenu.classList.toggle("open");
    hamburger.classList.toggle("active");
    hamburger.setAttribute("aria-expanded", terbuka);
  });

  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navMenu.classList.remove("open");
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
}

// ===== 3. NOTIFIKASI =====
let timerToast;

function tampilkanNotifikasi(pesan, error) {
  if (!toast) return;

  toast.textContent = pesan;
  toast.classList.toggle("error", error === true);
  toast.classList.add("show");

  clearTimeout(timerToast);
  timerToast = setTimeout(function () {
    toast.classList.remove("show");
  }, 3500);
}

// ===== 4. WHATSAPP, JUMLAH PESANAN + KERANJANG =====

// Format nomor WhatsApp: 62, tanpa angka 0 di depan.
const NOMOR_WA = "6285659856433";

const keranjang = {};

const cart = document.getElementById("cart");
const cartFab = document.getElementById("cart-fab");
const cartList = document.getElementById("cart-list");
const cartWA = document.getElementById("cart-wa");

function rupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function nomorSudahDiganti() {
  return NOMOR_WA !== "6281234567890" &&
    /^62\d{8,13}$/.test(NOMOR_WA);
}

function linkWA(pesan) {
  return "https://wa.me/" + NOMOR_WA +
    "?text=" + encodeURIComponent(pesan);
}

// Tombol WhatsApp pada bagian kontak dan footer
document.querySelectorAll("[data-wa]").forEach(function (a) {
  a.href = linkWA("Halo EnJRizz, saya mau tanya/pesan.");
});

// Tombol tambah dan kurangi jumlah produk
document.querySelectorAll(".qty-btn").forEach(function (tombol) {
  tombol.addEventListener("click", function () {
    const angka = tombol.parentElement.querySelector(".qty-num");
    if (!angka) return;

    let jumlah = Number(angka.textContent);

    jumlah = tombol.dataset.aksi === "tambah"
      ? Math.min(jumlah + 1, 20)
      : Math.max(jumlah - 1, 1);

    angka.textContent = jumlah;
  });
});

// Pilihan minuman: suhu, gula, dan es
document.querySelectorAll(".chip").forEach(function (chip) {
  chip.addEventListener("click", function () {
    const grup = chip.closest(".opsi-grup");
    if (!grup) return;

    grup.querySelectorAll(".chip").forEach(function (c) {
      c.classList.remove("aktif");
    });

    chip.classList.add("aktif");

    const opsi = chip.closest(".opsi");
    if (opsi) aturOpsi(opsi);
  });
});

// Minuman panas tidak memiliki pilihan es
function aturOpsi(kotak) {
  const suhu = kotak.querySelector(
    '[data-nama="Suhu"] .chip.aktif'
  );

  const es = kotak.querySelector('[data-nama="Es"]');

  if (es) {
    es.classList.toggle(
      "sembunyi",
      !!suhu && suhu.dataset.nilai === "Panas"
    );
  }
}

// Membaca pilihan yang dipilih pelanggan
function bacaOpsi(kartu) {
  const kotak = kartu.querySelector(".opsi");
  if (!kotak) return "";

  const hasil = [];

  kotak.querySelectorAll(".opsi-grup").forEach(function (grup) {
    if (grup.classList.contains("sembunyi")) return;

    const aktif = grup.querySelector(".chip.aktif");

    if (aktif && !/Normal$/.test(aktif.dataset.nilai)) {
      hasil.push(aktif.dataset.nilai);
    }
  });

  return hasil.join(", ");
}

// Tombol Pesan Sekarang: memasukkan produk ke keranjang
document.querySelectorAll(".order-btn").forEach(function (tombol) {
  tombol.addEventListener("click", function () {
    const kartu = tombol.closest(".product-card");
    if (!kartu) return;

    const opsi = bacaOpsi(kartu);

    const nama = opsi
      ? tombol.dataset.produk + " (" + opsi + ")"
      : tombol.dataset.produk;

    const harga = Number(tombol.dataset.harga);

    const angka = tombol.closest(".card-footer")
      ?.querySelector(".qty-num");

    const jumlah = angka ? Number(angka.textContent) : 1;

    if (!nama || !Number.isFinite(harga) || harga <= 0) {
      tampilkanNotifikasi("Data produk atau harga belum benar.", true);
      return;
    }

    if (!keranjang[nama]) {
      keranjang[nama] = {
        harga: harga,
        jumlah: 0
      };
    }

    keranjang[nama].jumlah += jumlah;

    if (angka) angka.textContent = "1";

    perbaruiKeranjang();

    ledakanEmoji(
      tombol,
      tombol.classList.contains("btn-brown") ? "☕" : "🍗"
    );

    tampilkanNotifikasi(
      "Ditambahkan: " + jumlah + "x " + nama +
      ". Tekan tombol 🛒 untuk melihat pesanan."
    );
  });
});

// Memperbarui isi keranjang, jumlah, dan total harga
function perbaruiKeranjang() {
  if (!cartList || !cartFab || !cartWA) return;

  let total = 0;
  let banyak = 0;

  let pesanWA = "Halo EnJRizz, saya mau pesan:\n\n";

  cartList.innerHTML = "";

  for (const nama in keranjang) {
    const item = keranjang[nama];
    const subtotal = item.harga * item.jumlah;

    total += subtotal;
    banyak += item.jumlah;

    pesanWA += "• " + item.jumlah + "x " + nama +
      " = " + rupiah(subtotal) + "\n";

    const li = document.createElement("li");
    const keterangan = document.createElement("span");
    const namaProduk = document.createElement("b");
    const hargaProduk = document.createElement("small");
    const hapus = document.createElement("button");

    namaProduk.textContent = item.jumlah + "x " + nama;
    hargaProduk.textContent = rupiah(subtotal);

    keterangan.appendChild(namaProduk);
    keterangan.appendChild(document.createElement("br"));
    keterangan.appendChild(hargaProduk);

    hapus.textContent = "🗑";
    hapus.setAttribute("aria-label", "Hapus " + nama);

    hapus.addEventListener("click", function () {
      delete keranjang[nama];
      perbaruiKeranjang();
    });

    li.appendChild(keterangan);
    li.appendChild(hapus);
    cartList.appendChild(li);
  }

  if (banyak === 0) {
    cartList.innerHTML =
      "<li class='kosong'>Keranjang masih kosong. Yuk pilih menu! 😋</li>";
  }

  const cartTotal = document.getElementById("cart-total");
  const badge = document.getElementById("cart-count");

  if (cartTotal) cartTotal.textContent = rupiah(total);
  if (badge) badge.textContent = banyak;

  cartFab.classList.remove("bump");
  void cartFab.offsetWidth;
  cartFab.classList.add("bump");

  pesanWA += "\nTotal: " + rupiah(total) +
    "\nAtas nama: ";

  cartWA.href = linkWA(pesanWA);
  cartWA.classList.toggle("disabled", banyak === 0);
}

// Tombol kirim pesanan ke WhatsApp
if (cartWA) {
  cartWA.addEventListener("click", function (e) {
    if (cartWA.classList.contains("disabled")) {
      e.preventDefault();
      tampilkanNotifikasi(
        "Keranjang masih kosong. Pilih menu dulu ya.",
        true
      );
      return;
    }

    if (!nomorSudahDiganti()) {
      e.preventDefault();
      tampilkanNotifikasi(
        "Nomor WhatsApp belum benar. Periksa NOMOR_WA di script.js.",
        true
      );
    }
  });
}

// Latar gelap di belakang keranjang
let latarKeranjang = null;

if (cart && cartFab) {
  latarKeranjang = document.createElement("div");
  latarKeranjang.className = "cart-overlay";
  document.body.appendChild(latarKeranjang);

  function bukaKeranjang(buka) {
    cart.classList.toggle("open", buka);
    latarKeranjang.classList.toggle("show", buka);
  }

  cartFab.addEventListener("click", function () {
    bukaKeranjang(!cart.classList.contains("open"));
  });

  const cartClose = document.getElementById("cart-close");

  if (cartClose) {
    cartClose.addEventListener("click", function () {
      bukaKeranjang(false);
    });
  }

  latarKeranjang.addEventListener("click", function () {
    bukaKeranjang(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") bukaKeranjang(false);
  });

  const cartClear = document.getElementById("cart-clear");

  if (cartClear) {
    cartClear.addEventListener("click", function () {
      for (const nama in keranjang) {
        delete keranjang[nama];
      }

      perbaruiKeranjang();
    });
  }
}

perbaruiKeranjang();

// Efek emoji saat produk ditambahkan
function ledakanEmoji(elemen, emoji) {
  const kotak = elemen.getBoundingClientRect();

  for (let i = 0; i < 9; i++) {
    const e = document.createElement("span");

    e.textContent = emoji;

    e.style.cssText =
      "position:fixed;z-index:300;pointer-events:none;" +
      "font-size:1.4rem;left:" +
      (kotak.left + kotak.width / 2) +
      "px;top:" + (kotak.top + kotak.height / 2) + "px;";

    document.body.appendChild(e);

    const sudut = (Math.PI * 2 * i) / 9;
    const jarak = 60 + Math.random() * 60;

    e.animate(
      [
        {
          transform: "translate(0,0) scale(1)",
          opacity: 1
        },
        {
          transform:
            "translate(" +
            Math.cos(sudut) * jarak + "px," +
            (Math.sin(sudut) * jarak - 40) +
            "px) scale(0.4) rotate(180deg)",
          opacity: 0
        }
      ],
      {
        duration: 900,
        easing: "ease-out"
      }
    ).onfinish = function () {
      e.remove();
    };
  }
}

// ===== 5. FORM KONTAK -> WHATSAPP =====
if (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const email = document.getElementById("email").value.trim();
    const pesan = document.getElementById("pesan").value.trim();

    if (nama === "" || pesan === "") {
      tampilkanNotifikasi("Nama dan pesan wajib diisi ya.", true);
      return;
    }

    if (!nomorSudahDiganti()) {
      tampilkanNotifikasi(
        "Periksa nomor WhatsApp pada bagian NOMOR_WA.",
        true
      );
      return;
    }

    const isi = "Halo EnJRizz!\n\nNama: " + nama +
      (email ? "\nEmail: " + email : "") +
      "\n\nPesan: " + pesan;

    window.open(linkWA(isi), "_blank", "noopener");

    tampilkanNotifikasi("Membuka WhatsApp... tinggal tekan kirim ya.");

    form.reset();
  });
}

// ===== 6. LOADING SCREEN =====
const preloader = document.getElementById("preloader");
let loadingSelesai = false;

function selesaiLoading() {
  if (loadingSelesai) return;

  loadingSelesai = true;

  if (preloader) preloader.classList.add("hide");

  document.body.classList.remove("loading");
  document.body.classList.add("loaded");

  mulaiKetik();
}

setTimeout(selesaiLoading, 1200);

if (preloader) {
  preloader.addEventListener("click", selesaiLoading);
}

// ===== 7. ANIMASI MUNCUL SAAT SCROLL =====
const elemenReveal = document.querySelectorAll(
  ".section-title, .section-sub, .group-title, .card, " +
  ".about-text, .about-image, .cta .container"
);

elemenReveal.forEach(function (el, i) {
  el.classList.add("reveal");
  el.style.setProperty("--d", (i % 3) * 0.12 + "s");
});

const pengamat = new IntersectionObserver(function (daftar) {
  daftar.forEach(function (item) {
    if (item.isIntersecting) {
      item.target.classList.add("show");
      pengamat.unobserve(item.target);
    }
  });
}, {
  threshold: 0.15
});

elemenReveal.forEach(function (el) {
  pengamat.observe(el);
});

// ===== 8. BAR PROGRESS SCROLL =====
const progress = document.getElementById("progress");

if (progress) {
  window.addEventListener("scroll", function () {
    const tinggi =
      document.documentElement.scrollHeight - window.innerHeight;

    progress.style.width = tinggi > 0
      ? (window.scrollY / tinggi) * 100 + "%"
      : "0%";
  });
}

// ===== 9. EFEK MENGETIK DI HERO =====
const kataKetik = [
  "Ayam Geprek Tumpah 🔥",
  "Butterscotch Nescafé ☕",
  "Sambal Matah 🌶️",
  "Matcha Latte 🍵"
];

const teksKetik = document.getElementById("typing");

let kata = 0;
let huruf = 0;
let menghapus = false;

function ketik() {
  if (!teksKetik) return;

  const t = kataKetik[kata];
  teksKetik.textContent = t.slice(0, huruf);

  if (!menghapus) {
    huruf++;

    if (huruf > t.length) {
      menghapus = true;
      setTimeout(ketik, 1400);
      return;
    }
  } else {
    huruf--;

    if (huruf < 0) {
      menghapus = false;
      huruf = 0;
      kata = (kata + 1) % kataKetik.length;
    }
  }

  setTimeout(ketik, menghapus ? 45 : 90);
}

let sudahKetik = false;

function mulaiKetik() {
  if (!sudahKetik && teksKetik) {
    sudahKetik = true;
    ketik();
  }
}

// ===== 10. CARD MIRING MENGIKUTI MOUSE =====
if (window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".product-card").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      if (e.target.closest("button, .opsi, .qty")) {
        card.style.transform = "";
        return;
      }

      const k = card.getBoundingClientRect();
      const x = (e.clientX - k.left) / k.width - 0.5;
      const y = (e.clientY - k.top) / k.height - 0.5;

      card.style.transform =
        "perspective(800px) rotateY(" + (x * 8) +
        "deg) rotateX(" + (-y * 8) +
        "deg) translateY(-6px)";
    });

    card.addEventListener("mouseleave", function () {
      card.style.transform = "";
    });
  });
}

// ===== 11. TOMBOL KEMBALI KE ATAS =====
const keAtas = document.getElementById("to-top");

if (keAtas) {
  window.addEventListener("scroll", function () {
    keAtas.classList.toggle("show", window.scrollY > 500);
  });

  keAtas.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}