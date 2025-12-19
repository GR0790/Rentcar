// 1. 데이터 정의 (26개 항목)
const columnDef = [
    { id: 'model', label: '렌터카', group: '렌터카 정보', color: 'h-rent' },
    { id: 'plate', label: '차량번호', group: '렌터카 정보', color: 'h-rent' },
    { id: 'type', label: '대여유형', group: '렌터카 정보', color: 'h-rent' },
    { id: 'start', label: '배차시간', group: '렌터카 정보', color: 'h-rent' },
    { id: 'end', label: '반납시간', group: '렌터카 정보', color: 'h-rent' },
    { id: 'duration', label: '배차일수', group: '렌터카 정보', color: 'h-rent' },
    { id: 'custCar', label: '고객차종', group: '고객/입고지', color: 'h-cust' },
    { id: 'cc', label: '배기량', group: '고객/입고지', color: 'h-cust' },
    { id: 'custPlate', label: '고객차량번호', group: '고객/입고지', color: 'h-cust' },
    { id: 'custPhone', label: '고객번호', group: '고객/입고지', color: 'h-cust' },
    { id: 'cust', label: '고객(담당자)', group: '고객/입고지', color: 'h-cust' },
    { id: 'garage', label: '입고지', group: '고객/입고지', color: 'h-cust' },
    { id: 'garageContact', label: '담당자 번호', group: '고객/입고지', color: 'h-cust' },
    { id: 'insName', label: '보험사', group: '보험사', color: 'h-ins' },
    { id: 'insNum', label: '접수번호', group: '보험사', color: 'h-ins' },
    { id: 'insAgent', label: '담당자', group: '보험사', color: 'h-ins' },
    { id: 'insContact', label: '담당자연락처', group: '보험사', color: 'h-ins' },
    { id: 'insFax', label: '팩스번호', group: '보험사', color: 'h-ins' },
    { id: 'fault', label: '과실', group: '보험사', color: 'h-ins' },
    { id: 'payAmt', label: '입금액', group: '보험사', color: 'h-ins' },
    { id: 'claimDate', label: '청구날짜', group: '보험사', color: 'h-ins' },
    { id: 'payDate', label: '입금날짜', group: '보험사', color: 'h-ins' },
    { id: 'bank', label: '은행', group: '소개비', color: 'h-comm' },
    { id: 'account', label: '계좌번호', group: '소개비', color: 'h-comm' },
    { id: 'commAmt', label: '금액', group: '소개비', color: 'h-comm' },
    { id: 'commDate', label: '날짜', group: '소개비', color: 'h-comm' }
];

// 2. 초기 데이터 (샘플)
let fleetDB = [
    { id: 1, model: "그랜저 GN7", plate: "123가 4567", regDate: "2023-05", color: "블랙", location: "본사 지하1층", status: "ready" },
    { id: 2, model: "BMW 520d", plate: "11하 1111", regDate: "2022-01", color: "화이트", location: "공업사", status: "out" },
    { id: 3, model: "아반떼 CN7", plate: "99호 9999", regDate: "2021-12", color: "실버", location: "2주차장", status: "repair" }
];

let dispatchDB = [
    { 
        model: "BMW 520d", plate: "11하 1111", type: "사고대차", start: "2025-02-18T10:00", place: "서울 역삼동",
        cust: "홍길동", custCar: "벤츠 E300", custPlate: "55노5555", 
        insName: "삼성화재", insNum: "2025-001", insFax: "02-111-2222", bank: "국민", account: "123-45",
        end: "" 
    }
];

let userSettings = {};
columnDef.forEach(col => userSettings[col.id] = true);
let currentFilter = 'all';

// 3. 초기화
window.onload = function() {
    renderSettings();
    renderDispatchTable();
    renderFleet('all');
};

