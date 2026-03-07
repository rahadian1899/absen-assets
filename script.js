import {
    initializeApp as e
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth as t,
    signInWithPopup as a,
    GoogleAuthProvider as n,
    onAuthStateChanged as l,
    signOut as i
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    getFirestore as s,
    collection as r,
    addDoc as o,
    serverTimestamp as d,
    onSnapshot as u,
    query as c,
    where as m,
    getDocs as g,
    deleteDoc as p,
    doc as y,
    updateDoc as b
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
let firebaseConfig = {
        apiKey: "AIzaSyCwjyDVi3qnWMJP5YFj745CFrDuTnqTdl4",
        authDomain: "sdnegeri02cibadak.firebaseapp.com",
        projectId: "sdnegeri02cibadak",
        storageBucket: "sdnegeri02cibadak.firebasestorage.app",
        messagingSenderId: "1003077375164",
        appId: "1:1003077375164:web:9bc8bb306b035a7ca22cb9"
    },
    app = e(firebaseConfig),
    auth = t(app),
    db = s(app),
    provider = new n,
    currentSsoUser = null,
    daftarGuruMaster = [],
    ADMIN_EMAIL = "anggirahadiansyah36@admin.sd.belajar.id";

function loadGuru() {
    u(r(db, "guru_db"), e => {
        let t = [],
            a = "";
        e.forEach(e => {
            t.push({
                id: e.id,
                nama: e.data().nama
            })
        }), t.sort((e, t) => e.nama.localeCompare(t.nama)), daftarGuruMaster = t.map(e => e.nama), t.forEach(e => {
            let t = currentSsoUser && currentSsoUser.email === ADMIN_EMAIL ? "inline-block" : "none";
            a += `<tr>
                <td style="text-align:left; padding-left:20px; font-weight:600;">${e.nama}</td>
                <td style="width:50px;">
                    <button class="admin-only" onclick="hapusGuru('${e.id}')" 
                        style="display:${t}; background:#fee2e2; color:#ef4444; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;">
                        &times;
                    </button>
                </td>
            </tr>`
        }), document.getElementById("list-manajemen-guru").innerHTML = a, initAbsensiSystem()
    })
}
window.handleLogin = () => a(auth, provider), window.handleLogout = () => confirm("Keluar sistem?") && i(auth).then(() => location.reload()), l(auth, e => {
    if (e && e.email.includes("belajar.id")) {
        currentSsoUser = e;
        let t = e.email === ADMIN_EMAIL;
        document.getElementById("login-screen").style.display = "none", document.getElementById("app-root").style.display = "flex";
        let a = e.displayName ? e.displayName.toUpperCase() : "REKAN",
            n = new Date().getHours(),
            l = "Selamat Malam,";
        n < 11 ? l = "Selamat Pagi," : n < 15 ? l = "Selamat Siang," : n < 19 && (l = "Selamat Sore,");
        let s = a.split(" ")[0],
            r = document.getElementById("greeting-text");
        r && (r.innerText = `${l} ${s}`), document.getElementById("u-name").innerText = a, document.getElementById("u-email").innerText = e.email, document.getElementById("u-pic").src = e.photoURL, document.getElementById("user-photo-profile") && (document.getElementById("user-photo-profile").src = e.photoURL, document.getElementById("user-name-profile").innerText = a, document.getElementById("user-email-profile").innerText = e.email), document.getElementById("u-name").innerText = a, document.getElementById("u-email").innerText = e.email, document.getElementById("u-pic").src = e.photoURL, document.getElementById("user-photo-profile") && (document.getElementById("user-photo-profile").src = e.photoURL, document.getElementById("user-name-profile").innerText = a, document.getElementById("user-email-profile").innerText = e.email);
        let o = document.querySelectorAll(".admin-only");
        o.forEach(e => {
            e.style.display = t ? "flex" : "none"
        }), loadGuru(), "function" == typeof initAbsensiSystem && initAbsensiSystem()
    } else e && (alert("Akses ditolak! Gunakan akun @admin.sd.belajar.id atau @guru.sd.belajar.id"), i(auth))
}), window.openNav = e => {
    document.querySelectorAll(".container > div").forEach(e => e.style.display = "none"), document.querySelectorAll(".nav-link").forEach(e => e.classList.remove("active")), document.getElementById("v-" + e).style.display = "block", document.getElementById("m-" + e).classList.add("active"), "absen" === e && startCamera()
}, window.tambahGuru = async () => {
    if (currentSsoUser.email !== ADMIN_EMAIL) return alert("Akses dilarang!");
    let e = document.getElementById("in-nama-guru");
    if (e.value.trim()) try {
        await o(r(db, "guru_db"), {
            nama: e.value.trim()
        }), e.value = ""
    } catch (t) {
        console.error("Gagal menambah guru: ", t), alert("Terjadi kesalahan sistem.")
    }
}, window.hapusGuru = async e => {
    if (currentSsoUser.email !== ADMIN_EMAIL) return alert("Akses dilarang!");
    confirm("Hapus guru?") && await p(y(db, "guru_db", e))
};
let unsubscribeAbsensi = null;

function initAbsensiSystem() {
    let e = new Date,
        t = e.getDate(),
        a = e.getFullYear(),
        n = e.getMonth() + 1,
        l = document.getElementById("filter-bulan");
    if (!l) return;
    l.dataset.initialized || (l.value = n, l.dataset.initialized = "true", l.addEventListener("change", initAbsensiSystem));
    let i = parseInt(l.value),
        s = i === n;
    unsubscribeAbsensi && unsubscribeAbsensi();
    let o = document.getElementById("display-date");
    o && (o.innerText = e.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }));
    let d = document.getElementById("head-tgl");
    if (d) {
        d.innerHTML = '<th class="sticky-nama">NAMA GURU</th>';
        for (let g = 1; g <= 31; g++) d.innerHTML += `<th>${g}</th>`;
        d.innerHTML += '<th style="background:#008f3e; color:white;">H</th><th style="background:#f59e0b; color:white;">S</th><th style="background:#0ea5e9; color:white;">I</th><th style="background:#ef4444; color:white;">A</th>'
    }
    let p = c(r(db, "data_absen_02"), m("bulan", "==", i), m("tahun", "==", a));
    unsubscribeAbsensi = u(p, e => {
        let n = {},
            l = 0,
            r = null,
            o = currentSsoUser?.displayName?.toUpperCase().trim(),
            d = currentSsoUser?.email?.toLowerCase().trim(),
            u = [],
            c = document.getElementById("photo-gallery"),
            m = "";
        e.forEach(e => {
            let a = e.data();
            if (!a.nama) return;
            let i = a.nama.toUpperCase().trim();
            if (n[i] || (n[i] = {}), n[i][a.tanggal] = {
                    id: e.id,
                    status: a.status || "H"
                }, (i === o || a.email && a.email.toLowerCase().trim() === d) && (u.push(a), a.tanggal == t && s && (r = a.status || "H")), s && a.tanggal == t && ("H" === a.status || !a.status) && (l++, a.foto && "IZIN_ASSET" !== a.foto)) {
                let c = a.waktu ? new Date(1e3 * a.waktu.seconds).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit"
                    }) : "--:--",
                    g = a.waktu ? new Date(1e3 * a.waktu.seconds).toLocaleDateString("id-ID") : "--/--/----",
                    p = a.lat && a.lng ? `${a.lat.toFixed(6)}, ${a.lng.toFixed(6)}` : "SDN 02 CIBADAK";
                m += `
                            <div class="photo-card" onclick="window.viewImage('${a.foto}', '${a.nama}', '${c}')">
                                <div class="photo-wrapper"><img src="${a.foto}" class="photo-thumb"></div>
                                <div class="photo-info">
                                    <h5 class="photo-name">${a.nama}</h5>
                                    <p class="photo-location">📍 ${p}</p>
                                    <div class="photo-meta"><span>👤 ${g}</span> <span>📅 Pukul ${c} WIB</span></div>
                                </div>
                            </div>`
            }
        }), c && ("" === m ? (c.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8; font-size: 13px; border: 2px dashed #e2e8f0; border-radius: 4px;">Tidak ada foto absen untuk hari ini.</div>', c.style.display = "block") : (c.innerHTML = m, c.style.display = "grid", c.style.gridTemplateColumns = "repeat(auto-fill, minmax(280px, 1fr))", c.style.gap = "20px"));
        let g = document.getElementById("p-status-text"),
            p = document.getElementById("p-status-icon"),
            y = document.getElementById("p-time-text"),
            b = document.getElementById("personal-card");
        if (g) {
            let f = `<span>⚠️</span>`,
                $ = "BELUM ABSEN",
                h = "Silakan klik menu Absen.",
                I = "#dc2626",
                A = "#fef2f2";
            r && s && ("H" === r ? (f = `<span>✓</span>`, $ = "ANDA SUDAH HADIR", h = "Selamat bertugas!", I = "#059669", A = "#ecfdf5") : "S" === r ? (f = "<span>S</span>", $ = "STATUS: SAKIT", h = "Semoga lekas sembuh!", I = "#f59e0b", A = "#fffbeb") : "I" === r && (f = "<span>I</span>", $ = "STATUS: IZIN", h = "Izin Anda tercatat.", I = "#0ea5e9", A = "#f0f9ff")), p && (p.innerHTML = f), g.innerText = $, g.style.color = I, y && (y.innerText = h), b && (b.style.borderLeft = `10px solid ${I}`, b.style.background = A)
        }
        let x = document.getElementById("my-history-list");
        if (x) {
            x.innerHTML = "";
            let S = 0,
                k = s ? t : 31;
            for (let E = k; E >= 1 && !(S >= 5); E--) {
                let w = new Date(a, i - 1, E);
                if (w.getMonth() !== i - 1 || 0 === w.getDay() || 6 === w.getDay()) continue;
                let _ = u.find(e => e.tanggal == E),
                    B = _ ? _.status : "-",
                    T = _ && _.waktu ? new Date(1e3 * _.waktu.seconds).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit"
                    }) : "--:--",
                    D = "H" === B ? "#059669" : "S" === B ? "#f59e0b" : "I" === B ? "#0ea5e9" : "A" === B ? "#dc2626" : "#cbd5e1";
                x.innerHTML += `
                    <tr style="border-bottom: 1px solid #f1f5f9; background: white;">
                        <td style="padding: 12px 15px; font-weight: 800;">${E}/${i}</td>
                        <td style="text-align: center; font-size: 11px;">${T}</td>
                        <td style="text-align: center;"><span style="background:${D}; color:white; padding:3px 10px; border-radius:4px; font-size:10px;">${B}</span></td>
                        <td style="text-align: center; font-size: 11px; color:#94a3b8;">${_?"Tercatat":"-"}</td>
                    </tr>`, S++
            }
        }
        let M = "";
        daftarGuruMaster.forEach(e => {
            let t = e.toUpperCase().trim(),
                l = 0,
                s = 0,
                r = 0,
                o = 0;
            M += `<tr><td class="sticky-nama">${e}</td>`;
            for (let d = 1; d <= 31; d++) {
                let u = new Date(a, i - 1, d);
                if (u.getMonth() === i - 1) {
                    let c = n[t] ? n[t][d] : null,
                        m = c ? c.status.toUpperCase() : "-",
                        g = "#ccc";
                    "H" === m ? (g = "#008f3e", l++) : "S" === m ? (g = "#f59e0b", s++) : "I" === m ? (g = "#0ea5e9", r++) : "A" === m && (g = "#ef4444", o++), M += `<td onclick="cycleStatus('${e}', ${d}, '${c?c.id:""}', '${m}')" style="color:${g}; font-weight:800; text-align:center;">${m}</td>`
                } else M += '<td style="background:#f1f5f9;"></td>'
            }
            M += `
                <td style="font-weight:bold; color:#008f3e; text-align:center; background:#f0fdf4;">${l}</td>
                <td style="font-weight:bold; color:#f59e0b; text-align:center; background:#fffbeb;">${s}</td>
                <td style="font-weight:bold; color:#0ea5e9; text-align:center; background:#f0f9ff;">${r}</td>
                <td style="font-weight:bold; color:#ef4444; text-align:center; background:#fef2f2;">${o}</td></tr>`
        });
        let v = document.getElementById("body-rekap");
        v && (v.innerHTML = M);
        let L = daftarGuruMaster.length;
        document.getElementById("count-total") && (document.getElementById("count-total").innerText = L), document.getElementById("count-hadir") && (document.getElementById("count-hadir").innerText = l), document.getElementById("persen-hadir") && (document.getElementById("persen-hadir").innerText = L > 0 ? Math.round(l / L * 100) + "%" : "0%")
    })
}
window.cycleStatus = async (namaGuru, tgl, docId, statusSkrg) => {
    if (currentSsoUser.email !== ADMIN_EMAIL) {
        alert("Akses Ditolak: Hanya Admin yang dapat mengubah rekap data.");
        return;
    }

    let filterBulan = document.getElementById("filter-bulan");
    let bln = parseInt(filterBulan.value);
    let skrg = new Date();
    let thn = skrg.getFullYear();
    
    // Tentukan urutan perubahan: - -> H -> S -> I -> A -> H
    let statusBaru = "";
    if (statusSkrg === "-" || statusSkrg === "A") statusBaru = "H";
    else if (statusSkrg === "H") statusBaru = "S";
    else if (statusSkrg === "S") statusBaru = "I";
    else if (statusSkrg === "I") statusBaru = "A";

    try {
        if (docId && statusSkrg !== "-") {
            // Jika data sudah ada, Update statusnya
            const docRef = y(db, "data_absen_02", docId);
            
            if (statusSkrg === "A") {
                // Khusus jika dari A mau dihapus atau balik ke H, kita update ke H
                await b(docRef, { 
                    status: "H", 
                    waktu: d(), 
                    keterangan: "Diubah Admin ke Hadir" 
                });
            } else {
                await b(docRef, { 
                    status: statusBaru, 
                    keterangan: "Input Manual Admin (" + statusBaru + ")" 
                });
            }
        } else {
            // Jika data belum ada (tanda -), Buat dokumen baru
            let emailGuru = "";
            // Cek jika nama yang diedit adalah nama admin sendiri agar sinkron ke beranda
            if (namaGuru.toUpperCase().trim() === currentSsoUser.displayName.toUpperCase().trim()) {
                emailGuru = currentSsoUser.email.toLowerCase().trim();
            }

            await o(r(db, "data_absen_02"), {
                nama: namaGuru,
                email: emailGuru,
                tanggal: tgl,
                bulan: bln,
                tahun: thn,
                status: "H",
                waktu: d(),
                keterangan: "Input Manual Admin"
            });
        }
        
        // SweetAlert atau Notif kecil jika perlu
        console.log("Status berhasil diperbarui!");
        
    } catch (err) {
        console.error("Error updating status:", err);
        alert("Gagal mengubah status: " + err.message);
    }
};
let SEKOLAH_LAT = -6.887317,
    SEKOLAH_LNG = 106.779319;

