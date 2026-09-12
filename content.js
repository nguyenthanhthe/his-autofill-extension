/**
 * HIS V20 - Tiện Ích Hỗ Trợ Khám Sức Khỏe & Tiếp Đón Đa Chuyên Khoa
 * Dành cho cán bộ y tế tại v20.ytecoso.vn
 */

(function () {
    'use strict';

    const CONFIG_KEY = 'his_v2_autofill_config_v8';
    const PREV_CONFIG_KEY = 'his_v2_autofill_config_v7';

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    const defaultExamTexts = {
        tuanHoan: "T1T2 đều rõ không có tiếng bệnh lý",
        hoHap: "Lồng ngực cân đối di động đều theo nhịp thở,phổi không có ral",
        tieuHoa: "Bụng mềm không chướng,gan lách không to",
        thanTietNieu: "Hiện tại bình thường",
        noiTiet: "Hiện tại bình thường",
        coXuongKhop: "Hiện tại bình thường",
        thanKinh: "Không có dấu hiệu liệt thần kinh khu trú",
        tamThan: "Không có dấu hiệu tâm thần kinh",
        ngoaiKhoa: "Hiện tại bình thường",
        daLieu: "Hiện tại bình thường",
        sanPhuKhoa: "Hiện tại bình thường",
        matKhac: "Hiện tại bình thường",
        tmhKhac: "Hiện tại bình thường",
        rhmHamTren: "Bình thường",
        rhmHamDuoi: "Bình thường",
        rhmKhac: "Hiện tại bình thường"
    };

    const defaultCfg = {
        activeTab: 'tiepdon', // 'tiepdon' | 'khambenh' | 'caidat'
        selectedLevel: '1',   // '1' | '2' | '3' | '4'
        autoPilot: false,

        height: '150',
        weight: '48',
        pulse: '80',
        bp: '100/60',
        theLucRadio: 'Loại 1',

        docNoiKhoa: '04',
        skipNoiKhoa: false,

        docNgoaiKhoa: '06',
        skipNgoaiKhoa: false,

        docDaLieu: '06',
        skipDaLieu: false,

        docSanPhuKhoa: '',
        skipSanPhuKhoa: true,

        matPhai: '10',
        matTrai: '10',
        coKinhPhai: '',
        coKinhTrai: '',
        docMat: '24',
        skipMat: false,

        thinhLucPThuong: '5',
        thinhLucPTham: '0.5',
        thinhLucTThuong: '5',
        thinhLucTTham: '0.5',
        docTmh: '24',
        skipTmh: false,

        docRhm: '24',
        skipRhm: false,

        plChuyenKhoa: 'Loại I: Rất khỏe',
        plKetLuan: 'Loại I: Rất khỏe',
        icdKetLuan: 'Z10',
        docKetLuan: '02',
        gioKetThuc: '07:45',
        autoSave: true,

        examTexts: Object.assign({}, defaultExamTexts)
    };

    function loadConfig() {
        try {
            let saved = localStorage.getItem(CONFIG_KEY);
            if (!saved) {
                saved = localStorage.getItem(PREV_CONFIG_KEY);
            }
            if (saved) {
                const parsed = JSON.parse(saved);
                return Object.assign({}, defaultCfg, parsed, {
                    examTexts: Object.assign({}, defaultExamTexts, parsed.examTexts || {})
                });
            }
        } catch (e) {
            console.warn('Lỗi đọc config:', e);
        }
        return JSON.parse(JSON.stringify(defaultCfg));
    }

    function saveConfig(cfg) {
        try {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ [CONFIG_KEY]: cfg }).catch(() => {});
            }
        } catch (e) {
            console.warn('Lỗi lưu config:', e);
        }
    }

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([CONFIG_KEY, PREV_CONFIG_KEY], (res) => {
            if (res && res[CONFIG_KEY] && !localStorage.getItem(CONFIG_KEY)) {
                localStorage.setItem(CONFIG_KEY, JSON.stringify(res[CONFIG_KEY]));
            } else if (res && res[PREV_CONFIG_KEY] && !localStorage.getItem(CONFIG_KEY)) {
                localStorage.setItem(CONFIG_KEY, JSON.stringify(res[PREV_CONFIG_KEY]));
            }
        });
    }

    const delay = ms => new Promise(r => setTimeout(r, ms));

    const setAngularValue = (el, value) => {
        if (!el) return;
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
    };

    const clickMainTab = async (tabName) => {
        const tabs = Array.from(document.querySelectorAll('.tab-app-main .ant-tabs-tab, .ant-tabs-tab'));
        const tab = tabs.find(t => t.innerText.trim() === tabName || t.innerText.includes(tabName));
        if (tab) {
            tab.click();
            await delay(350);
            return true;
        }
        return false;
    };

    const clickSubTab = async (tabName) => {
        const tabs = Array.from(document.querySelectorAll('.vertical-tabs .ant-tabs-tab, .ant-tabs-tab'));
        const tab = tabs.find(t => t.innerText.trim() === tabName || t.innerText.includes(tabName));
        if (tab) {
            tab.click();
            await delay(250);
            return true;
        }
        return false;
    };

    const selectOption = async (selectEl, textMatch) => {
        if (!selectEl || !textMatch) return false;
        
        const cleanMatch = textMatch.trim().toLowerCase();
        // Kiểm tra xem đã đúng giá trị chưa để tránh mở dropdown không cần thiết
        const currentSelected = selectEl.querySelector('.ant-select-selection-item')?.innerText?.trim() || '';
        if (currentSelected && (currentSelected.toLowerCase() === cleanMatch || currentSelected.toLowerCase().includes(cleanMatch))) {
            return true;
        }

        const topControl = selectEl.querySelector('nz-select-top-control') || selectEl;
        topControl.click();
        await delay(120);

        const input = selectEl.querySelector('.ant-select-selection-search-input');
        if (input) {
            input.focus();
            input.value = textMatch;
            input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            input.dispatchEvent(new KeyboardEvent('keydown', { key: textMatch[0] || 'a', bubbles: true }));
            input.dispatchEvent(new KeyboardEvent('keyup', { key: textMatch[0] || 'a', bubbles: true }));
        }

        const wordRegex = new RegExp(`(^|\\s|\\|)${cleanMatch}(\\s|\\||$)`, 'i');

        for (let i = 0; i < 25; i++) {
            await delay(80);
            const options = Array.from(document.querySelectorAll('.ant-select-item-option'));
            if (!options.length) continue;

            let match = options.find(o => wordRegex.test(o.innerText));
            if (!match) {
                match = options.find(o => o.innerText.trim().toLowerCase().startsWith(cleanMatch));
            }
            if (!match) {
                match = options.find(o => o.innerText.toLowerCase().includes(cleanMatch));
            }

            if (match) {
                match.click();
                await delay(120);
                return true;
            }
        }
        document.body.click();
        return false;
    };

    // Helper tìm dòng chuyên khoa theo tiêu đề cột đầu tiên trong bảng
    const findTableRowByTitle = (pane, titleKeyword) => {
        const rows = Array.from(pane.querySelectorAll('tr'));
        const cleanKeyword = titleKeyword.trim().toLowerCase();
        return rows.find(r => {
            const firstTd = r.querySelector('td');
            if (!firstTd) return false;
            const text = firstTd.innerText.trim().toLowerCase();
            return text === cleanKeyword || text.includes(cleanKeyword);
        });
    };

    // Helper điền dòng chuyên khoa dạng bảng (Textarea, Phân loại, Bác sĩ)
    const fillExamTableRow = async (pane, rowTitle, textVal, plVal, docVal) => {
        const row = findTableRowByTitle(pane, rowTitle);
        if (!row) return false;

        const ta = row.querySelector('textarea');
        if (ta && textVal !== undefined) {
            setAngularValue(ta, textVal);
        }

        const selects = Array.from(row.querySelectorAll('nz-select'));
        if (selects[0] && plVal) {
            await selectOption(selects[0], plVal);
        }
        if (selects[1] && docVal) {
            await selectOption(selects[1], docVal);
        }
        return true;
    };

    // Helper tìm khối form động (Mắt, TMH, RHM)
    const findDynamicFormByTitle = (pane, titleKeyword) => {
        const dfs = Array.from(pane.querySelectorAll('ord-dynamic-form'));
        const cleanKeyword = titleKeyword.trim().toLowerCase();
        return dfs.find(df => {
            const title = df.querySelector('legend, h3, h4, h5, .title')?.innerText || 
                          df.previousElementSibling?.innerText || '';
            return title.trim().toLowerCase().includes(cleanKeyword);
        });
    };

    // Helper tìm select theo nhãn (label hoặc span mô tả)
    const findSelectByLabel = (container, labelKeywords) => {
        const keywords = Array.isArray(labelKeywords) ? labelKeywords : [labelKeywords];
        const formItems = Array.from(container.querySelectorAll('.ant-form-item, nz-form-item, div.row > div, div'));
        for (const item of formItems) {
            const label = item.querySelector('label, .ant-form-item-label, span.title, span');
            if (label) {
                const txt = label.innerText.trim().toLowerCase();
                for (const kw of keywords) {
                    if (txt.includes(kw.toLowerCase())) {
                        const sel = item.querySelector('nz-select');
                        if (sel) return sel;
                    }
                }
            }
        }
        return null;
    };

    // Helper kiểm tra thông báo lỗi nổi của hệ thống HIS (Ant Design)
    const checkHisErrorMessage = () => {
        const errorEl = document.querySelector('.ant-message-error, .ant-notification-notice-error');
        if (errorEl && errorEl.offsetParent !== null) {
            return errorEl.innerText.trim();
        }
        return null;
    };

    // ----------------------------------------------------
    // NHẬN DIỆN THÔNG MINH: ĐỘ TUỔI & GIỚI TÍNH & BỆNH NHÂN
    // ----------------------------------------------------
    let cachedPatient = {
        name: '',
        cccd: '',
        birthYear: '',
        age: 0,
        ageGroup: '',
        gender: ''
    };

    function scanPatientInfo() {
        // 1. Nếu đang mở tab Khám sức khỏe định kỳ
        const paneKham = document.querySelector('.tab-app-main > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane-active') || document;
        const hoTenInp = paneKham.querySelector('input[name="ho_va_ten"]');
        if (hoTenInp && hoTenInp.value.trim()) {
            cachedPatient.name = hoTenInp.value.trim();
            cachedPatient.cccd = paneKham.querySelector('input[name="so_cccd"]')?.value.trim() || '';
            const dob = paneKham.querySelector('input[placeholder="Ngày/Tháng/Năm"]')?.value.trim() || '';
            const yMatch = dob.match(/\d{4}$/);
            if (yMatch) {
                cachedPatient.birthYear = yMatch[0];
                const y = parseInt(yMatch[0], 10);
                if (y > 1900 && y <= 2030) cachedPatient.age = new Date().getFullYear() - y;
            }

            const radios = Array.from(paneKham.querySelectorAll('.ant-radio-wrapper, label, span'));
            const namRadio = radios.find(r => r.innerText.trim() === 'Nam');
            const nuRadio = radios.find(r => r.innerText.trim() === 'Nữ');
            if (namRadio && (namRadio.classList.contains('ant-radio-wrapper-checked') || !!namRadio.querySelector('input:checked'))) {
                cachedPatient.gender = 'Nam';
            } else if (nuRadio && (nuRadio.classList.contains('ant-radio-wrapper-checked') || !!nuRadio.querySelector('input:checked'))) {
                cachedPatient.gender = 'Nữ';
            }
            return;
        }

        // 2. Nếu đang mở tab Tiếp đón khám sức khoẻ
        const activeTopTab = document.querySelector('.tab-app-main .ant-tabs-tab-active')?.innerText || '';
        if (activeTopTab.includes('Tiếp đón')) {
            const paneTD = document.querySelector('.tab-app-main > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane-active') || document;
            const text = paneTD.innerText;
            const match = text.match(/(\d{10,18})\s*-\s*([^\n\r\-]+)-\s*(\d{4})/);
            if (match) {
                cachedPatient.cccd = match[1].trim();
                cachedPatient.name = match[2].trim();
                cachedPatient.birthYear = match[3].trim();
                const y = parseInt(match[3].trim(), 10);
                if (y > 1900 && y <= 2030) cachedPatient.age = new Date().getFullYear() - y;
            } else {
                const nameInp = paneTD.querySelector('input[name="tenDayDu"]');
                if (nameInp && nameInp.value.trim()) cachedPatient.name = nameInp.value.trim();
                const cccdInp = paneTD.querySelector('input[name="soCmt"]');
                if (cccdInp && cccdInp.value.trim()) cachedPatient.cccd = cccdInp.value.trim();

                const namInp = paneTD.querySelector('input[name="namSinh"], input[name="nam_sinh"], input[name="nam"]') ||
                               Array.from(paneTD.querySelectorAll('input')).find(i => {
                                   const lbl = i.closest('nz-form-item, .ant-form-item, div')?.querySelector('label, span')?.innerText || '';
                                   return lbl.includes('Năm') && !lbl.includes('Ngày/Tháng/Năm');
                               });
                if (namInp && namInp.value && /^\d{4}$/.test(namInp.value.trim())) {
                    cachedPatient.birthYear = namInp.value.trim();
                    cachedPatient.age = new Date().getFullYear() - parseInt(namInp.value.trim(), 10);
                }

                const tuoiInp = paneTD.querySelector('input[name="tuoi"], input[name*="tuoi" i]');
                if (tuoiInp && tuoiInp.value && !isNaN(parseInt(tuoiInp.value, 10))) {
                    cachedPatient.age = parseInt(tuoiInp.value, 10);
                    if (!cachedPatient.birthYear) cachedPatient.birthYear = String(new Date().getFullYear() - cachedPatient.age);
                }
            }

            const radios = Array.from(paneTD.querySelectorAll('.ant-radio-wrapper, label, span'));
            const namRadio = radios.find(r => r.innerText.trim() === 'Nam');
            const nuRadio = radios.find(r => r.innerText.trim() === 'Nữ');
            if (namRadio && (namRadio.classList.contains('ant-radio-wrapper-checked') || !!namRadio.querySelector('input:checked'))) {
                cachedPatient.gender = 'Nam';
            } else if (nuRadio && (nuRadio.classList.contains('ant-radio-wrapper-checked') || !!nuRadio.querySelector('input:checked'))) {
                cachedPatient.gender = 'Nữ';
            }
        }
    }

    function detectAgeGroup(pane) {
        // Tầng 1: Kiểm tra trực tiếp từ tiêu đề biểu mẫu đang mở (nếu đang ở màn hình Khám)
        const docHeader = document.querySelector('.tab-app-main, h2, h3, h4, .ant-page-header, .title')?.innerText || '';
        if (docHeader.includes('DƯỚI 6 TUỔI') || docHeader.includes('dưới 6 tuổi')) {
            return 'dưới 6 tuổi';
        }
        if (docHeader.includes('ĐỦ 6 TUỔI ĐẾN DƯỚI 18 TUỔI') || docHeader.includes('đủ 6 tuổi đến dưới 18 tuổi')) {
            return 'từ đủ 6 tuổi đến dưới 18 tuổi';
        }
        if (docHeader.includes('TỪ ĐỦ 18 TUỔI TRỞ LÊN') || docHeader.includes('từ đủ 18 tuổi trở lên')) {
            return 'từ đủ 18 tuổi trở lên';
        }

        const activePane = pane || document.querySelector('.tab-app-main > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane-active') || document;

        // Tầng 2: Tìm tuổi trực tiếp từ ô "Tuổi"
        const tuoiInp = activePane.querySelector('input[name="tuoi"], input[name*="tuoi" i]');
        if (tuoiInp && tuoiInp.value && !isNaN(parseInt(tuoiInp.value, 10))) {
            const a = parseInt(tuoiInp.value, 10);
            if (a < 6) return 'dưới 6 tuổi';
            if (a < 18) return 'từ đủ 6 tuổi đến dưới 18 tuổi';
            return 'từ đủ 18 tuổi trở lên';
        }

        // Tầng 3: Tìm năm sinh từ ô "* Năm"
        const namInp = activePane.querySelector('input[name="namSinh"], input[name="nam_sinh"], input[name="nam"]') ||
                       Array.from(activePane.querySelectorAll('input')).find(i => {
                           const lbl = i.closest('nz-form-item, .ant-form-item, div')?.querySelector('label, span')?.innerText || '';
                           return lbl.includes('Năm') && !lbl.includes('Ngày/Tháng/Năm');
                       });
        if (namInp && namInp.value && /^\d{4}$/.test(namInp.value.trim())) {
            const y = parseInt(namInp.value.trim(), 10);
            const a = new Date().getFullYear() - y;
            if (a < 6) return 'dưới 6 tuổi';
            if (a < 18) return 'từ đủ 6 tuổi đến dưới 18 tuổi';
            return 'từ đủ 18 tuổi trở lên';
        }

        // Tầng 4: Tìm từ ô ngày sinh đầy đủ "Ngày sinh"
        let dobStr = '';
        const dobInput = activePane.querySelector('input[name="ngaySinh"]') || 
                         activePane.querySelector('input[placeholder="Ngày/Tháng/Năm"]');
        if (dobInput && dobInput.value) {
            dobStr = dobInput.value.trim();
        } else if (cachedPatient.birthYear) {
            dobStr = cachedPatient.birthYear;
        } else {
            const bodyText = activePane.innerText || document.body.innerText;
            const match = bodyText.match(/(\d{10,18})\s*-\s*([^\n\r\-]+)-\s*(\d{4})/);
            if (match && match[3]) dobStr = match[3];
        }

        if (dobStr) {
            let birthYear = 0;
            const parts = dobStr.split(/[\/\-\.]/);
            if (parts.length === 3) {
                birthYear = parseInt(parts[2], 10);
            } else if (/^\d{4}$/.test(dobStr)) {
                birthYear = parseInt(dobStr, 10);
            }
            if (birthYear > 1900 && birthYear <= 2030) {
                const currentYear = new Date().getFullYear();
                const age = currentYear - birthYear;
                if (age < 6) return 'dưới 6 tuổi';
                if (age < 18) return 'từ đủ 6 tuổi đến dưới 18 tuổi';
                return 'từ đủ 18 tuổi trở lên';
            }
        }
        return 'từ đủ 18 tuổi trở lên';
    }

    function getPatientAgeLabel() {
        scanPatientInfo();
        const ageGroup = detectAgeGroup();
        let desc = '';
        if (cachedPatient.age > 0) {
            desc = ` (${cachedPatient.age} tuổi)`;
        }
        if (ageGroup === 'dưới 6 tuổi') {
            return `Dưới 6 tuổi${desc}`;
        }
        if (ageGroup === 'từ đủ 6 tuổi đến dưới 18 tuổi') {
            return `Từ đủ 6 đến dưới 18 tuổi${desc}`;
        }
        return `Từ đủ 18 tuổi trở lên${desc}`;
    }

    async function getOrDetectGender() {
        if (cachedPatient.gender) return cachedPatient.gender;
        scanPatientInfo();
        if (cachedPatient.gender) return cachedPatient.gender;

        const isKhamActive = document.querySelector('.tab-app-main .ant-tabs-tab-active')?.innerText?.includes('Khám sức khỏe');
        if (isKhamActive) {
            await clickSubTab('HÀNH CHÍNH');
            await delay(150);
            scanPatientInfo();
            return cachedPatient.gender;
        }
        return '';
    }

    function getSelectedPatientBanner() {
        scanPatientInfo();
        const parts = [];
        if (cachedPatient.cccd) parts.push(cachedPatient.cccd);
        if (cachedPatient.name) parts.push(cachedPatient.name);
        if (cachedPatient.birthYear) parts.push(cachedPatient.birthYear);
        if (parts.length > 0) {
            let res = parts.join(' - ');
            const meta = [];
            if (cachedPatient.gender) meta.push(cachedPatient.gender);
            if (cachedPatient.age > 0) meta.push(`${cachedPatient.age} tuổi`);
            if (meta.length > 0) res += ` (${meta.join(', ')})`;
            return res;
        }

        const match = document.body.innerText.match(/(\d{10,18}\s*-\s*[^\n\r\-]+-\s*\d{4})/);
        return match ? match[1].trim() : '';
    }

    // ----------------------------------------------------
    // 1. MODULE TIẾP ĐÓN KHÁM SỨC KHỎE
    // ----------------------------------------------------
    async function fillTiepDonConfig(statusEl) {
        if (statusEl) statusEl.innerText = '⏳ Đang mở tab và điền Tiếp đón...';

        await clickMainTab('Tiếp đón khám sức khoẻ');
        await delay(350);

        const nameInput = document.querySelector('input[name="tenDayDu"]');
        const pane = nameInput ? nameInput.closest('.ant-tabs-tabpane') : (document.querySelector('.tab-app-main > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane-active') || document);

        // Chặn sớm: Nếu chưa có thông tin người khám
        const patientName = nameInput?.value?.trim() || cachedPatient.name?.trim();
        if (!patientName) {
            throw new Error('Chưa có thông tin người khám! Vui lòng gõ Tên hoặc CCCD vào ô Tìm kiếm trước.');
        }

        const timeInputs = Array.from(pane.querySelectorAll('input[placeholder="__:__"]'));
        if (timeInputs[0]) setAngularValue(timeInputs[0], "07:30");

        const ageGroup = detectAgeGroup(pane);
        const ageLabel = getPatientAgeLabel();
        if (statusEl) statusEl.innerText = `⏳ Điền Tiếp đón [${ageLabel}]...`;

        let selects = Array.from(pane.querySelectorAll('nz-select'));

        // 1. Nghề nghiệp
        const selNgheNghiep = findSelectByLabel(pane, ['nghề nghiệp', 'nghề']) || selects[6];
        if (selNgheNghiep) await selectOption(selNgheNghiep, "00000");

        // 2. Mục đích khám
        const selMucDich = findSelectByLabel(pane, ['mục đích khám', 'mục đích']) || selects[9];
        if (selMucDich) await selectOption(selMucDich, "Khám sức khoẻ định kỳ");

        // 3. Đối tượng khám định kỳ (Nhóm tuổi tự động)
        const selDoiTuong = findSelectByLabel(pane, ['đối tượng khám định kỳ', 'đối tượng khám', 'đối tượng']) || selects[10];
        if (selDoiTuong) {
            await selectOption(selDoiTuong, ageGroup);
            await delay(300);
        }

        // 4. Các đối tượng khác
        selects = Array.from(pane.querySelectorAll('nz-select'));
        const selChiTiet = findSelectByLabel(pane, ['đối tượng khác', 'chi tiết']) || selects[11];
        if (selChiTiet) {
            await selectOption(selChiTiet, "Các đối tượng khác");
            await delay(200);
        }

        // 5. Nguồn kinh phí
        selects = Array.from(pane.querySelectorAll('nz-select'));
        const selKinhPhi = findSelectByLabel(pane, ['nguồn kinh phí', 'kinh phí']) || selects[12];
        if (selKinhPhi) {
            await selectOption(selKinhPhi, "Xã hội hoá");
        }

        const taLyDo = pane.querySelector('textarea[name="lyDoVaoVien"]') || pane.querySelector('textarea');
        if (taLyDo) setAngularValue(taLyDo, "Khám sức khoẻ định kỳ");

        if (statusEl) statusEl.innerText = `✅ Đã điền xong Tiếp đón (${ageLabel})!`;
    }

    async function saveTiepDon(statusEl) {
        if (statusEl) statusEl.innerText = '⏳ Đang bấm Lưu Tiếp đón (F11)...';

        const pane = document.querySelector('.tab-app-main > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane-active') || document;
        const buttons = Array.from(pane.querySelectorAll('button'));
        const saveBtn = buttons.find(b => b.innerText.includes('Lưu (F11)') || (b.innerText.trim() === 'Lưu' && b.classList.contains('ant-btn-primary')));
        if (!saveBtn) throw new Error('Không tìm thấy nút Lưu Tiếp đón');

        saveBtn.click();

        for (let i = 0; i < 25; i++) {
            await delay(150);
            const err = checkHisErrorMessage();
            if (err) throw new Error(`HIS báo lỗi: ${err}`);
            if (!saveBtn.classList.contains('ant-btn-loading')) break;
        }
        await delay(300);
        const lateErr = checkHisErrorMessage();
        if (lateErr) throw new Error(`HIS báo lỗi: ${lateErr}`);
        return true;
    }

    // ----------------------------------------------------
    // 2. CHUYỂN SANG KHÁM SỨC KHỎE (F6)
    // ----------------------------------------------------
    async function navigateToKhamSucKhoe(statusEl) {
        if (statusEl) statusEl.innerText = '⏳ Đang chuyển sang Khám sức khoẻ (F6)...';

        const currentTabs = Array.from(document.querySelectorAll('.tab-app-main .ant-tabs-tab, .ant-tabs-tab'));
        const alreadyKhamTab = currentTabs.find(t => t.innerText.includes('Khám sức khỏe định kỳ') || t.innerText.includes('Khám sức khỏe'));
        if (alreadyKhamTab) {
            alreadyKhamTab.click();
            await delay(350);
            return true;
        }

        const pane = document.querySelector('.tab-app-main > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane-active') || document;
        const buttons = Array.from(pane.querySelectorAll('button'));
        const f6Btn = buttons.find(b => b.innerText.includes('Khám sức khoẻ (F6)') || b.innerText.includes('Khám sức khoẻ') || b.innerText.includes('(F6)'));

        if (f6Btn) {
            f6Btn.click();
            await delay(600);
            return true;
        }

        const activeTopTab = document.querySelector('.tab-app-main .ant-tabs-tab-active')?.innerText || '';
        if (activeTopTab.includes('Tiếp đón')) {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F6', code: 'F6', keyCode: 117, bubbles: true }));
            await delay(600);
            return true;
        }

        throw new Error('Không tìm thấy nút Khám sức khoẻ (F6)');
    }

    // ----------------------------------------------------
    // 3. MODULE KHÁM SỨC KHỎE: THỂ LỰC, 7 CHUYÊN KHOA & KẾT LUẬN (Z10)
    // ----------------------------------------------------
    async function fillKhamTheoBangGiaoDien(statusEl) {
        const cfg = loadConfig();
        const texts = cfg.examTexts || defaultExamTexts;

        // Chặn sớm: Đảm bảo đang mở đúng hồ sơ Khám Sức Khỏe
        const activeTopTab = document.querySelector('.tab-app-main .ant-tabs-tab-active')?.innerText || '';
        if (!activeTopTab.includes('Khám sức khỏe')) {
            const switched = await clickMainTab('Khám sức khỏe');
            if (!switched) {
                throw new Error('Chưa mở hồ sơ Khám Sức Khỏe! Vui lòng chọn người khám trước.');
            }
            await delay(350);
        }
        const hasVerticalTabs = document.querySelector('.vertical-tabs');
        if (!hasVerticalTabs) {
            throw new Error('Chưa mở hồ sơ Khám Sức Khỏe! Vui lòng chọn người khám trước.');
        }

        // Tự động nhận diện Giới tính
        const gender = await getOrDetectGender();
        const isMale = (gender === 'Nam');
        const shouldSkipSan = isMale || cfg.skipSanPhuKhoa;

        if (statusEl) {
            const genderTag = gender ? ` [Giới tính: ${gender}]` : '';
            statusEl.innerText = `⏳ Bắt đầu điền hồ sơ (${cfg.theLucRadio}${genderTag})...`;
        }

        // 1. THỂ LỰC
        await clickSubTab('THỂ LỰC');
        const paneTL = document.querySelector('.vertical-tabs .ant-tabs-tabpane-active') || document;

        const inputsTL = Array.from(paneTL.querySelectorAll('input[type="text"], input:not([type])'));
        if (inputsTL[0] && cfg.height) setAngularValue(inputsTL[0], cfg.height);
        if (inputsTL[1] && cfg.weight) setAngularValue(inputsTL[1], cfg.weight);
        if (inputsTL[3] && cfg.pulse) setAngularValue(inputsTL[3], cfg.pulse);
        if (inputsTL[4] && cfg.bp) setAngularValue(inputsTL[4], cfg.bp);

        const radiosTL = Array.from(paneTL.querySelectorAll('.ant-radio-wrapper'));
        const targetRadioTL = radiosTL.find(r => r.innerText.trim() === cfg.theLucRadio);
        if (targetRadioTL && !targetRadioTL.classList.contains('ant-radio-wrapper-checked')) {
            targetRadioTL.click();
        }

        // 2. KHÁM LÂM SÀNG (7 CHUYÊN KHOA)
        if (statusEl) statusEl.innerText = '⏳ Đang điền 7 chuyên khoa lâm sàng...';
        await clickSubTab('KHÁM LÂM SÀNG');
        const paneLS = document.querySelector('.vertical-tabs .ant-tabs-tabpane-active') || document;

        // 1. Nội khoa (8 chuyên khoa con: Tuần hoàn, Hô hấp, Tiêu hóa, Thận - Tiết niệu, Nội tiết, Cơ - Xương - Khớp, Thần kinh, Tâm thần)
        if (!cfg.skipNoiKhoa) {
            const noiKhoaRows = [
                { title: 'Tuần hoàn', text: texts.tuanHoan || defaultExamTexts.tuanHoan },
                { title: 'Hô hấp', text: texts.hoHap || defaultExamTexts.hoHap },
                { title: 'Tiêu hóa', text: texts.tieuHoa || defaultExamTexts.tieuHoa },
                { title: 'Thận - Tiết niệu', text: texts.thanTietNieu || defaultExamTexts.thanTietNieu },
                { title: 'Nội tiết', text: texts.noiTiet || defaultExamTexts.noiTiet },
                { title: 'Cơ - Xương - Khớp', text: texts.coXuongKhop || defaultExamTexts.coXuongKhop },
                { title: 'Thần kinh', text: texts.thanKinh || defaultExamTexts.thanKinh },
                { title: 'Tâm thần', text: texts.tamThan || defaultExamTexts.tamThan },
            ];
            for (const item of noiKhoaRows) {
                await fillExamTableRow(paneLS, item.title, item.text, cfg.plChuyenKhoa || "Loại I: Rất khỏe", cfg.docNoiKhoa);
            }
        }

        // 2. Ngoại khoa
        if (!cfg.skipNgoaiKhoa) {
            await fillExamTableRow(paneLS, 'Ngoại khoa', texts.ngoaiKhoa || defaultExamTexts.ngoaiKhoa, cfg.plChuyenKhoa || "Loại I: Rất khỏe", cfg.docNgoaiKhoa);
        }

        // 3. Da liễu
        if (!cfg.skipDaLieu) {
            await fillExamTableRow(paneLS, 'Da liễu', texts.daLieu || defaultExamTexts.daLieu, cfg.plChuyenKhoa || "Loại I: Rất khỏe", cfg.docDaLieu);
        }

        // 4. Sản phụ khoa (Tự động bỏ qua nếu là Nam)
        if (!shouldSkipSan) {
            await fillExamTableRow(paneLS, 'Sản phụ khoa', texts.sanPhuKhoa || defaultExamTexts.sanPhuKhoa, cfg.plChuyenKhoa || "Loại I: Rất khỏe", cfg.docSanPhuKhoa);
        }

        // 5. Mắt (Định vị đúng khối form Mắt, không lấy nhầm input ngầm của select)
        if (!cfg.skipMat) {
            const dfMat = findDynamicFormByTitle(paneLS, 'MẮT');
            if (dfMat) {
                const inputsMat = Array.from(dfMat.querySelectorAll('input:not(.ant-select-selection-search-input)'));
                const inpPhai = dfMat.querySelector('input[name="khong_kinh_mat_phai"]') || inputsMat[0];
                const inpTrai = dfMat.querySelector('input[name="khong_kinh_mat_trai"]') || inputsMat[1];
                const inpCoKinhPhai = dfMat.querySelector('input[name="co_kinh_mat_phai"]') || inputsMat[2];
                const inpCoKinhTrai = dfMat.querySelector('input[name="co_kinh_mat_trai"]') || inputsMat[3];

                if (inpPhai && cfg.matPhai) setAngularValue(inpPhai, cfg.matPhai);
                if (inpTrai && cfg.matTrai) setAngularValue(inpTrai, cfg.matTrai);
                if (inpCoKinhPhai && cfg.coKinhPhai) setAngularValue(inpCoKinhPhai, cfg.coKinhPhai);
                if (inpCoKinhTrai && cfg.coKinhTrai) setAngularValue(inpCoKinhTrai, cfg.coKinhTrai);

                const taMat = dfMat.querySelector('textarea');
                if (taMat) setAngularValue(taMat, texts.matKhac || defaultExamTexts.matKhac);

                const selectsMat = Array.from(dfMat.querySelectorAll('nz-select'));
                if (selectsMat[0]) await selectOption(selectsMat[0], cfg.plChuyenKhoa || "Loại I: Rất khỏe");
                if (selectsMat[1] && cfg.docMat) await selectOption(selectsMat[1], cfg.docMat);
            }
        }

        // 6. Tai - Mũi - Họng (Định vị đúng khối form TMH)
        if (!cfg.skipTmh) {
            const dfTmh = findDynamicFormByTitle(paneLS, 'TAI - MŨI - HỌNG') || findDynamicFormByTitle(paneLS, 'TAI');
            if (dfTmh) {
                const inputsTmh = Array.from(dfTmh.querySelectorAll('input:not(.ant-select-selection-search-input)'));
                if (inputsTmh[0]) setAngularValue(inputsTmh[0], cfg.thinhLucPThuong || '5');
                if (inputsTmh[1]) setAngularValue(inputsTmh[1], cfg.thinhLucPTham || '0.5');
                if (inputsTmh[2]) setAngularValue(inputsTmh[2], cfg.thinhLucTThuong || '5');
                if (inputsTmh[3]) setAngularValue(inputsTmh[3], cfg.thinhLucTTham || '0.5');

                const taTmh = dfTmh.querySelector('textarea');
                if (taTmh) setAngularValue(taTmh, texts.tmhKhac || defaultExamTexts.tmhKhac);

                const selectsTmh = Array.from(dfTmh.querySelectorAll('nz-select'));
                if (selectsTmh[0]) await selectOption(selectsTmh[0], cfg.plChuyenKhoa || "Loại I: Rất khỏe");
                if (selectsTmh[1] && cfg.docTmh) await selectOption(selectsTmh[1], cfg.docTmh);
            }
        }

        // 7. Răng - Hàm - Mặt (Định vị đúng khối form RHM)
        if (!cfg.skipRhm) {
            const dfRhm = findDynamicFormByTitle(paneLS, 'RĂNG - HÀM - MẶT') || findDynamicFormByTitle(paneLS, 'RĂNG');
            if (dfRhm) {
                const tasRhm = Array.from(dfRhm.querySelectorAll('textarea'));
                if (tasRhm[0]) setAngularValue(tasRhm[0], texts.rhmHamTren || defaultExamTexts.rhmHamTren);
                if (tasRhm[1]) setAngularValue(tasRhm[1], texts.rhmHamDuoi || defaultExamTexts.rhmHamDuoi);
                if (tasRhm[2]) setAngularValue(tasRhm[2], texts.rhmKhac || defaultExamTexts.rhmKhac);

                const selectsRhm = Array.from(dfRhm.querySelectorAll('nz-select'));
                if (selectsRhm[0]) await selectOption(selectsRhm[0], cfg.plChuyenKhoa || "Loại I: Rất khỏe");
                if (selectsRhm[1] && cfg.docRhm) await selectOption(selectsRhm[1], cfg.docRhm);
            }
        }

        // 3. KẾT LUẬN (Z10 & Phân loại 4 mức)
        if (statusEl) statusEl.innerText = '⏳ Đang điền Kết Luận & Chẩn đoán Z10...';
        await clickSubTab('KẾT LUẬN');
        const paneKL = document.querySelector('.vertical-tabs .ant-tabs-tabpane-active') || document;

        // Checkbox Phân loại sức khỏe (Loại I / II / III / IV)
        const cbsKL = Array.from(paneKL.querySelectorAll('.ant-checkbox-wrapper'));
        const targetCb = cbsKL.find(c => {
            const txt = c.innerText;
            if (cfg.plKetLuan.includes('Loại I:') && txt.includes('Loại I:')) return true;
            if (cfg.plKetLuan.includes('Loại II') && txt.includes('Loại II')) return true;
            if (cfg.plKetLuan.includes('Loại III') && txt.includes('Loại III')) return true;
            if (cfg.plKetLuan.includes('Loại IV') && txt.includes('Loại IV')) return true;
            return false;
        });

        if (targetCb && !targetCb.classList.contains('ant-checkbox-wrapper-checked')) {
            targetCb.click();
        }
        // Bỏ chọn các loại khác
        cbsKL.forEach(c => {
            if (c !== targetCb && (c.innerText.includes('Loại I:') || c.innerText.includes('Loại II') || c.innerText.includes('Loại III') || c.innerText.includes('Loại IV') || c.innerText.includes('Loại V'))) {
                if (c.classList.contains('ant-checkbox-wrapper-checked')) {
                    c.click();
                }
            }
        });

        // Điền ô Kết luận bệnh: Z10 (Mặc định)
        const klbSelect = paneKL.querySelector('nz-select.ant-select-multiple') || 
                          Array.from(paneKL.querySelectorAll('nz-select')).find(s => {
                              const parentTxt = s.closest('.ant-form-item, nz-form-item, div.row, div')?.innerText || '';
                              return parentTxt.includes('Kết luận bệnh');
                          });
        if (klbSelect) {
            const icdTarget = cfg.icdKetLuan || 'Z10';
            const currentSelected = klbSelect.innerText.trim();
            if (!currentSelected.includes(icdTarget)) {
                const topCtrl = klbSelect.querySelector('nz-select-top-control') || klbSelect;
                topCtrl.click();
                await delay(120);

                const searchInp = klbSelect.querySelector('.ant-select-selection-search-input');
                if (searchInp) {
                    searchInp.focus();
                    searchInp.value = icdTarget;
                    searchInp.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                    searchInp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Z', code: 'KeyZ', bubbles: true }));
                    searchInp.dispatchEvent(new KeyboardEvent('keyup', { key: 'Z', code: 'KeyZ', bubbles: true }));
                }

                for (let i = 0; i < 20; i++) {
                    await delay(90);
                    const opts = Array.from(document.querySelectorAll('.ant-select-item-option'));
                    const z10Opt = opts.find(o => o.innerText.includes(icdTarget));
                    if (z10Opt) {
                        z10Opt.click();
                        await delay(150);
                        break;
                    }
                }
                document.body.click();
            }
        }

        // Xác nhận kết thúc khám
        const cbKetThuc = cbsKL.find(c => c.innerText.includes('Xác nhận kết thúc khám') || c.closest('div')?.innerText?.includes('Xác nhận kết thúc khám')) || cbsKL[cbsKL.length - 1];
        if (cbKetThuc && !cbKetThuc.classList.contains('ant-checkbox-wrapper-checked')) {
            cbKetThuc.click();
        }

        // Bác sĩ kết luận
        const selectsKL = Array.from(paneKL.querySelectorAll('nz-select'));
        const docSelectKL = selectsKL[1] || selectsKL[selectsKL.length - 1];
        if (docSelectKL && cfg.docKetLuan) {
            await selectOption(docSelectKL, cfg.docKetLuan);
        }

        // Giờ kết thúc
        const timeInput = paneKL.querySelector('input[placeholder="__:__"]');
        if (timeInput) {
            setAngularValue(timeInput, cfg.gioKetThuc || '07:45');
        }

        // Bấm Lưu (F11)
        if (cfg.autoSave) {
            if (statusEl) statusEl.innerText = '⏳ Đang bấm Lưu Khám (F11)...';
            await delay(350);
            const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Lưu' || b.innerText.includes('Lưu (F11)'));
            if (saveBtn) {
                saveBtn.click();
                for (let i = 0; i < 25; i++) {
                    await delay(150);
                    const err = checkHisErrorMessage();
                    if (err) throw new Error(`HIS báo lỗi: ${err}`);
                    if (!saveBtn.classList.contains('ant-btn-loading')) break;
                }
                await delay(300);
                const lateErr = checkHisErrorMessage();
                if (lateErr) throw new Error(`HIS báo lỗi: ${lateErr}`);
                if (statusEl) statusEl.innerText = `✅ ĐÃ ĐIỀN XONG & ĐÃ LƯU (${cfg.theLucRadio} • Z10 • Cao ${cfg.height} • Nặng ${cfg.weight})!`;
            } else {
                if (statusEl) statusEl.innerText = '✅ ĐÃ ĐIỀN XONG (Vui lòng bấm Lưu)!';
            }
        } else {
            if (statusEl) statusEl.innerText = '✅ ĐÃ ĐIỀN XONG THEO THÔNG SỐ (Chưa bấm Lưu)!';
        }
    }

    // ----------------------------------------------------
    // 4. QUY TRÌNH LIÊN HOÀN (TIẾP ĐÓN ➔ KHÁM (F6) ➔ LƯU)
    // ----------------------------------------------------
    async function runFullWorkflow(statusEl) {
        const patientBanner = getSelectedPatientBanner();
        if (!patientBanner) {
            if (statusEl) {
                statusEl.innerText = '⚠️ Vui lòng gõ Tên hoặc CCCD vào ô Tìm kiếm HIS trước!';
            }
            return;
        }

        if (statusEl) statusEl.innerText = '🚀 [1/3] Đang điền Tiếp đón bắt buộc...';
        await fillTiepDonConfig(statusEl);
        await delay(400);

        if (statusEl) statusEl.innerText = '🚀 [2/3] Đang lưu Tiếp đón (F11)...';
        await saveTiepDon(statusEl);
        await delay(600);

        if (statusEl) statusEl.innerText = '🚀 [3/3] Đang chuyển sang Khám sức khoẻ (F6)...';
        await navigateToKhamSucKhoe(statusEl);
        await delay(500);

        await fillKhamTheoBangGiaoDien(statusEl);

        if (statusEl) statusEl.innerText = '🎉 HOÀN TẤT: Tiếp đón ➔ Khám sức khoẻ ➔ Đã lưu thành công!';
    }

    // ----------------------------------------------------
    // ÁP DỤNG 4 PHÂN LOẠI SỨC KHỎE (KHÔNG HARDCODE MẮT)
    // ----------------------------------------------------
    function applyHealthLevel(level) {
        const lvlStr = String(level);
        let theLuc = 'Loại 1';
        let ck = 'Loại I: Rất khỏe';

        if (lvlStr === '1') {
            theLuc = 'Loại 1';
            ck = 'Loại I: Rất khỏe';
        } else if (lvlStr === '2') {
            theLuc = 'Loại 2';
            ck = 'Loại II: Khỏe';
        } else if (lvlStr === '3') {
            theLuc = 'Loại 3';
            ck = 'Loại III: Trung bình';
        } else if (lvlStr === '4') {
            theLuc = 'Loại 4';
            ck = 'Loại IV: Yếu';
        }

        const theLucSelect = document.getElementById('cfg-theluc-pl');
        if (theLucSelect) theLucSelect.value = theLuc;

        const plCkSelect = document.getElementById('cfg-pl-ck');
        if (plCkSelect) plCkSelect.value = ck;

        const plKlSelect = document.getElementById('cfg-pl-ketluan');
        if (plKlSelect) plKlSelect.value = ck;

        // Cập nhật cấu hình nhưng BẢO TOÀN thị lực mắt
        const cfg = loadConfig();
        cfg.selectedLevel = lvlStr;
        cfg.theLucRadio = theLuc;
        cfg.plChuyenKhoa = ck;
        cfg.plKetLuan = ck;
        saveConfig(cfg);

        updateHealthLevelUI(lvlStr);
    }

    function updateHealthLevelUI(level) {
        const lvlStr = String(level);
        for (let i = 1; i <= 4; i++) {
            const btn = document.getElementById(`btn-level-${i}`);
            if (btn) {
                if (String(i) === lvlStr) {
                    btn.style.borderColor = '#1890ff';
                    btn.style.backgroundColor = '#e6f7ff';
                    btn.style.color = '#0050b3';
                    btn.style.fontWeight = 'bold';
                    btn.style.boxShadow = '0 0 0 2px rgba(24,144,255,0.2)';
                } else {
                    btn.style.borderColor = '#d9d9d9';
                    btn.style.backgroundColor = '#ffffff';
                    btn.style.color = '#595959';
                    btn.style.fontWeight = 'normal';
                    btn.style.boxShadow = 'none';
                }
            }
        }
    }

    function readConfigFromUI() {
        const currentCfg = loadConfig();
        return {
            activeTab: currentCfg.activeTab || 'tiepdon',
            selectedLevel: currentCfg.selectedLevel || '1',
            autoPilot: document.getElementById('cfg-auto-pilot')?.checked ?? false,

            height: document.getElementById('cfg-height')?.value?.trim() || '150',
            weight: document.getElementById('cfg-weight')?.value?.trim() || '48',
            pulse: document.getElementById('cfg-pulse')?.value?.trim() || '80',
            bp: document.getElementById('cfg-bp')?.value?.trim() || '100/60',
            theLucRadio: document.getElementById('cfg-theluc-pl')?.value || 'Loại 1',

            docNoiKhoa: document.getElementById('cfg-doc-noi')?.value?.trim() || '',
            skipNoiKhoa: document.getElementById('cfg-skip-noi')?.checked ?? false,

            docNgoaiKhoa: document.getElementById('cfg-doc-ngoai')?.value?.trim() || '',
            skipNgoaiKhoa: document.getElementById('cfg-skip-ngoai')?.checked ?? false,

            docDaLieu: document.getElementById('cfg-doc-dalieu')?.value?.trim() || '',
            skipDaLieu: document.getElementById('cfg-skip-dalieu')?.checked ?? false,

            docSanPhuKhoa: document.getElementById('cfg-doc-san')?.value?.trim() || '',
            skipSanPhuKhoa: document.getElementById('cfg-skip-san')?.checked ?? true,

            matPhai: document.getElementById('cfg-mat-phai')?.value?.trim() || '10',
            matTrai: document.getElementById('cfg-mat-trai')?.value?.trim() || '10',
            coKinhPhai: document.getElementById('cfg-co-kinh-p')?.value?.trim() || '',
            coKinhTrai: document.getElementById('cfg-co-kinh-t')?.value?.trim() || '',
            docMat: document.getElementById('cfg-doc-mat')?.value?.trim() || '',
            skipMat: document.getElementById('cfg-skip-mat')?.checked ?? false,

            thinhLucPThuong: document.getElementById('cfg-tl-pt')?.value?.trim() || '5',
            thinhLucPTham: document.getElementById('cfg-tl-pth')?.value?.trim() || '0.5',
            thinhLucTThuong: document.getElementById('cfg-tl-tt')?.value?.trim() || '5',
            thinhLucTTham: document.getElementById('cfg-tl-tth')?.value?.trim() || '0.5',
            docTmh: document.getElementById('cfg-doc-tmh')?.value?.trim() || '',
            skipTmh: document.getElementById('cfg-skip-tmh')?.checked ?? false,

            docRhm: document.getElementById('cfg-doc-rhm')?.value?.trim() || '',
            skipRhm: document.getElementById('cfg-skip-rhm')?.checked ?? false,

            plChuyenKhoa: document.getElementById('cfg-pl-ck')?.value || 'Loại I: Rất khỏe',
            plKetLuan: document.getElementById('cfg-pl-ketluan')?.value || 'Loại I: Rất khỏe',
            icdKetLuan: document.getElementById('cfg-icd-kl')?.value?.trim() || 'Z10',
            docKetLuan: document.getElementById('cfg-doc-ketluan')?.value?.trim() || '',
            gioKetThuc: document.getElementById('cfg-gio-kt')?.value?.trim() || '07:45',
            autoSave: document.getElementById('cfg-auto-save')?.checked ?? true,

            examTexts: {
                tuanHoan: document.getElementById('cfg-txt-tuanhoan')?.value?.trim() || defaultExamTexts.tuanHoan,
                hoHap: document.getElementById('cfg-txt-hohap')?.value?.trim() || defaultExamTexts.hoHap,
                tieuHoa: document.getElementById('cfg-txt-tieuhoa')?.value?.trim() || defaultExamTexts.tieuHoa,
                thanTietNieu: document.getElementById('cfg-txt-thantn')?.value?.trim() || defaultExamTexts.thanTietNieu,
                noiTiet: document.getElementById('cfg-txt-noitiet')?.value?.trim() || defaultExamTexts.noiTiet,
                coXuongKhop: document.getElementById('cfg-txt-coxuongkhop')?.value?.trim() || defaultExamTexts.coXuongKhop,
                thanKinh: document.getElementById('cfg-txt-thankinh')?.value?.trim() || defaultExamTexts.thanKinh,
                tamThan: document.getElementById('cfg-txt-tamthan')?.value?.trim() || defaultExamTexts.tamThan,
                ngoaiKhoa: document.getElementById('cfg-txt-ngoaikhoa')?.value?.trim() || defaultExamTexts.ngoaiKhoa,
                daLieu: document.getElementById('cfg-txt-dalieu')?.value?.trim() || defaultExamTexts.daLieu,
                sanPhuKhoa: document.getElementById('cfg-txt-sanphukhoa')?.value?.trim() || defaultExamTexts.sanPhuKhoa,
                matKhac: document.getElementById('cfg-txt-matkhac')?.value?.trim() || defaultExamTexts.matKhac,
                tmhKhac: document.getElementById('cfg-txt-tmhkhac')?.value?.trim() || defaultExamTexts.tmhKhac,
                rhmHamTren: document.getElementById('cfg-txt-rhmhamtren')?.value?.trim() || defaultExamTexts.rhmHamTren,
                rhmHamDuoi: document.getElementById('cfg-txt-rhmhamduoi')?.value?.trim() || defaultExamTexts.rhmHamDuoi,
                rhmKhac: document.getElementById('cfg-txt-rhmkhac')?.value?.trim() || defaultExamTexts.rhmKhac
            }
        };
    }

    let isRunning = false;
    async function executeSafe(actionFn, btnEl, originalHtml) {
        if (isRunning) return;
        isRunning = true;
        const statusEl = document.getElementById('his-panel-status');
        let savedHtml = '';
        if (btnEl) {
            btnEl.disabled = true;
            savedHtml = originalHtml || btnEl.innerHTML;
            btnEl.innerText = '⏳ Đang xử lý...';
        }

        try {
            await actionFn(statusEl);
        } catch (e) {
            console.error('Lỗi tự động hóa:', e);
            if (statusEl) statusEl.innerText = '❌ ' + e.message;
        } finally {
            isRunning = false;
            if (btnEl) {
                btnEl.disabled = false;
                btnEl.innerHTML = savedHtml;
            }
        }
    }

    // ----------------------------------------------------
    // 5. BẢNG ĐIỀU KHIỂN GIAO DIỆN TỐI GIẢN (CHỮ TO, 2 MODULE)
    // ----------------------------------------------------
    function switchPanelTab(tabName) {
        const cfg = loadConfig();
        cfg.activeTab = tabName;
        saveConfig(cfg);

        const tabBtnTD = document.getElementById('tab-btn-tiepdon');
        const tabBtnKB = document.getElementById('tab-btn-khambenh');
        const tabBtnCD = document.getElementById('tab-btn-caidat');

        const secTD = document.getElementById('section-tiepdon');
        const secKB = document.getElementById('section-khambenh');
        const secCD = document.getElementById('section-caidat');

        if (tabBtnTD && tabBtnKB && tabBtnCD) {
            tabBtnTD.style.borderBottom = (tabName === 'tiepdon') ? '3px solid #1890ff' : 'none';
            tabBtnTD.style.color = (tabName === 'tiepdon') ? '#1890ff' : '#595959';
            tabBtnTD.style.fontWeight = (tabName === 'tiepdon') ? 'bold' : 'normal';

            tabBtnKB.style.borderBottom = (tabName === 'khambenh') ? '3px solid #1890ff' : 'none';
            tabBtnKB.style.color = (tabName === 'khambenh') ? '#1890ff' : '#595959';
            tabBtnKB.style.fontWeight = (tabName === 'khambenh') ? 'bold' : 'normal';

            tabBtnCD.style.borderBottom = (tabName === 'caidat') ? '3px solid #1890ff' : 'none';
            tabBtnCD.style.color = (tabName === 'caidat') ? '#1890ff' : '#595959';
            tabBtnCD.style.fontWeight = (tabName === 'caidat') ? 'bold' : 'normal';
        }

        if (secTD) secTD.style.display = (tabName === 'tiepdon') ? 'block' : 'none';
        if (secKB) secKB.style.display = (tabName === 'khambenh') ? 'block' : 'none';
        if (secCD) secCD.style.display = (tabName === 'caidat') ? 'block' : 'none';
    }

    let lastObservedHisTab = '';
    function syncContextTab() {
        const activeTopTab = document.querySelector('.tab-app-main .ant-tabs-tab-active')?.innerText || '';
        if (activeTopTab && activeTopTab !== lastObservedHisTab) {
            lastObservedHisTab = activeTopTab;
            if (activeTopTab.includes('Tiếp đón')) {
                switchPanelTab('tiepdon');
            } else if (activeTopTab.includes('Khám sức khỏe') || activeTopTab.includes('Khám bệnh')) {
                switchPanelTab('khambenh');
            }
        }
    }

    function updatePatientBannerDisplay() {
        const bannerEl = document.getElementById('his-patient-banner');
        if (!bannerEl) return;

        const info = getSelectedPatientBanner();
        if (info) {
            bannerEl.innerHTML = `🟢 <b>Đang chọn:</b> <span style="color:#0958d9; font-weight: bold;">${escapeHtml(info)}</span>`;
            bannerEl.style.backgroundColor = '#e6f4ff';
            bannerEl.style.borderColor = '#91caff';
            bannerEl.style.color = '#003eb3';
        } else {
            bannerEl.innerHTML = `⚠️ <b>Chưa chọn người khám:</b> Hãy gõ Tên hoặc CCCD vào ô Tìm kiếm HIS`;
            bannerEl.style.backgroundColor = '#fffbe6';
            bannerEl.style.borderColor = '#ffe58f';
            bannerEl.style.color = '#d46b08';
        }

        const agePreview = document.getElementById('txt-age-preview');
        if (agePreview) {
            const ageGroup = detectAgeGroup();
            const ageLabel = getPatientAgeLabel();
            if (ageGroup === 'dưới 6 tuổi') {
                agePreview.innerHTML = `<span style="color:#d46b08; font-weight:bold;">${escapeHtml(ageLabel)}</span> (Trẻ em)`;
            } else if (ageGroup === 'từ đủ 6 tuổi đến dưới 18 tuổi') {
                agePreview.innerHTML = `<span style="color:#0958d9; font-weight:bold;">${escapeHtml(ageLabel)}</span> (Học sinh)`;
            } else {
                agePreview.innerHTML = `<span style="color:#389e0d; font-weight:bold;">${escapeHtml(ageLabel)}</span> (Người lớn)`;
            }
        }

        const genderPreview = document.getElementById('txt-gender-preview');
        if (genderPreview) {
            if (cachedPatient.gender === 'Nam') {
                genderPreview.innerHTML = '<span style="color:#0958d9; font-weight:bold;">Nam</span> (Tự động bỏ qua Sản phụ khoa)';
            } else if (cachedPatient.gender === 'Nữ') {
                genderPreview.innerHTML = '<span style="color:#d4380d; font-weight:bold;">Nữ</span> (Điền Sản phụ khoa: Bình thường)';
            } else {
                genderPreview.innerText = 'Tự động nhận diện (Nam tự bỏ Sản)';
            }
        }
    }

    function mountControlPanel() {
        if (document.getElementById('his-tool-control-panel')) {
            updatePatientBannerDisplay();
            syncContextTab();
            return;
        }

        const cfg = loadConfig();
        const texts = cfg.examTexts || defaultExamTexts;

        const panel = document.createElement('div');
        panel.id = 'his-tool-control-panel';
        panel.style.position = 'fixed';
        panel.style.bottom = '15px';
        panel.style.right = '15px';
        panel.style.width = '460px';
        panel.style.backgroundColor = '#ffffff';
        panel.style.borderRadius = '12px';
        panel.style.boxShadow = '0 10px 32px rgba(0,0,0,0.18)';
        panel.style.zIndex = '2147483647';
        panel.style.fontFamily = 'Segoe UI, Roboto, -apple-system, sans-serif';
        panel.style.border = '1.5px solid #d9d9d9';
        panel.style.overflow = 'hidden';

        panel.innerHTML = `
            <!-- HEADER TỐI GIẢN CHUẨN Y TẾ -->
            <div style="background: #fafafa; border-bottom: 1px solid #e8e8e8; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 16px;">🏥</span>
                    <b style="font-size: 14.5px; color: #1f1f1f; letter-spacing: 0.2px;">HIS V20 - HỖ TRỢ KHÁM SỨC KHỎE</b>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <button id="his-panel-toggle-btn" style="background: transparent; border: 1px solid #d9d9d9; color: #595959; font-size: 12px; cursor: pointer; border-radius: 4px; padding: 2px 8px; font-weight: 600;">➖ Thu nhỏ</button>
                </div>
            </div>

            <!-- THANH ĐIỀU HƯỚNG 3 MODULE / TAB -->
            <div style="display: flex; background: #ffffff; border-bottom: 1px solid #f0f0f0;">
                <button id="tab-btn-tiepdon" type="button" style="flex: 1; padding: 9px 4px; background: none; border: none; font-size: 13px; cursor: pointer; transition: all 0.2s;">
                    📋 1. Tiếp Đón
                </button>
                <button id="tab-btn-khambenh" type="button" style="flex: 1; padding: 9px 4px; background: none; border: none; font-size: 13px; cursor: pointer; transition: all 0.2s;">
                    🩺 2. Khám Sức Khỏe
                </button>
                <button id="tab-btn-caidat" type="button" style="flex: 1; padding: 9px 4px; background: none; border: none; font-size: 13px; cursor: pointer; transition: all 0.2s;">
                    ⚙️ Cài Đặt
                </button>
            </div>

            <!-- PHẦN THÂN BẢNG ĐIỀU KHIỂN -->
            <div id="his-panel-body" style="padding: 12px 14px; font-size: 13px; color: #262626; max-height: 580px; overflow-y: auto;">
                
                <!-- BANNER BỆNH NHÂN HIỆN TẠI TỪ Ô TÌM KIẾM -->
                <div id="his-patient-banner" style="padding: 8px 10px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 12.5px; margin-bottom: 10px; word-break: break-all;">
                    Đang nạp thông tin...
                </div>

                <!-- ============================================== -->
                <!-- MODULE 1: TIẾP ĐÓN KHÁM SỨC KHỎE               -->
                <!-- ============================================== -->
                <div id="section-tiepdon">
                    <div style="background: #fcfcfc; border: 1px solid #ebebeb; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px;">
                        <div style="font-size: 12.5px; color: #595959; margin-bottom: 6px;">
                            💡 <b>Quy trình tiếp đón từ phiếu giấy:</b><br>
                            1. Gõ Tên hoặc số CCCD vào ô Tìm kiếm phía trên của HIS.<br>
                            2. Bấm nút dưới để tiện ích tự động khớp nhóm tuổi và lưu.
                        </div>
                    </div>

                    <button id="btn-td-and-kham" type="button" style="width: 100%; padding: 12px 10px; background: #1890ff; color: #ffffff; border: none; border-radius: 8px; font-size: 14.5px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 8px rgba(24,144,255,0.3); margin-bottom: 8px;">
                        🚀 TIẾP ĐÓN ➔ SANG KHÁM SỨC KHỎE (F6)
                        <div style="font-size: 11px; font-weight: normal; opacity: 0.9; margin-top: 2px;">Điền mục bắt buộc (*), bấm Lưu (F11) và mở màn hình Khám Sức Khỏe</div>
                    </button>

                    <button id="btn-fill-td-only" type="button" style="width: 100%; padding: 8px 8px; background: #ffffff; color: #262626; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 12.5px; font-weight: 600; cursor: pointer; margin-bottom: 4px;">
                        ⚡ Chỉ Điền Tiếp Đón (*) (Chưa sang Khám Sức Khỏe)
                    </button>
                </div>

                <!-- ============================================== -->
                <!-- MODULE 2: KHÁM SỨC KHỎE                        -->
                <!-- ============================================== -->
                <div id="section-khambenh" style="display: none;">
                    <!-- BỘ CHỌN 4 PHÂN LOẠI SỨC KHỎE TO RÕ -->
                    <div style="margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span style="font-weight: 600; font-size: 12.5px; color: #262626;">Phân loại sức khỏe (1 chạm):</span>
                            <span style="font-size: 11px; color: #8c8c8c;">Không ghi đè thị lực mắt</span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
                            <button id="btn-level-1" type="button" style="padding: 7px 2px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 12px; cursor: pointer; text-align: center; background: #ffffff;">
                                🟢 <b>Loại 1</b><br><span style="font-size: 10px;">Rất khỏe</span>
                            </button>
                            <button id="btn-level-2" type="button" style="padding: 7px 2px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 12px; cursor: pointer; text-align: center; background: #ffffff;">
                                🔵 <b>Loại 2</b><br><span style="font-size: 10px;">Khỏe</span>
                            </button>
                            <button id="btn-level-3" type="button" style="padding: 7px 2px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 12px; cursor: pointer; text-align: center; background: #ffffff;">
                                🟡 <b>Loại 3</b><br><span style="font-size: 10px;">T.bình</span>
                            </button>
                            <button id="btn-level-4" type="button" style="padding: 7px 2px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 12px; cursor: pointer; text-align: center; background: #ffffff;">
                                🟠 <b>Loại 4</b><br><span style="font-size: 10px;">Yếu</span>
                            </button>
                        </div>
                    </div>

                    <!-- THÔNG TIN KẾT LUẬN & CHẨN ĐOÁN MẶC ĐỊNH -->
                    <div style="background: #fafafa; border: 1px solid #f0f0f0; border-radius: 6px; padding: 8px 10px; margin-bottom: 10px; font-size: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span>Chẩn đoán KL:</span>
                            <b style="color: #0050b3;">Z10 (Khám SK định kỳ)</b>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span>Đối tượng tuổi:</span>
                            <span id="txt-age-preview" style="font-weight: 600; color: #595959;">Tự động nhận diện</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Giới tính:</span>
                            <span id="txt-gender-preview" style="font-weight: 600; color: #595959;">Tự động nhận diện (Nam tự bỏ Sản)</span>
                        </div>
                    </div>

                    <!-- NÚT CHÍNH ĐIỀN KHÁM SIÊU TỐC -->
                    <button id="his-panel-run-btn" type="button" style="width: 100%; padding: 13px 10px; background: #52c41a; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 8px rgba(82,196,26,0.35); margin-bottom: 8px;">
                        🚀 ĐIỀN KHÁM SỨC KHỎE & LƯU (F9)
                        <div style="font-size: 11px; font-weight: normal; opacity: 0.95; margin-top: 2px;">Tự điền Thể lực, 7 Chuyên khoa, Chẩn đoán Z10 & bấm Lưu</div>
                    </button>

                    <button id="btn-switch-kham" type="button" style="width: 100%; padding: 8px 8px; background: #ffffff; color: #262626; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 12.5px; font-weight: 600; cursor: pointer;">
                        🩺 Mở màn hình Khám Sức Khỏe (F6)
                    </button>
                </div>

                <!-- ============================================== -->
                <!-- MODULE 3: CÀI ĐẶT & TÙY CHỈNH THÔNG SỐ SÂU     -->
                <!-- ============================================== -->
                <div id="section-caidat" style="display: none;">
                    
                    <!-- THỂ LỰC & CHỈ SỐ -->
                    <div style="margin-bottom: 12px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">
                        <b style="font-size: 13px; color: #262626;">1. Chỉ số thể lực & Sinh hiệu:</b>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 6px;">
                            <div>
                                <label style="font-size: 11px; color: #595959; display: block;">Cao (cm):</label>
                                <input id="cfg-height" type="text" value="${escapeHtml(cfg.height)}" style="width: 100%; height: 30px; text-align: center; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; box-sizing: border-box;">
                            </div>
                            <div>
                                <label style="font-size: 11px; color: #595959; display: block;">Nặng (kg):</label>
                                <input id="cfg-weight" type="text" value="${escapeHtml(cfg.weight)}" style="width: 100%; height: 30px; text-align: center; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; box-sizing: border-box;">
                            </div>
                            <div>
                                <label style="font-size: 11px; color: #595959; display: block;">Mạch (l/p):</label>
                                <input id="cfg-pulse" type="text" value="${escapeHtml(cfg.pulse)}" style="width: 100%; height: 30px; text-align: center; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; box-sizing: border-box;">
                            </div>
                            <div>
                                <label style="font-size: 11px; color: #595959; display: block;">Huyết áp:</label>
                                <input id="cfg-bp" type="text" value="${escapeHtml(cfg.bp)}" style="width: 100%; height: 30px; text-align: center; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; box-sizing: border-box;">
                            </div>
                        </div>
                        <div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 11.5px; color: #595959;">Phân loại thể lực:</span>
                            <select id="cfg-theluc-pl" style="height: 28px; padding: 2px 8px; border-radius: 4px; border: 1px solid #d9d9d9; font-weight: 600; font-size: 12px;">
                                <option value="Loại 1" ${cfg.theLucRadio === 'Loại 1' ? 'selected' : ''}>Loại 1 (Tốt)</option>
                                <option value="Loại 2" ${cfg.theLucRadio === 'Loại 2' ? 'selected' : ''}>Loại 2 (Khá)</option>
                                <option value="Loại 3" ${cfg.theLucRadio === 'Loại 3' ? 'selected' : ''}>Loại 3 (Trung bình)</option>
                                <option value="Loại 4" ${cfg.theLucRadio === 'Loại 4' ? 'selected' : ''}>Loại 4 (Yếu)</option>
                            </select>
                        </div>
                    </div>

                    <!-- THỊ LỰC MẮT ĐỘC LẬP (KHÔNG BỊ GHI ĐÈ) -->
                    <div style="margin-bottom: 12px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">
                        <b style="font-size: 13px; color: #262626;">2. Thị lực mắt (Cấu hình độc lập):</b>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
                            <div>
                                <label style="font-size: 11px; color: #595959; display: block;">Mắt Phải (không kính):</label>
                                <input id="cfg-mat-phai" type="text" value="${escapeHtml(cfg.matPhai)}" style="width: 100%; height: 28px; text-align: center; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; box-sizing: border-box;">
                            </div>
                            <div>
                                <label style="font-size: 11px; color: #595959; display: block;">Mắt Trái (không kính):</label>
                                <input id="cfg-mat-trai" type="text" value="${escapeHtml(cfg.matTrai)}" style="width: 100%; height: 28px; text-align: center; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; box-sizing: border-box;">
                            </div>
                        </div>
                    </div>

                    <!-- 7 CHUYÊN KHOA & BÁC SĨ -->
                    <div style="margin-bottom: 12px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <b style="font-size: 13px; color: #262626;">3. Bác sĩ 7 Chuyên khoa:</b>
                            <select id="cfg-pl-ck" style="height: 26px; font-size: 11.5px; border-radius: 4px; border: 1px solid #d9d9d9;">
                                <option value="Loại I: Rất khỏe" ${cfg.plChuyenKhoa.includes('Loại I:') ? 'selected' : ''}>Loại I: Rất khỏe</option>
                                <option value="Loại II: Khỏe" ${cfg.plChuyenKhoa.includes('Loại II') ? 'selected' : ''}>Loại II: Khỏe</option>
                                <option value="Loại III: Trung bình" ${cfg.plChuyenKhoa.includes('Loại III') ? 'selected' : ''}>Loại III: Trung bình</option>
                                <option value="Loại IV: Yếu" ${cfg.plChuyenKhoa.includes('Loại IV') ? 'selected' : ''}>Loại IV: Yếu</option>
                            </select>
                        </div>

                        <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                            <tr style="background: #fafafa; color: #595959;">
                                <th style="padding: 4px 6px; border: 1px solid #f0f0f0; text-align: left;">Chuyên khoa</th>
                                <th style="padding: 4px 6px; border: 1px solid #f0f0f0; text-align: center; width: 75px;">Mã BS</th>
                                <th style="padding: 4px 6px; border: 1px solid #f0f0f0; text-align: center; width: 60px;">Bỏ qua</th>
                            </tr>
                            <tr>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0;">Nội khoa</td>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0; text-align: center;"><input id="cfg-doc-noi" type="text" value="${escapeHtml(cfg.docNoiKhoa)}" style="width: 65px; height: 24px; text-align: center; border: 1px solid #d9d9d9; border-radius: 3px; font-weight: bold;"></td>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0; text-align: center;"><input id="cfg-skip-noi" type="checkbox" ${cfg.skipNoiKhoa ? 'checked' : ''}></td>
                            </tr>
                            <tr style="background: #fcfcfc;">
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0;">Ngoại khoa</td>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0; text-align: center;"><input id="cfg-doc-ngoai" type="text" value="${escapeHtml(cfg.docNgoaiKhoa)}" style="width: 65px; height: 24px; text-align: center; border: 1px solid #d9d9d9; border-radius: 3px; font-weight: bold;"></td>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0; text-align: center;"><input id="cfg-skip-ngoai" type="checkbox" ${cfg.skipNgoaiKhoa ? 'checked' : ''}></td>
                            </tr>
                            <tr>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0;">Da liễu</td>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0; text-align: center;"><input id="cfg-doc-dalieu" type="text" value="${escapeHtml(cfg.docDaLieu)}" style="width: 65px; height: 24px; text-align: center; border: 1px solid #d9d9d9; border-radius: 3px; font-weight: bold;"></td>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0; text-align: center;"><input id="cfg-skip-dalieu" type="checkbox" ${cfg.skipDaLieu ? 'checked' : ''}></td>
                            </tr>
                            <tr style="background: #fcfcfc;">
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0;">Sản phụ khoa (Nữ)</td>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0; text-align: center;"><input id="cfg-doc-san" type="text" value="${escapeHtml(cfg.docSanPhuKhoa)}" style="width: 65px; height: 24px; text-align: center; border: 1px solid #d9d9d9; border-radius: 3px;"></td>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0; text-align: center;"><input id="cfg-skip-san" type="checkbox" ${cfg.skipSanPhuKhoa ? 'checked' : ''} title="Nam sẽ tự động bỏ qua"></td>
                            </tr>
                            <tr>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0;">Mắt</td>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0; text-align: center;"><input id="cfg-doc-mat" type="text" value="${escapeHtml(cfg.docMat)}" style="width: 65px; height: 24px; text-align: center; border: 1px solid #d9d9d9; border-radius: 3px; font-weight: bold;"></td>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0; text-align: center;"><input id="cfg-skip-mat" type="checkbox" ${cfg.skipMat ? 'checked' : ''}></td>
                            </tr>
                            <tr style="background: #fcfcfc;">
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0;">Tai Mũi Họng</td>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0; text-align: center;"><input id="cfg-doc-tmh" type="text" value="${escapeHtml(cfg.docTmh)}" style="width: 65px; height: 24px; text-align: center; border: 1px solid #d9d9d9; border-radius: 3px; font-weight: bold;"></td>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0; text-align: center;"><input id="cfg-skip-tmh" type="checkbox" ${cfg.skipTmh ? 'checked' : ''}></td>
                            </tr>
                            <tr>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0;">Răng Hàm Mặt</td>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0; text-align: center;"><input id="cfg-doc-rhm" type="text" value="${escapeHtml(cfg.docRhm)}" style="width: 65px; height: 24px; text-align: center; border: 1px solid #d9d9d9; border-radius: 3px; font-weight: bold;"></td>
                                <td style="padding: 3px 6px; border: 1px solid #f0f0f0; text-align: center;"><input id="cfg-skip-rhm" type="checkbox" ${cfg.skipRhm ? 'checked' : ''}></td>
                            </tr>
                        </table>
                    </div>

                    <!-- KẾT LUẬN & CHẨN ĐOÁN Z10 -->
                    <div style="margin-bottom: 12px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">
                        <b style="font-size: 13px; color: #262626;">4. Kết luận & Chẩn đoán:</b>
                        <div style="display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 6px; margin-top: 6px;">
                            <div>
                                <label style="font-size: 11px; color: #595959; display: block;">Phân loại KSK:</label>
                                <select id="cfg-pl-ketluan" style="width: 100%; height: 30px; font-size: 11.5px; border-radius: 4px; border: 1px solid #d9d9d9; font-weight: 600;">
                                    <option value="Loại I: Rất khỏe" ${cfg.plKetLuan.includes('Loại I:') ? 'selected' : ''}>Loại I: Rất khỏe</option>
                                    <option value="Loại II: Khỏe" ${cfg.plKetLuan.includes('Loại II') ? 'selected' : ''}>Loại II: Khỏe</option>
                                    <option value="Loại III: Trung bình" ${cfg.plKetLuan.includes('Loại III') ? 'selected' : ''}>Loại III: Trung bình</option>
                                    <option value="Loại IV: Yếu" ${cfg.plKetLuan.includes('Loại IV') ? 'selected' : ''}>Loại IV: Yếu</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 11px; color: #595959; display: block;">Mã bệnh KL:</label>
                                <input id="cfg-icd-kl" type="text" value="${escapeHtml(cfg.icdKetLuan || 'Z10')}" placeholder="Z10" style="width: 100%; height: 30px; text-align: center; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; box-sizing: border-box;">
                            </div>
                            <div>
                                <label style="font-size: 11px; color: #595959; display: block;">BS Kết luận:</label>
                                <input id="cfg-doc-ketluan" type="text" value="${escapeHtml(cfg.docKetLuan)}" placeholder="Mã BS" style="width: 100%; height: 30px; text-align: center; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; box-sizing: border-box;">
                            </div>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                            <label style="font-size: 12px; color: #262626; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <input id="cfg-auto-save" type="checkbox" ${cfg.autoSave ? 'checked' : ''} style="accent-color: #1890ff;">
                                Tự động bấm Lưu (F11)
                            </label>
                            <div style="font-size: 12px; display: flex; align-items: center; gap: 4px;">
                                <span style="color: #595959;">Giờ KT:</span>
                                <input id="cfg-gio-kt" type="text" value="${escapeHtml(cfg.gioKetThuc)}" style="width: 60px; height: 26px; text-align: center; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold;">
                            </div>
                        </div>
                    </div>

                    <!-- 16 NỘI DUNG KHÁM MẪU (ACCORDION THU GỌN) -->
                    <details style="margin-bottom: 10px; border: 1px dashed #d9d9d9; border-radius: 6px; padding: 6px 10px;">
                        <summary style="font-size: 12px; font-weight: 600; color: #1890ff; cursor: pointer;">
                            📝 16 Nội dung khám mẫu (Bấm để xem/sửa)
                        </summary>
                        <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto;">
                            <div><span style="font-size: 11px; color: #595959;">Tuần hoàn:</span><input id="cfg-txt-tuanhoan" type="text" value="${escapeHtml(texts.tuanHoan)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                            <div><span style="font-size: 11px; color: #595959;">Hô hấp:</span><input id="cfg-txt-hohap" type="text" value="${escapeHtml(texts.hoHap)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                            <div><span style="font-size: 11px; color: #595959;">Tiêu hóa:</span><input id="cfg-txt-tieuhoa" type="text" value="${escapeHtml(texts.tieuHoa)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                            <div><span style="font-size: 11px; color: #595959;">Thận - Tiết niệu:</span><input id="cfg-txt-thantn" type="text" value="${escapeHtml(texts.thanTietNieu)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                            <div><span style="font-size: 11px; color: #595959;">Nội tiết:</span><input id="cfg-txt-noitiet" type="text" value="${escapeHtml(texts.noiTiet)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                            <div><span style="font-size: 11px; color: #595959;">Cơ - Xương - Khớp:</span><input id="cfg-txt-coxuongkhop" type="text" value="${escapeHtml(texts.coXuongKhop)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                            <div><span style="font-size: 11px; color: #595959;">Thần kinh:</span><input id="cfg-txt-thankinh" type="text" value="${escapeHtml(texts.thanKinh)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                            <div><span style="font-size: 11px; color: #595959;">Tâm thần:</span><input id="cfg-txt-tamthan" type="text" value="${escapeHtml(texts.tamThan)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                            <div><span style="font-size: 11px; color: #595959;">Ngoại khoa:</span><input id="cfg-txt-ngoaikhoa" type="text" value="${escapeHtml(texts.ngoaiKhoa)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                            <div><span style="font-size: 11px; color: #595959;">Da liễu:</span><input id="cfg-txt-dalieu" type="text" value="${escapeHtml(texts.daLieu)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                            <div><span style="font-size: 11px; color: #595959;">Sản phụ khoa:</span><input id="cfg-txt-sanphukhoa" type="text" value="${escapeHtml(texts.sanPhuKhoa)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                            <div><span style="font-size: 11px; color: #595959;">Mắt khác:</span><input id="cfg-txt-matkhac" type="text" value="${escapeHtml(texts.matKhac)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                            <div><span style="font-size: 11px; color: #595959;">Tai Mũi Họng khác:</span><input id="cfg-txt-tmhkhac" type="text" value="${escapeHtml(texts.tmhKhac)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                            <div><span style="font-size: 11px; color: #595959;">RHM - Hàm trên:</span><input id="cfg-txt-rhmhamtren" type="text" value="${escapeHtml(texts.rhmHamTren)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                            <div><span style="font-size: 11px; color: #595959;">RHM - Hàm dưới:</span><input id="cfg-txt-rhmhamduoi" type="text" value="${escapeHtml(texts.rhmHamDuoi)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                            <div><span style="font-size: 11px; color: #595959;">RHM khác:</span><input id="cfg-txt-rhmkhac" type="text" value="${escapeHtml(texts.rhmKhac)}" style="width:100%; height:26px; font-size:11.5px; border:1px solid #d9d9d9; border-radius:3px; box-sizing:border-box;"></div>
                        </div>
                    </details>

                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                        <button id="btn-reset-exam-texts" type="button" style="font-size: 11.5px; padding: 4px 10px; background: #fafafa; border: 1px solid #d9d9d9; border-radius: 4px; cursor: pointer;">🔄 Khôi phục nội dung chuẩn</button>
                    </div>
                </div>

                <!-- DÒNG THÔNG BÁO TRẠNG THÁI -->
                <div id="his-panel-status" style="text-align: center; margin-top: 10px; font-weight: bold; color: #0958d9; font-size: 12.5px; min-height: 20px;"></div>
            </div>
        `;

        document.body.appendChild(panel);

        // Gắn sự kiện chuyển tab
        document.getElementById('tab-btn-tiepdon').onclick = () => switchPanelTab('tiepdon');
        document.getElementById('tab-btn-khambenh').onclick = () => switchPanelTab('khambenh');
        document.getElementById('tab-btn-caidat').onclick = () => switchPanelTab('caidat');

        // Gắn sự kiện 4 nút Loại sức khỏe
        for (let i = 1; i <= 4; i++) {
            const btn = document.getElementById(`btn-level-${i}`);
            if (btn) btn.onclick = () => applyHealthLevel(i);
        }

        // Khởi tạo trạng thái giao diện ban đầu
        switchPanelTab(cfg.activeTab || 'tiepdon');
        updateHealthLevelUI(cfg.selectedLevel || '1');
        updatePatientBannerDisplay();

        // Gắn sự kiện các nút hành động chính
        const btnTdAndKham = document.getElementById('btn-td-and-kham');
        if (btnTdAndKham) {
            btnTdAndKham.onclick = async () => {
                await executeSafe(async (statusEl) => {
                    await fillTiepDonConfig(statusEl);
                    await delay(300);
                    await saveTiepDon(statusEl);
                    await delay(500);
                    await navigateToKhamSucKhoe(statusEl);
                    switchPanelTab('khambenh');
                }, btnTdAndKham, '🚀 TIẾP ĐÓN ➔ SANG KHÁM SỨC KHỎE (F6)');
            };
        }

        const btnTdOnly = document.getElementById('btn-fill-td-only');
        if (btnTdOnly) {
            btnTdOnly.onclick = async () => {
                await executeSafe(fillTiepDonConfig, btnTdOnly, '⚡ Chỉ Điền Tiếp Đón (*) (Chưa sang Khám Sức Khỏe)');
            };
        }

        const btnRunKham = document.getElementById('his-panel-run-btn');
        if (btnRunKham) {
            btnRunKham.onclick = async () => {
                await executeSafe(fillKhamTheoBangGiaoDien, btnRunKham, '🚀 ĐIỀN KHÁM SỨC KHỎE & LƯU (F9)');
            };
        }

        const btnSwitchKham = document.getElementById('btn-switch-kham');
        if (btnSwitchKham) {
            btnSwitchKham.onclick = async () => {
                await executeSafe(navigateToKhamSucKhoe, btnSwitchKham, '🩺 Mở màn hình Khám Sức Khỏe (F6)');
            };
        }

        // Lưu config khi thay đổi input trong Cài Đặt
        const inputs = panel.querySelectorAll('input, select');
        inputs.forEach(inp => {
            inp.addEventListener('change', () => {
                const updated = readConfigFromUI();
                saveConfig(updated);
            });
        });

        // Nút khôi phục nội dung 16 mẫu khám
        const resetBtn = document.getElementById('btn-reset-exam-texts');
        if (resetBtn) {
            resetBtn.onclick = () => {
                document.getElementById('cfg-txt-tuanhoan').value = defaultExamTexts.tuanHoan;
                document.getElementById('cfg-txt-hohap').value = defaultExamTexts.hoHap;
                document.getElementById('cfg-txt-tieuhoa').value = defaultExamTexts.tieuHoa;
                document.getElementById('cfg-txt-thantn').value = defaultExamTexts.thanTietNieu;
                document.getElementById('cfg-txt-noitiet').value = defaultExamTexts.noiTiet;
                document.getElementById('cfg-txt-coxuongkhop').value = defaultExamTexts.coXuongKhop;
                document.getElementById('cfg-txt-thankinh').value = defaultExamTexts.thanKinh;
                document.getElementById('cfg-txt-tamthan').value = defaultExamTexts.tamThan;
                document.getElementById('cfg-txt-ngoaikhoa').value = defaultExamTexts.ngoaiKhoa;
                document.getElementById('cfg-txt-dalieu').value = defaultExamTexts.daLieu;
                document.getElementById('cfg-txt-sanphukhoa').value = defaultExamTexts.sanPhuKhoa;
                document.getElementById('cfg-txt-matkhac').value = defaultExamTexts.matKhac;
                document.getElementById('cfg-txt-tmhkhac').value = defaultExamTexts.tmhKhac;
                document.getElementById('cfg-txt-rhmhamtren').value = defaultExamTexts.rhmHamTren;
                document.getElementById('cfg-txt-rhmhamduoi').value = defaultExamTexts.rhmHamDuoi;
                document.getElementById('cfg-txt-rhmkhac').value = defaultExamTexts.rhmKhac;

                const c = readConfigFromUI();
                saveConfig(c);
                const statusEl = document.getElementById('his-panel-status');
                if (statusEl) statusEl.innerText = '🔄 Đã khôi phục 16 nội dung khám mẫu chuẩn!';
            };
        }

        // Nút thu nhỏ / mở rộng
        let isCollapsed = false;
        const body = document.getElementById('his-panel-body');
        const toggleBtn = document.getElementById('his-panel-toggle-btn');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                isCollapsed = !isCollapsed;
                body.style.display = isCollapsed ? 'none' : 'block';
                toggleBtn.innerText = isCollapsed ? '➕ Mở rộng' : '➖ Thu nhỏ';
            };
        }
    }

    // ----------------------------------------------------
    // LẮNG NGHE PHÍM TẮT TOÀN CỤC (F9 & F6)
    // ----------------------------------------------------
    if (window._hisKeydownHandler) {
        window.removeEventListener('keydown', window._hisKeydownHandler);
    }
    window._hisKeydownHandler = (e) => {
        if (e.key === 'F9') {
            e.preventDefault();
            const btnRun = document.getElementById('his-panel-run-btn');
            if (btnRun) btnRun.click();
        } else if (e.key === 'F6') {
            const activeTopTab = document.querySelector('.tab-app-main .ant-tabs-tab-active')?.innerText || '';
            if (activeTopTab.includes('Tiếp đón')) {
                const btnTdAndKham = document.getElementById('btn-td-and-kham');
                if (btnTdAndKham) btnTdAndKham.click();
            } else {
                e.preventDefault();
                const btnRun = document.getElementById('his-panel-run-btn');
                if (btnRun) btnRun.click();
            }
        }
    };
    window.addEventListener('keydown', window._hisKeydownHandler);

    // Gắn panel và duy trì trạng thái
    mountControlPanel();
    if (window._hisAutoRemountTimer) clearInterval(window._hisAutoRemountTimer);
    window._hisAutoRemountTimer = setInterval(mountControlPanel, 1500);

})();
