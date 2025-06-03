// =======================
// ส่วน Remote (Google Sheets)
// =======================

// เปลี่ยน URL นี้เป็น URL ของ Google Apps Script Web App ที่คุณ Deploy แล้ว
const scriptURL = "https://script.google.com/macros/s/AKfycbyvSQzNmaQxdxgyT6d0ir3rgdt8l345_M9V3FnmEd_kmdTYexFYsHnTL-sGa34RnqdZ/exec";


function calculateTotal() {
  const roomPrice = parseFloat(document.getElementById("roomPrice").value) || 0;
  const parkingFee = parseFloat(document.getElementById("parkingFee").value) || 0;
  const water = parseFloat(document.getElementById("waterUsage").value) || 0;
  const electric = parseFloat(document.getElementById("electricityUsage").value) || 0;

  let waterCost = 0;
  if (water < 3) {
    waterCost = 100;
  } else {
    waterCost = water * 40;
  }

  const electricCost = electric * 8;
  
  const commonFee = 200;

  const total = roomPrice + parkingFee + waterCost + electricCost + commonFee;
  document.getElementById("totalPrice").value = total.toFixed(2);
}

["roomPrice", "parkingFee", "waterUsage", "electricityUsage"].forEach(id =>
  document.getElementById(id).addEventListener("input", calculateTotal)
);

function submitData() {
  calculateTotal(); // ensure up-to-date total

  const form = new FormData();
  form.append("room", document.getElementById("roomNumber").value.trim());
  form.append("name", document.getElementById("tenantName").value.trim());
  form.append("roomPrice", document.getElementById("roomPrice").value.trim());
  form.append("parkingFee", document.getElementById("parkingFee").value.trim());
  form.append("water", document.getElementById("waterUsage").value.trim());
  form.append("electric", document.getElementById("electricityUsage").value.trim());
  form.append("paidStatus", document.getElementById("paidStatus").value);
  form.append("totalPrice", document.getElementById("totalPrice").value);

  fetch(scriptURL, { method: "POST", body: form })
    .then(res => res.text())
    .then(txt => {
      try {
        const msg = JSON.parse(txt);
        if (msg.result === "success") {
          alert("บันทึกสำเร็จ (แถวที่ " + msg.row + ")");
          loadData();
          clearForm();
        } else {
          alert("เกิดข้อผิดพลาด: " + (msg.error || "ไม่ทราบสาเหตุ"));
        }
      } catch {
        alert("Response ไม่ใช่ JSON: " + txt);
      }
    })
    .catch(err => alert("ส่งไม่สำเร็จ: " + err));
}

function loadData() {
  fetch(scriptURL)
    .then(res => res.text())
    .then(txt => {
      let rows;
      try {
        rows = JSON.parse(txt);
      } catch {
        document.getElementById("roomList").innerHTML = "โหลดข้อมูลไม่สำเร็จ (ข้อมูลไม่ใช่ JSON)";
        return;
      }
      const list = document.getElementById("roomList");
      list.innerHTML = "";
      rows.forEach(row => {
        list.innerHTML += `
          <div class="room">
            <b>ห้อง ${row.room}</b> - ${row.name}<br>
            ค่าห้อง: ${row.roomPrice} บาท, ค่าจอดรถ: ${row.parkingFee} บาท<br>
            น้ำ: ${row.water} หน่วย, ไฟ: ${row.electric} หน่วย<br>
            รวม: <b>${parseFloat(row.totalPrice).toLocaleString()} บาท</b><br>
            สถานะ: <b style="color:${row.paidStatus === "จ่ายแล้ว" ? "green" : "red"}">${row.paidStatus}</b><br>
            <span style="font-size:0.85em;color:#555;">บันทึกเมื่อ: ${row.timestamp || "-"}</span>
          </div>
        `;
      });
    })
    .catch(() => {
      document.getElementById("roomList").innerHTML = "โหลดข้อมูลไม่สำเร็จ";
    });
}

function clearForm() {
  ["roomNumber", "tenantName", "roomPrice", "parkingFee", "waterUsage", "electricityUsage", "totalPrice"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("paidStatus").value = "ยังไม่จ่าย";
}

window.onload = loadData;