function hitungJarak(e, t, a, n) {
    let l = (a - e) * Math.PI / 180,
        i = (n - t) * Math.PI / 180,
        s = Math.sin(l / 2) * Math.sin(l / 2) + Math.cos(e * Math.PI / 180) * Math.cos(a * Math.PI / 180) * Math.sin(i / 2) * Math.sin(i / 2);
    return 6371e3 * (2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)))
}
async function startCamera() {
    let e = document.getElementById("video");
    try {
        let t = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user"
            },
            audio: !1
        });
        e.srcObject = t
    } catch (a) {
        alert("Akses kamera ditolak.")
    }
}

function getDistance(e, t, a, n) {
    let l = (a - e) * Math.PI / 180,
        i = (n - t) * Math.PI / 180,
        s = Math.sin(l / 2) * Math.sin(l / 2) + Math.cos(e * Math.PI / 180) * Math.cos(a * Math.PI / 180) * Math.sin(i / 2) * Math.sin(i / 2);
    return 6371e3 * (2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)))
}
window.snap = async () => {
    if (!currentSsoUser) return alert("Sesi habis, silakan login ulang.");
    let e = document.getElementById("btn-snap"),
        t = document.getElementById("video"),
        a = document.getElementById("canvas");
    if (!t.srcObject) return alert("Kamera belum aktif!");
    e.disabled = !0, e.innerText = "SEDANG VALIDASI LOKASI...", navigator.geolocation.getCurrentPosition(async n => {
        let l = n.coords.latitude,
            i = n.coords.longitude,
            s = hitungJarak(l, i, -6.887317, 106.779319);
        if (s > 100) {
            alert("GAGAL: Anda berada di luar area sekolah!\nJarak: " + Math.round(s) + " meter."), e.disabled = !1, e.innerText = "AMBIL FOTO & ABSEN";
            return
        }
        e.innerText = "MENYIMPAN KE SERVER...", a.width = 400, a.height = 400, a.getContext("2d").drawImage(t, 0, 0, 400, 400);
        try {
            let u = new Date;
            await o(r(db, "data_absen_02"), {
                nama: currentSsoUser.displayName.trim(),
                email: currentSsoUser.email.toLowerCase().trim(),
                foto: a.toDataURL("image/jpeg", .5),
                koordinat: l + "," + i,
                jarak_meter: Math.round(s),
                tanggal: u.getDate(),
                bulan: u.getMonth() + 1,
                tahun: u.getFullYear(),
                status: "H",
                waktu: d()
            }), alert("Absen Berhasil!\nAnda berada di lokasi sekolah."), initAbsensiSystem(), openNav("dash")
        } catch (c) {
            console.error(c), alert("Gagal menyimpan: " + c.message)
        } finally {
            e.disabled = !1, e.innerText = "AMBIL FOTO & ABSEN"
        }
    }, t => {
        alert("Gagal mendapatkan lokasi GPS. Pastikan GPS Aktif!"), e.disabled = !1, e.innerText = "AMBIL FOTO & ABSEN"
    }, {
        enableHighAccuracy: !0
    })
}, window.laporKeWA = (e, t, a) => {
    let n = new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long"
        }),
        l = "S" === t ? "\uD83E\uDD12" : "\uD83D\uDCDD",
        i = "S" === t ? "SAKIT" : "IZIN",
        s = `*LAPORAN KETIDAKHADIRAN GURU*%0A--------------------------------%0A*Nama:* ${e}%0A*Status:* ${i} ${l}%0A*Alasan:* ${a}%0A*Tanggal:* ${n}%0A--------------------------------%0A_Tercatat otomatis di Sistem SDN 02 CIBADAK_`;
    window.open(`https://wa.me/62857xxxxxxx?text=${s}`, "_blank")
}, window.laporKeWA = (e, t, a) => {
    let n = new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long"
        }),
        l = "S" === t || "Sakit" === t ? "\uD83E\uDD12" : "\uD83D\uDCDD",
        i = "S" === t || "Sakit" === t ? "SAKIT" : "IZIN",
        s = `*LAPORAN KETIDAKHADIRAN GURU*%0A--------------------------------%0A*Nama:* ${e}%0A*Status:* ${i} ${l}%0A*Alasan:* ${a}%0A*Tanggal:* ${n}%0A--------------------------------%0A_Data tercatat otomatis di Sistem SDN 02 CIBADAK_`;
    window.open(`https://wa.me/6287777099842?text=${s}`, "_blank")
}, window.kirimIzin = async () => {
    if (!currentSsoUser) return alert("Sesi habis, silakan login ulang.");
    let e = document.getElementById("tipe-izin").value,
        t = document.getElementById("ket-izin").value,
        a = document.getElementById("btn-izin");
    if (!t.trim()) {
        alert("Mohon isi alasan atau keterangan.");
        return
    }
    if (confirm("Kirim permohonan ini ke Database & WhatsApp KS?")) {
        a.disabled = !0, a.innerText = "MENGIRIM...";
        try {
            let n = new Date,
                l = currentSsoUser.displayName.trim();
            await o(r(db, "data_absen_02"), {
                nama: l,
                email: currentSsoUser.email.toLowerCase().trim(),
                foto: "IZIN_ASSET",
                keterangan: t,
                tanggal: n.getDate(),
                bulan: n.getMonth() + 1,
                tahun: n.getFullYear(),
                status: e,
                waktu: d()
            }), alert("Berhasil tersimpan di Database!"), window.laporKeWA(l, e, t), document.getElementById("ket-izin").value = "", initAbsensiSystem(), openNav("dash")
        } catch (i) {
            console.error(i), alert("Gagal mengirim data.")
        } finally {
            a.disabled = !1, a.innerText = "KIRIM PERMOHONAN"
        }
    }
}, setInterval(() => {
    let e = document.getElementById("clock");
    e && (e.innerText = new Date().toLocaleTimeString("id-ID"))
}, 1e3), window.toExcel = () => {
    let e = document.getElementById("filter-bulan"),
        t = e.options[e.selectedIndex].text,
        a = new Date().getFullYear(),
        n = document.getElementById("target-table"),
        l = XLSX.utils.table_to_sheet(n);
    XLSX.utils.sheet_add_aoa(l, [
        ["REKAP ABSENSI GURU SDN 02 CIBADAK"],
        ["Periode: " + t + " " + a],
        []
    ], {
        origin: "A1"
    });
    let i = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(i, l, "Rekap Absen"), XLSX.writeFile(i, `Rekap_SDN02_${t}_${a}.xlsx`)
}, window.toPDF = () => {
    let {
        jsPDF: e
    } = window.jspdf, t = new e("l", "mm", "a4"), a = document.getElementById("filter-bulan"), n = a ? a.options[a.selectedIndex].text : "", l = new Date().getFullYear();
    t.setFontSize(14), t.setFont("helvetica", "bold"), t.text("REKAP ABSENSI GTK SDN 02 CIBADAK", 14, 12), t.setFontSize(10), t.setFont("helvetica", "normal"), t.text(`Periode: ${n} ${l}`, 14, 18), t.autoTable({
        html: "#target-table",
        startY: 22,
        theme: "grid",
        styles: {
            fontSize: 6,
            cellPadding: 1,
            halign: "center",
            valign: "middle",
            font: "helvetica"
        },
        headStyles: {
            fillColor: [0, 143, 62],
            textColor: [255, 255, 255],
            fontStyle: "bold"
        },
        columnStyles: {
            0: {
                halign: "left",
                cellWidth: 45
            }
        },
        didParseCell: function(e) {
            if ("body" === e.section && e.column.index > 0) {
                let t = e.cell.text[0];
                "H" === t ? e.cell.styles.textColor = [0, 143, 62] : "S" === t ? e.cell.styles.textColor = [245, 158, 11] : "I" === t ? e.cell.styles.textColor = [14, 165, 233] : "A" === t && (e.cell.styles.textColor = [239, 68, 68])
            }
        }
    });
    let i = t.lastAutoTable.finalY + 15,
        s = t.internal.pageSize.getWidth(),
        r = s - 80;
    t.setFontSize(9), t.text("Mengetahui,", r, i), t.text("Kepala SDN 02 Cibadak,", r, i + 5), t.setFont("helvetica", "bold"), t.text("( .................................................... )", r - 2, i + 25), t.setFont("helvetica", "normal"), t.text("NIP. ....................................................", r, i + 30), t.save(`Rekap_Absen_GTK_SDN02_${n}_${l}.pdf`)
};
let streamRef = null;
window.powerOnCamera = async () => {
    let e = document.getElementById("video"),
        t = document.getElementById("cam-placeholder"),
        a = document.getElementById("btn-snap"),
        n = document.getElementById("btn-stop-cam");
    try {
        let l = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user"
            },
            audio: !1
        });
        streamRef = l, e.srcObject = l, t.style.display = "none", e.style.display = "block", a && (a.style.display = "block"), n && (n.style.display = "flex"), e.play()
    } catch (i) {
        console.error("Error:", i), alert("Gagal akses kamera: " + i.message)
    }
}, window.stopCamera = () => {
    let e = document.getElementById("video"),
        t = document.getElementById("cam-placeholder"),
        a = document.getElementById("btn-snap"),
        n = document.getElementById("btn-stop-cam");
    streamRef && (streamRef.getTracks().forEach(e => e.stop()), streamRef = null), e.srcObject = null, e.style.display = "none", t.style.display = "flex", a && (a.style.display = "none"), n && (n.style.display = "none")
}, window.toggleFull = () => {
    let e = document.getElementById("cam-container");
    document.fullscreenElement || document.webkitFullscreenElement ? document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen && document.webkitExitFullscreen() : e.requestFullscreen ? e.requestFullscreen() : e.webkitRequestFullscreen && e.webkitRequestFullscreen()
}, window.viewImage = function(e, t) {
    let a = document.getElementById("photo-modal");
    a || ((a = document.createElement("div")).id = "photo-modal", a.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 99999; display: none;
            align-items: center; justify-content: center; padding: 20px;
            backdrop-filter: blur(5px); cursor: pointer;
        `, a.innerHTML = `
            <div style="position: relative; max-width: 600px; width: 100%;">
                <span style="position: absolute; top: -50px; right: 0; color: white; font-size: 50px; line-height: 1;">&times;</span>
                <img id="modal-img" src="" style="width: 100%; border-radius: 12px; border: 4px solid white; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
                <div id="modal-caption" style="color: white; text-align: center; margin-top: 20px; font-size: 20px; font-weight: bold;"></div>
            </div>
        `, document.body.appendChild(a), a.onclick = () => a.style.display = "none"), document.getElementById("modal-img").src = e, document.getElementById("modal-caption").innerText = t, a.style.display = "flex"
};