// 탭 전환
function switchTab(id, btn) {
    document.querySelectorAll('.content-area').forEach(e => e.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
    if(id === 'fleet') renderFleet(currentFilter);
}

// 4. 공통 함수
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function toggleView(mode, btn) {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if(mode === 'card') {
        document.getElementById('fleetCardView').classList.remove('hidden');
        document.getElementById('fleetListView').classList.add('hidden');
    } else {
        document.getElementById('fleetCardView').classList.add('hidden');
        document.getElementById('fleetListView').classList.remove('hidden');
    }
}

// 5. 차량 관리 로직
function getDynamicLocation(car) {
    if (car.status === 'out') {
        const activeDispatch = dispatchDB.find(d => d.plate === car.plate && !d.end);
        return activeDispatch ? `📍 ${activeDispatch.place}` : '위치 정보 없음';
    } else {
        return `🏠 ${car.location}`;
    }
}

function filterFleet(filterType) {
    currentFilter = filterType;
    document.querySelectorAll('.stat-card').forEach(el => el.classList.remove('active'));
    document.getElementById(`filter_${filterType}`).classList.add('active');
    renderFleet(filterType);
}

function renderFleet(filter) {
    const cardGrid = document.getElementById('fleetCardView');
    const listBody = document.getElementById('fleetListBody');
    cardGrid.innerHTML = ''; listBody.innerHTML = '';

    const counts = { total: 0, ready: 0, out: 0, repair: 0 };
    fleetDB.forEach(c => { counts.total++; counts[c.status]++; });
    document.getElementById('cntTotal').innerText = counts.total;
    document.getElementById('cntReady').innerText = counts.ready;
    document.getElementById('cntOut').innerText = counts.out;
    document.getElementById('cntRepair').innerText = counts.repair;

    fleetDB.forEach(c => {
        if(filter !== 'all' && c.status !== filter) return;

        const locText = getDynamicLocation(c);
        let badgeClass='', statusText='';
        if(c.status==='ready'){ badgeClass='st-ready'; statusText='배차가능'; }
        else if(c.status==='out'){ badgeClass='st-out'; statusText='배차중'; }
        else { badgeClass='st-repair'; statusText='수리/점검'; }

        const dispatchBtn = c.status === 'ready' 
            ? `<button class="btn-full btn-action-primary" onclick="openDispatchModal('new', '${c.plate}')">⚡ 바로 배차</button>` 
            : `<button class="btn-full" style="background:#f5f5f5; color:#ccc; cursor:not-allowed;">배차 불가</button>`;
        
        // 카드
        const card = document.createElement('div');
        card.className = 'car-card';
        card.innerHTML = `
            <div class="car-header"><span class="status-badge ${badgeClass}">${statusText}</span><span style="color:#888; font-size:11px;">${c.model}</span></div>
            <h3 style="margin:0 0 10px 0;">${c.plate}</h3>
            <div style="font-size:12px; color:#666; margin-bottom:5px;">📅 ${c.regDate} / 🎨 ${c.color}</div>
            <div style="font-size:12px; color:#666;">🚩 <span class="loc-text">${locText}</span></div>
            <div style="margin-top:10px; display:flex; gap:5px;">${dispatchBtn}<button class="btn-full" onclick="editVehicle(${c.id})">수정</button></div>
        `;
        cardGrid.appendChild(card);

        // 리스트
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="status-badge ${badgeClass}">${statusText}</span></td>
            <td>${c.model}</td>
            <td><strong>${c.plate}</strong></td>
            <td>${c.regDate} / ${c.color}</td>
            <td>${locText}</td>
            <td><button class="btn-outline" style="padding:4px 8px;" onclick="editVehicle(${c.id})">수정</button></td>
        `;
        listBody.appendChild(tr);
    });
}

function openVehicleModal() {
    document.getElementById('v_editId').value = -1;
    document.getElementById('v_model').value = '';
    document.getElementById('v_plate').value = '';
    document.getElementById('v_regDate').value = '';
    document.getElementById('v_color').value = '';
    document.getElementById('v_location').value = '';
    document.getElementById('v_status').value = 'ready';
    document.getElementById('vehicleModal').style.display = 'flex';
}

function editVehicle(id) {
    const c = fleetDB.find(x => x.id === id);
    document.getElementById('v_editId').value = c.id;
    document.getElementById('v_model').value = c.model;
    document.getElementById('v_plate').value = c.plate;
    document.getElementById('v_regDate').value = c.regDate;
    document.getElementById('v_color').value = c.color;
    document.getElementById('v_location').value = c.location;
    document.getElementById('v_status').value = c.status;
    document.getElementById('vehicleModal').style.display = 'flex';
}

function saveVehicle() {
    const id = parseInt(document.getElementById('v_editId').value);
    const newData = {
        id: id === -1 ? Date.now() : id,
        model: document.getElementById('v_model').value,
        plate: document.getElementById('v_plate').value,
        regDate: document.getElementById('v_regDate').value,
        color: document.getElementById('v_color').value,
        location: document.getElementById('v_location').value,
        status: document.getElementById('v_status').value
    };
    if(!newData.plate) return alert('차량번호는 필수입니다.');

    if(id === -1) fleetDB.push(newData);
    else { const idx = fleetDB.findIndex(x => x.id === id); fleetDB[idx] = newData; }
    
    closeModal('vehicleModal');
    renderFleet(currentFilter);
}

// 6. 배차 로직
function openDispatchModal(mode, plateToSelect = null) {
    const modal = document.getElementById('dispatchModal');
    document.getElementById('editIndex').value = (mode === 'new') ? -1 : 0;
    
    const sel = document.getElementById('m_carSelect');
    sel.innerHTML = '<option value="">-- 차량 선택 --</option>';
    fleetDB.forEach(c => {
        if(c.status === 'ready' || c.plate === plateToSelect) {
            sel.innerHTML += `<option value="${c.plate}" data-model="${c.model}">${c.model} (${c.plate})</option>`;
        }
    });

    if(mode === 'new') {
        document.getElementById('dModalTitle').innerText = "📝 신규 배차 등록";
        document.querySelectorAll('.edit-only').forEach(e => e.style.display = 'none');
        clearInputs();
        document.getElementById('m_start').value = new Date().toISOString().slice(0,16);
        if(plateToSelect) { sel.value = plateToSelect; selectCarFromFleet(); }
    } else {
        document.getElementById('dModalTitle').innerText = "🛠 통합 정보 수정";
        document.querySelectorAll('.edit-only').forEach(e => e.style.display = 'block');
        
        // 예시로 첫번째 데이터 로드 (실제는 ID/Index 매칭 필요)
        const row = dispatchDB[0]; 
        columnDef.forEach(col => {
            const el = document.getElementById('m_' + col.id);
            if(el) el.value = row[col.id] || '';
        });
        document.getElementById('m_introName').value = row.introName || '';
        document.getElementById('m_place').value = row.place || '';
    }
    modal.style.display = 'flex';
}

function selectCarFromFleet() {
    const sel = document.getElementById('m_carSelect');
    if(sel.value) {
        const model = sel.options[sel.selectedIndex].dataset.model;
        document.getElementById('m_model').value = model;
        document.getElementById('m_plate').value = sel.value;
    }
}

function saveDispatch() {
    let newData = {};
    columnDef.forEach(col => {
        const el = document.getElementById('m_' + col.id);
        if(el) newData[col.id] = el.value;
    });
    newData.introName = document.getElementById('m_introName').value;
    newData.place = document.getElementById('m_place').value;

    if(!newData.plate) return alert('차량 선택 필수');

    const idx = parseInt(document.getElementById('editIndex').value);
    if(idx === -1) {
         dispatchDB.unshift(newData);
         const car = fleetDB.find(c => c.plate === newData.plate);
         if(car) car.status = 'out';
    } else {
         dispatchDB[0] = newData; // 예시
    }

    closeModal('dispatchModal');
    renderDispatchTable();
    renderFleet(currentFilter);
}

function renderDispatchTable() {
    const tbody = document.getElementById('dispatchBody');
    const theadG = document.getElementById('tableHeadGroup');
    const theadI = document.getElementById('tableHeadItem');
    tbody.innerHTML = ''; theadG.innerHTML = ''; theadI.innerHTML = '';

    const activeCols = columnDef.filter(c => userSettings[c.id]);
    
    let groups = {};
    activeCols.forEach(c => { if(!groups[c.group]) groups[c.group]={cnt:0,clr:c.color}; groups[c.group].cnt++; });
    for(let g in groups) theadG.innerHTML += `<th class="${groups[g].clr}" colspan="${groups[g].cnt}">${g}</th>`;
    activeCols.forEach(c => theadI.innerHTML += `<td>${c.label}</td>`);

    dispatchDB.forEach((row, idx) => {
        const tr = document.createElement('tr');
        if(!row.end) tr.classList.add('row-renting');
        tr.onclick = () => openDispatchModal('edit', row.plate); 

        let html = '';
        activeCols.forEach(col => {
            let val = row[col.id] || '-';
            if(col.id.includes('start') || col.id.includes('end')) val = val.replace('T', ' ');
            if(col.id === 'end' && !row.end) val = '<span class="txt-renting">미반납</span>';
            html += `<td>${val}</td>`;
        });
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });
}

function renderSettings() {
    const con = document.getElementById('settingsContainer');
    con.innerHTML = '';
    columnDef.forEach(col => {
        const chk = userSettings[col.id] ? 'checked' : '';
        con.innerHTML += `<label class="chk-card"><input type="checkbox" id="chk_${col.id}" ${chk}><span>${col.label}</span></label>`;
    });
}
function checkAll(st) { columnDef.forEach(c => document.getElementById('chk_'+c.id).checked = st); }
function applySettings() {
    columnDef.forEach(c => userSettings[c.id] = document.getElementById('chk_'+c.id).checked);
    renderDispatchTable();
    alert('설정이 저장되었습니다.');
}
function clearInputs() { document.querySelectorAll('#dispatchModal input, #dispatchModal select').forEach(e=>e.value=''); }
function calcDuration() {
    const s = new Date(document.getElementById('m_start').value);
    const e = new Date(document.getElementById('m_end').value);
    if(s&&e && e>s) {
        const diff = e-s;
        const days = Math.floor(diff/(1000*60*60*24));
        const hours = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
        document.getElementById('m_duration').value = `${days}일 ${hours}시간`;
    }
}
