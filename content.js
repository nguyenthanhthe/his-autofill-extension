// ==UserScript==
// @name         HIS V2 - Bảng Điều Khiển Khám Sức Khỏe & Tiếp Đón Đa Chuyên Khoa
// @namespace    http://tampermonkey.net/
// @version      7.1
// @description  Bảng giao diện tùy biến hoàn toàn cho bác sĩ: Bộ chọn nhanh Loại 1 / Loại 2, Tùy biến 16 nội dung khám lâm sàng, Thể lực, 7 Chuyên khoa Lâm sàng, Quy trình liên hoàn Tiếp đón -> Khám -> Tự Lưu không hardcode thông tin
// @author       ThanhThe
// @match        https://v20.ytecoso.vn/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG_KEY = 'his_v2_autofill_config_v7';

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
        selectedLevel: '1',
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

        matPhai: '6',
        matTrai: '7',
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
        docKetLuan: '02',
        gioKetThuc: '07:45',
        autoSave: true,

        examTexts: Object.assign({}, defaultExamTexts)
    };

    function loadConfig() {
        try {
            const saved = localStorage.getItem(CONFIG_KEY);
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
        } catch (e) {
            console.warn('Lỗi lưu config:', e);
        }
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

        const cleanMatch = textMatch.trim().toLowerCase();
        // Regex word boundary: e.g. "04" or "4" matches word 04, not 24 or 40
        const wordRegex = new RegExp(`(^|\\s|\\|)${cleanMatch}(\\s|\\||$)`, 'i');

        for (let i = 0; i < 25; i++) {
            await delay(80);
            const options = Array.from(document.querySelectorAll('.ant-select-item-option'));
            if (!options.length) continue;

            // 1. Ưu tiên khớp chính xác theo ranh giới từ (mã bác sĩ: 04, 02, 06...)
            let match = options.find(o => wordRegex.test(o.innerText));

            // 2. Ưu tiên khớp tiền tố
            if (!match) {
                match = options.find(o => o.innerText.trim().toLowerCase().startsWith(cleanMatch));
            }

            // 3. Fallback khớp chứa chuỗi
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

    const findInputByLabel = (container, labelText) => {
        if (!container) return null;
        const labels = Array.from(container.querySelectorAll('label, .ant-form-item-label'));
        const target = labels.find(l => l.innerText.trim().includes(labelText));
        return target ? target.closest('.ant-form-item, nz-form-item, div.row, div')?.querySelector('input') : null;
    };

    // ----------------------------------------------------
    // 1. KHÂU 1: TIẾP ĐÓN KHÁM SỨC KHỎE
    // ----------------------------------------------------
    async function fillTiepDonConfig(statusEl) {
        if (statusEl) statusEl.innerText = '⏳ Đang mở tab và điền cấu hình Tiếp đón...';

        await clickMainTab('Tiếp đón khám sức khoẻ');
        await delay(350);

        const nameInput = document.querySelector('input[name="tenDayDu"]');
        const pane = nameInput ? nameInput.closest('.ant-tabs-tabpane') : (document.querySelector('.tab-app-main > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane-active') || document);

        const timeInputs = Array.from(pane.querySelectorAll('input[placeholder="__:__"]'));
        if (timeInputs[0]) setAngularValue(timeInputs[0], "07:30");

        const selects = Array.from(pane.querySelectorAll('nz-select'));

        if (selects[6]) await selectOption(selects[6], "00000");
        if (selects[9]) await selectOption(selects[9], "Khám sức khoẻ định kỳ");
        if (selects[10]) await selectOption(selects[10], "từ đủ 18 tuổi trở lên");
        if (selects[11]) await selectOption(selects[11], "Các đối tượng khác");
        if (selects[12]) await selectOption(selects[12], "Xã hội hoá");

        const taLyDo = pane.querySelector('textarea[name="lyDoVaoVien"]') || pane.querySelector('textarea');
        if (taLyDo) setAngularValue(taLyDo, "Khám sức khoẻ định kỳ");

        if (statusEl) statusEl.innerText = '✅ Đã điền xong các mục Tiếp đón (*) bắt buộc!';
    }

    async function saveTiepDon(statusEl) {
        if (statusEl) statusEl.innerText = '⏳ Đang bấm Lưu Tiếp đón (F11)...';
        const nameInput = document.querySelector('input[name="tenDayDu"]');
        if (nameInput && !nameInput.value.trim()) {
            throw new Error('Vui lòng nhập Họ và tên người khám tại màn hình Tiếp đón trước khi bấm Lưu!');
        }

        const pane = nameInput ? nameInput.closest('.ant-tabs-tabpane') : (document.querySelector('.tab-app-main > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane-active') || document);

        const buttons = Array.from(pane.querySelectorAll('button'));
        const saveBtn = buttons.find(b => b.innerText.includes('Lưu (F11)') || (b.innerText.trim() === 'Lưu' && b.classList.contains('ant-btn-primary')));
        if (!saveBtn) throw new Error('Không tìm thấy nút Lưu Tiếp đón');

        saveBtn.click();

        // Chờ nút lưu hết trạng thái loading
        for (let i = 0; i < 20; i++) {
            await delay(150);
            if (!saveBtn.classList.contains('ant-btn-loading')) break;
        }
        await delay(500);
        return true;
    }

    // ----------------------------------------------------
    // 2. KHÂU 2: CHUYỂN TỪ DANH SÁCH SANG KHÁM SỨC KHỎE
    // ----------------------------------------------------
    async function openPatientExamFromList(statusEl, expectedPatientName) {
        if (statusEl) statusEl.innerText = '⏳ Đang chuyển sang Danh sách khám sức khoẻ...';

        let switched = await clickMainTab('Danh sách khám sức khoẻ');
        if (!switched) {
            const menuItems = Array.from(document.querySelectorAll('.ant-menu-item, li, a'));
            const dsMenu = menuItems.find(m => m.innerText.trim() === 'Danh sách khám sức khoẻ');
            if (dsMenu) {
                dsMenu.click();
                await delay(600);
                switched = true;
            }
        }
        await delay(500);

        const pane = document.querySelector('.tab-app-main > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane-active');
        if (!pane) throw new Error('Không tìm thấy giao diện Danh sách khám sức khoẻ');

        const buttons = Array.from(pane.querySelectorAll('button'));
        const searchBtn = buttons.find(b => b.innerText.trim() === 'Tìm kiếm');
        if (searchBtn) {
            searchBtn.click();
            await delay(600);
        }

        // Chờ bảng dữ liệu tải xong (không còn ant-spin-spinning)
        for (let i = 0; i < 20; i++) {
            if (!pane.querySelector('.ant-spin-spinning')) break;
            await delay(150);
        }

        if (statusEl) statusEl.innerText = '⏳ Đang mở hồ sơ khám bệnh nhân hàng đầu...';

        // Sử dụng :not([nz-table-measure-row]) để bỏ qua hàng đo kích thước ảo của Ng-Zorro
        let firstDataRow = pane.querySelector('tbody tr:not([nz-table-measure-row])');

        // Nếu có tên dự kiến, kiểm tra xem hàng đầu đã cập nhật bệnh nhân mới chưa
        if (expectedPatientName && firstDataRow) {
            for (let retry = 0; retry < 3; retry++) {
                if (firstDataRow.innerText.includes(expectedPatientName)) break;
                if (searchBtn) {
                    searchBtn.click();
                    await delay(700);
                    firstDataRow = pane.querySelector('tbody tr:not([nz-table-measure-row])');
                }
            }
        }

        let stethoBtn = firstDataRow ? firstDataRow.querySelector('button.ant-btn-primary') : null;
        if (!stethoBtn) {
            stethoBtn = pane.querySelector('tbody tr button.ant-btn-primary i.anticon-ph\\:stethoscope')?.closest('button') ||
                        pane.querySelector('tbody tr button.ant-btn-primary');
        }

        if (!stethoBtn) {
            throw new Error('Không tìm thấy nút khám (ống nghe) của bệnh nhân trong danh sách');
        }

        stethoBtn.click();
        await delay(800);

        for (let i = 0; i < 20; i++) {
            const activeTab = document.querySelector('.tab-app-main .ant-tabs-tab-active')?.innerText?.trim() || '';
            if (activeTab.includes('Khám sức khỏe định kỳ')) {
                await delay(400);
                return true;
            }
            await delay(200);
        }
        return true;
    }

    // ----------------------------------------------------
    // 3. KHÂU 3: ĐIỀN THỂ LỰC, 16 NỘI DUNG LÂM SÀNG & KẾT LUẬN
    // ----------------------------------------------------
    async function fillKhamTheoBangGiaoDien(statusEl) {
        const cfg = readConfigFromUI();
        saveConfig(cfg);

        if (statusEl) statusEl.innerText = '⏳ Đang mở Khám sức khỏe định kỳ...';
        await clickMainTab('Khám sức khỏe định kỳ');

        // 1. THỂ LỰC
        if (cfg.height || cfg.weight || cfg.pulse || cfg.bp) {
            if (statusEl) statusEl.innerText = `⏳ Đang điền Thể lực (Cao ${cfg.height}cm, Nặng ${cfg.weight}kg, Mạch ${cfg.pulse}, HA ${cfg.bp}, ${cfg.theLucRadio})...`;
            await clickSubTab('THỂ LỰC');
            const paneTL = document.querySelector('.vertical-tabs .ant-tabs-tabpane-active') || document;
            const inputsTL = Array.from(paneTL.querySelectorAll('input'));

            const inpHeight = findInputByLabel(paneTL, 'Chiều cao') || inputsTL[0];
            const inpWeight = findInputByLabel(paneTL, 'Cân nặng') || inputsTL[1];
            const inpPulse = findInputByLabel(paneTL, 'Mạch') || inputsTL[3];
            const inpBp = paneTL.querySelector('input[name="huyet_ap"]') || findInputByLabel(paneTL, 'Huyết áp') || inputsTL[4];

            if (cfg.height && inpHeight) setAngularValue(inpHeight, cfg.height);
            if (cfg.weight && inpWeight) setAngularValue(inpWeight, cfg.weight);
            if (cfg.pulse && inpPulse) setAngularValue(inpPulse, cfg.pulse);
            if (cfg.bp && inpBp) setAngularValue(inpBp, cfg.bp);

            if (cfg.theLucRadio) {
                const radiosTL = Array.from(paneTL.querySelectorAll('.ant-radio-wrapper'));
                const targetRadio = radiosTL.find(r => r.innerText.includes(cfg.theLucRadio));
                if (targetRadio && !targetRadio.classList.contains('ant-radio-wrapper-checked')) {
                    targetRadio.click();
                }
            }
            await delay(250);
        }

        // 2. KHÁM LÂM SÀNG
        if (statusEl) statusEl.innerText = '⏳ Đang điền 16 nội dung Khám Lâm Sàng 7 chuyên khoa...';
        await clickSubTab('KHÁM LÂM SÀNG');
        const paneLS = document.querySelector('.vertical-tabs .ant-tabs-tabpane-active') || document;

        const textareasLS = Array.from(paneLS.querySelectorAll('textarea'));
        const selectsLS = Array.from(paneLS.querySelectorAll('nz-select'));
        const texts = cfg.examTexts || defaultExamTexts;

        // 2.1 NỘI KHOA (8 chuyên khoa)
        if (!cfg.skipNoiKhoa) {
            const noiKhoaTexts = [
                texts.tuanHoan || defaultExamTexts.tuanHoan,
                texts.hoHap || defaultExamTexts.hoHap,
                texts.tieuHoa || defaultExamTexts.tieuHoa,
                texts.thanTietNieu || defaultExamTexts.thanTietNieu,
                texts.noiTiet || defaultExamTexts.noiTiet,
                texts.coXuongKhop || defaultExamTexts.coXuongKhop,
                texts.thanKinh || defaultExamTexts.thanKinh,
                texts.tamThan || defaultExamTexts.tamThan
            ];
            for (let i = 0; i < 8; i++) {
                if (textareasLS[i]) setAngularValue(textareasLS[i], noiKhoaTexts[i]);
            }
            for (let i = 0; i < 16; i += 2) {
                if (selectsLS[i]) await selectOption(selectsLS[i], cfg.plChuyenKhoa || "Loại I: Rất khỏe");
                if (selectsLS[i + 1] && cfg.docNoiKhoa) await selectOption(selectsLS[i + 1], cfg.docNoiKhoa);
            }
        }

        // 2.2 NGOẠI KHOA
        if (!cfg.skipNgoaiKhoa) {
            if (textareasLS[8]) setAngularValue(textareasLS[8], texts.ngoaiKhoa || defaultExamTexts.ngoaiKhoa);
            if (selectsLS[16]) await selectOption(selectsLS[16], cfg.plChuyenKhoa || "Loại I: Rất khỏe");
            if (selectsLS[17] && cfg.docNgoaiKhoa) await selectOption(selectsLS[17], cfg.docNgoaiKhoa);
        }

        // 2.3 DA LIỄU
        if (!cfg.skipDaLieu) {
            if (textareasLS[9]) setAngularValue(textareasLS[9], texts.daLieu || defaultExamTexts.daLieu);
            if (selectsLS[18]) await selectOption(selectsLS[18], cfg.plChuyenKhoa || "Loại I: Rất khỏe");
            if (selectsLS[19] && cfg.docDaLieu) await selectOption(selectsLS[19], cfg.docDaLieu);
        }

        // 2.4 SẢN PHỤ KHOA
        if (!cfg.skipSanPhuKhoa) {
            if (textareasLS[10]) setAngularValue(textareasLS[10], texts.sanPhuKhoa || defaultExamTexts.sanPhuKhoa);
            if (selectsLS[20]) await selectOption(selectsLS[20], cfg.plChuyenKhoa || "Loại I: Rất khỏe");
            if (selectsLS[21] && cfg.docSanPhuKhoa) await selectOption(selectsLS[21], cfg.docSanPhuKhoa);
        }

        // 2.5 MẮT
        if (!cfg.skipMat) {
            const inpKKPhai = paneLS.querySelector('input[name="khong_kinh_mat_phai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[0];
            const inpKKTrai = paneLS.querySelector('input[name="khong_kinh_mat_trai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[1];
            const inpCKPhai = paneLS.querySelector('input[name="co_kinh_mat_phai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[2];
            const inpCKTrai = paneLS.querySelector('input[name="co_kinh_mat_trai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[3];

            if (inpKKPhai) setAngularValue(inpKKPhai, cfg.matPhai || "6");
            if (inpKKTrai) setAngularValue(inpKKTrai, cfg.matTrai || "7");
            if (inpCKPhai) setAngularValue(inpCKPhai, cfg.coKinhPhai || "");
            if (inpCKTrai) setAngularValue(inpCKTrai, cfg.coKinhTrai || "");

            if (textareasLS[11]) setAngularValue(textareasLS[11], texts.matKhac || defaultExamTexts.matKhac);
            if (selectsLS[22]) await selectOption(selectsLS[22], cfg.plChuyenKhoa || "Loại I: Rất khỏe");
            if (selectsLS[23] && cfg.docMat) await selectOption(selectsLS[23], cfg.docMat);
        }

        // 2.6 TAI - MŨI - HỌNG
        if (!cfg.skipTmh) {
            const inputsTai = Array.from(paneLS.querySelectorAll('input[placeholder="m"]'));
            if (inputsTai[0]) setAngularValue(inputsTai[0], cfg.thinhLucPThuong || "5");
            if (inputsTai[1]) setAngularValue(inputsTai[1], cfg.thinhLucPTham || "0.5");
            if (inputsTai[2]) setAngularValue(inputsTai[2], cfg.thinhLucTThuong || "5");
            if (inputsTai[3]) setAngularValue(inputsTai[3], cfg.thinhLucTTham || "0.5");

            if (textareasLS[12]) setAngularValue(textareasLS[12], texts.tmhKhac || defaultExamTexts.tmhKhac);
            if (selectsLS[24]) await selectOption(selectsLS[24], cfg.plChuyenKhoa || "Loại I: Rất khỏe");
            if (selectsLS[25] && cfg.docTmh) await selectOption(selectsLS[25], cfg.docTmh);
        }

        // 2.7 RĂNG - HÀM - MẶT
        if (!cfg.skipRhm) {
            if (textareasLS[13]) setAngularValue(textareasLS[13], texts.rhmHamTren || defaultExamTexts.rhmHamTren);
            if (textareasLS[14]) setAngularValue(textareasLS[14], texts.rhmHamDuoi || defaultExamTexts.rhmHamDuoi);
            if (textareasLS[15]) setAngularValue(textareasLS[15], texts.rhmKhac || defaultExamTexts.rhmKhac);
            if (selectsLS[26]) await selectOption(selectsLS[26], cfg.plChuyenKhoa || "Loại I: Rất khỏe");
            if (selectsLS[27] && cfg.docRhm) await selectOption(selectsLS[27], cfg.docRhm);
        }

        // 3. KẾT LUẬN
        if (statusEl) statusEl.innerText = '⏳ Đang điền Kết Luận & Phân loại...';
        await clickSubTab('KẾT LUẬN');
        const paneKL = document.querySelector('.vertical-tabs .ant-tabs-tabpane-active') || document;

        const cbsKL = Array.from(paneKL.querySelectorAll('.ant-checkbox-wrapper'));
        const targetCb = cbsKL.find(c => c.innerText.includes(cfg.plKetLuan) || (cfg.plKetLuan.includes('Loại I:') && c.innerText.includes('Loại I:')) || (cfg.plKetLuan.includes('Loại II') && c.innerText.includes('Loại II')));
        if (targetCb && !targetCb.classList.contains('ant-checkbox-wrapper-checked')) {
            targetCb.click();
        }
        const otherCbs = cbsKL.filter(c => c !== targetCb && (c.innerText.includes('Loại I:') || c.innerText.includes('Loại II') || c.innerText.includes('Loại III') || c.innerText.includes('Loại IV') || c.innerText.includes('Loại V')));
        otherCbs.forEach(c => {
            if (c.classList.contains('ant-checkbox-wrapper-checked') && !c.innerText.includes(cfg.plKetLuan)) {
                c.click();
            }
        });

        const cbKetThuc = cbsKL.find(c => c.innerText.includes('Xác nhận kết thúc khám') || c.closest('div')?.innerText?.includes('Xác nhận kết thúc khám')) || cbsKL[cbsKL.length - 1];
        if (cbKetThuc && !cbKetThuc.classList.contains('ant-checkbox-wrapper-checked')) {
            cbKetThuc.click();
        }

        const selectsKL = Array.from(paneKL.querySelectorAll('nz-select'));
        const docSelectKL = selectsKL[1] || selectsKL[selectsKL.length - 1];
        if (docSelectKL && cfg.docKetLuan) {
            await selectOption(docSelectKL, cfg.docKetLuan);
        }

        const timeInput = paneKL.querySelector('input[placeholder="__:__"]');
        if (timeInput) {
            setAngularValue(timeInput, cfg.gioKetThuc || '07:45');
        }

        if (cfg.autoSave) {
            if (statusEl) statusEl.innerText = '⏳ Đang bấm Lưu (F11)...';
            await delay(350);
            const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Lưu' || b.innerText.includes('Lưu (F11)'));
            if (saveBtn) {
                saveBtn.click();
                if (statusEl) statusEl.innerText = `✅ ĐÃ ĐIỀN XONG & ĐÃ LƯU (${cfg.theLucRadio}, Cao ${cfg.height}, Nặng ${cfg.weight}, Mạch ${cfg.pulse}, HA ${cfg.bp})!`;
            } else {
                if (statusEl) statusEl.innerText = '✅ ĐÃ ĐIỀN XONG (Vui lòng bấm Lưu)!';
            }
        } else {
            if (statusEl) statusEl.innerText = '✅ ĐÃ ĐIỀN XONG THEO THÔNG SỐ (Chưa bấm Lưu)!';
        }
    }

    // ----------------------------------------------------
    // 4. QUY TRÌNH LIÊN HOÀN (TIẾP ĐÓN -> KHÁM -> LƯU)
    // ----------------------------------------------------
    async function runFullWorkflow(statusEl) {
        const nameInput = document.querySelector('input[name="tenDayDu"]');
        const expectedPatientName = nameInput ? nameInput.value.trim() : '';

        if (!expectedPatientName) {
            throw new Error('Chưa nhập Họ và tên người khám tại Tiếp đón!');
        }

        if (statusEl) statusEl.innerText = '🚀 [1/4] Đang điền Tiếp đón bắt buộc...';
        await fillTiepDonConfig(statusEl);
        await delay(500);

        if (statusEl) statusEl.innerText = '🚀 [2/4] Đang lưu Tiếp đón...';
        await saveTiepDon(statusEl);

        if (statusEl) statusEl.innerText = '🚀 [3/4] Đang chuyển sang Danh sách & mở Khám...';
        await openPatientExamFromList(statusEl, expectedPatientName);

        if (statusEl) statusEl.innerText = '🚀 [4/4] Đang điền Thể lực, Lâm sàng, Kết luận & Lưu...';
        await fillKhamTheoBangGiaoDien(statusEl);

        if (statusEl) statusEl.innerText = '🎉 HOÀN TẤT LIÊN HOÀN: Tiếp đón ➔ Mở khám ➔ Điền & Đã lưu!';
    }

    function readConfigFromUI() {
        return {
            selectedLevel: document.getElementById('cfg-theluc-pl')?.value === 'Loại 1' ? '1' : (document.getElementById('cfg-theluc-pl')?.value === 'Loại 2' ? '2' : 'other'),
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

            matPhai: document.getElementById('cfg-mat-phai')?.value?.trim() || '6',
            matTrai: document.getElementById('cfg-mat-trai')?.value?.trim() || '7',
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

    function applyCategoryLevel(level) {
        const isLevel1 = (level === '1' || level === 1);
        const theLucSelect = document.getElementById('cfg-theluc-pl');
        if (theLucSelect) theLucSelect.value = isLevel1 ? 'Loại 1' : 'Loại 2';

        const plCkSelect = document.getElementById('cfg-pl-ck');
        if (plCkSelect) plCkSelect.value = isLevel1 ? 'Loại I: Rất khỏe' : 'Loại II: Khỏe';

        const plKlSelect = document.getElementById('cfg-pl-ketluan');
        if (plKlSelect) plKlSelect.value = isLevel1 ? 'Loại I: Rất khỏe' : 'Loại II: Khỏe';

        updateQuickPlUI(isLevel1 ? '1' : '2');
        const updated = readConfigFromUI();
        saveConfig(updated);
    }

    function updateQuickPlUI(level) {
        const btn1 = document.getElementById('btn-quick-pl1');
        const btn2 = document.getElementById('btn-quick-pl2');
        const indicator = document.getElementById('pl-indicator');
        if (level === '1') {
            if (btn1) {
                btn1.style.outline = '2px solid #52c41a';
                btn1.style.background = '#f6ffed';
                btn1.style.color = '#389e0d';
            }
            if (btn2) {
                btn2.style.outline = 'none';
                btn2.style.background = '#ffffff';
                btn2.style.color = '#595959';
            }
            if (indicator) {
                indicator.innerText = '🟢 Loại 1 (Rất khỏe / Tốt)';
                indicator.style.color = '#389e0d';
            }
        } else if (level === '2') {
            if (btn2) {
                btn2.style.outline = '2px solid #1890ff';
                btn2.style.background = '#e6f7ff';
                btn2.style.color = '#096dd9';
            }
            if (btn1) {
                btn1.style.outline = 'none';
                btn1.style.background = '#ffffff';
                btn1.style.color = '#595959';
            }
            if (indicator) {
                indicator.innerText = '🔵 Loại 2 (Khỏe / Khá)';
                indicator.style.color = '#096dd9';
            }
        } else {
            if (btn1) {
                btn1.style.outline = 'none';
                btn1.style.background = '#ffffff';
                btn1.style.color = '#595959';
            }
            if (btn2) {
                btn2.style.outline = 'none';
                btn2.style.background = '#ffffff';
                btn2.style.color = '#595959';
            }
            if (indicator) {
                indicator.innerText = '⚪ Tùy chỉnh khác';
                indicator.style.color = '#8c8c8c';
            }
        }
    }

    let isRunning = false;

    async function executeSafe(actionFn, btnEl, originalText) {
        if (isRunning) return;
        isRunning = true;
        const statusEl = document.getElementById('his-panel-status');
        if (btnEl) {
            btnEl.disabled = true;
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
                btnEl.innerText = originalText;
            }
        }
    }

    async function handleSmartRun() {
        const runBtn = document.getElementById('his-panel-run-btn');
        await executeSafe(async (statusEl) => {
            const activeTopTab = document.querySelector('.tab-app-main .ant-tabs-tab-active')?.innerText || '';
            if (activeTopTab.includes('Tiếp đón')) {
                await runFullWorkflow(statusEl);
            } else {
                await fillKhamTheoBangGiaoDien(statusEl);
            }
        }, runBtn, '🚀 ĐIỀN KHÁM THEO BẢNG & LƯU (F9)');
    }

    async function handleFullFlowClick() {
        const btnFullFlow = document.getElementById('btn-full-flow');
        await executeSafe(async (statusEl) => {
            await runFullWorkflow(statusEl);
        }, btnFullFlow, '🔄 2. Tiếp Đón ➔ Khám ➔ Lưu');
    }

    async function handleTiepDonOnlyClick() {
        const btnTdOnly = document.getElementById('btn-fill-td-only');
        await executeSafe(async (statusEl) => {
            await fillTiepDonConfig(statusEl);
        }, btnTdOnly, '⚡ 1. Điền Tiếp Đón (*)');
    }

    // ----------------------------------------------------
    // 5. BẢNG ĐIỀU KHIỂN GIAO DIỆN CHUYÊN NGHIỆP
    // ----------------------------------------------------
    function mountControlPanel() {
        if (document.getElementById('his-tool-control-panel')) return;

        const cfg = loadConfig();
        const texts = cfg.examTexts || defaultExamTexts;

        const panel = document.createElement('div');
        panel.id = 'his-tool-control-panel';
        panel.style.position = 'fixed';
        panel.style.bottom = '15px';
        panel.style.right = '15px';
        panel.style.width = '450px';
        panel.style.backgroundColor = '#ffffff';
        panel.style.borderRadius = '12px';
        panel.style.boxShadow = '0 12px 35px rgba(0,0,0,0.4)';
        panel.style.zIndex = '2147483647';
        panel.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
        panel.style.border = '2px solid #fa8c16';
        panel.style.overflow = 'hidden';

        panel.innerHTML = `
            <div style="background: linear-gradient(135deg, #fa8c16, #ff7a45); color: white; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 13px;">
                <span>⚙️ CẤU HÌNH & TỰ ĐỘNG ĐIỀN HIS V2</span>
                <div>
                    <button id="his-panel-reload-btn" title="Nạp lại bảng điều khiển" style="background: rgba(255,255,255,0.25); border: none; color: white; font-size: 12px; cursor: pointer; border-radius: 4px; padding: 2px 7px; margin-right: 4px;">🔄</button>
                    <button id="his-panel-toggle-btn" style="background: rgba(255,255,255,0.25); border: none; color: white; font-size: 12px; cursor: pointer; border-radius: 4px; padding: 2px 8px;">➖ Thu nhỏ</button>
                </div>
            </div>
            <div id="his-panel-body" style="padding: 12px; font-size: 12px; color: #262626; line-height: 1.4; max-height: 560px; overflow-y: auto;">
                
                <!-- BỘ CHỌN NHANH PHÂN LOẠI TOÀN DIỆN (LOẠI 1 / LOẠI 2) -->
                <div style="background: #f0f5ff; border: 1px solid #91d5ff; padding: 8px 10px; border-radius: 8px; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <b style="color: #0050b3; font-size: 11px;">⭐ CHỌN NHANH PHÂN LOẠI 1 CHẠM:</b>
                        <span id="pl-indicator" style="font-size: 11px; font-weight: bold;"></span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <button id="btn-quick-pl1" type="button" style="padding: 6px 4px; border: 1px solid #d9d9d9; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; transition: all 0.2s;">
                            🟢 LOẠI 1 (Rất khỏe / Tốt)
                        </button>
                        <button id="btn-quick-pl2" type="button" style="padding: 6px 4px; border: 1px solid #d9d9d9; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; transition: all 0.2s;">
                            🔵 LOẠI 2 (Khỏe / Khá)
                        </button>
                    </div>
                </div>

                <!-- 1. BẢNG THỂ LỰC -->
                <div style="background: #f9f0ff; border: 1px solid #d3adf7; padding: 8px 10px; border-radius: 8px; margin-bottom: 8px;">
                    <b style="color: #531dab; font-size: 12px;">🏋️ 1. THỂ LỰC</b>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; margin-top: 5px;">
                        <div>
                            <label style="font-size: 10px; color: #595959;">Cao (cm):</label>
                            <input id="cfg-height" type="text" value="${cfg.height}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; text-align: center; color: #531dab;">
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">Nặng (kg):</label>
                            <input id="cfg-weight" type="text" value="${cfg.weight}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; text-align: center; color: #531dab;">
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">Mạch (l/p):</label>
                            <input id="cfg-pulse" type="text" value="${cfg.pulse}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; text-align: center; color: #cf1322;">
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">Huyết áp:</label>
                            <input id="cfg-bp" type="text" value="${cfg.bp}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; text-align: center; color: #cf1322;">
                        </div>
                    </div>
                    <div style="margin-top: 5px; display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 11px; color: #595959;">Phân loại thể lực:</span>
                        <select id="cfg-theluc-pl" style="padding: 2px 6px; border-radius: 4px; border: 1px solid #d9d9d9; font-weight: bold; font-size: 11px; color: #531dab;">
                            <option value="Loại 1" ${cfg.theLucRadio === 'Loại 1' ? 'selected' : ''}>Loại 1 (Tốt)</option>
                            <option value="Loại 2" ${cfg.theLucRadio === 'Loại 2' ? 'selected' : ''}>Loại 2 (Khá)</option>
                            <option value="Loại 3" ${cfg.theLucRadio === 'Loại 3' ? 'selected' : ''}>Loại 3 (Trung bình)</option>
                            <option value="Loại 4" ${cfg.theLucRadio === 'Loại 4' ? 'selected' : ''}>Loại 4 (Yếu)</option>
                        </select>
                    </div>
                </div>

                <!-- 2. BẢNG 7 CHUYÊN KHOA LÂM SÀNG -->
                <div style="background: #f6ffed; border: 1px solid #b7eb8f; padding: 8px 10px; border-radius: 8px; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <b style="color: #389e0d; font-size: 12px;">🩺 2. KHÁM LÂM SÀNG (7 CHUYÊN KHOA)</b>
                        <div>
                            <span style="font-size: 10px; color: #595959;">Phân loại CK:</span>
                            <select id="cfg-pl-ck" style="padding: 1px 4px; font-size: 10px; border-radius: 3px; border: 1px solid #d9d9d9; font-weight: bold;">
                                <option value="Loại I: Rất khỏe" ${cfg.plChuyenKhoa.includes('Loại I:') ? 'selected' : ''}>Loại I: Rất khỏe</option>
                                <option value="Loại II: Khỏe" ${cfg.plChuyenKhoa.includes('Loại II') ? 'selected' : ''}>Loại II: Khỏe</option>
                                <option value="Loại III: Trung bình" ${cfg.plChuyenKhoa.includes('Loại III') ? 'selected' : ''}>Loại III: Trung bình</option>
                            </select>
                        </div>
                    </div>

                    <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                        <tr style="background: #e6f7ff; color: #0050b3; font-size: 10px; text-align: left;">
                            <th style="padding: 3px 4px; border: 1px solid #d9d9d9;">Chuyên khoa</th>
                            <th style="padding: 3px 4px; border: 1px solid #d9d9d9; text-align: center;">Mã/Tên BS</th>
                            <th style="padding: 3px 4px; border: 1px solid #d9d9d9; text-align: center;">Bỏ qua</th>
                        </tr>
                        <!-- 1. Nội khoa -->
                        <tr>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0;"><b>1. Nội khoa</b> (8 khoa)</td>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0; text-align: center;">
                                <input id="cfg-doc-noi" type="text" value="${cfg.docNoiKhoa}" placeholder="Mã BS" style="width: 65px; padding: 2px; text-align: center; border: 1px solid #d9d9d9; border-radius: 3px; font-weight: bold;">
                            </td>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0; text-align: center;">
                                <input id="cfg-skip-noi" type="checkbox" ${cfg.skipNoiKhoa ? 'checked' : ''}>
                            </td>
                        </tr>
                        <!-- 2. Ngoại khoa -->
                        <tr style="background: #fafafa;">
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0;"><b>2. Ngoại khoa</b></td>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0; text-align: center;">
                                <input id="cfg-doc-ngoai" type="text" value="${cfg.docNgoaiKhoa}" placeholder="Mã BS" style="width: 65px; padding: 2px; text-align: center; border: 1px solid #d9d9d9; border-radius: 3px; font-weight: bold;">
                            </td>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0; text-align: center;">
                                <input id="cfg-skip-ngoai" type="checkbox" ${cfg.skipNgoaiKhoa ? 'checked' : ''}>
                            </td>
                        </tr>
                        <!-- 3. Da liễu -->
                        <tr>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0;"><b>3. Da liễu</b></td>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0; text-align: center;">
                                <input id="cfg-doc-dalieu" type="text" value="${cfg.docDaLieu}" placeholder="Mã BS" style="width: 65px; padding: 2px; text-align: center; border: 1px solid #d9d9d9; border-radius: 3px; font-weight: bold;">
                            </td>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0; text-align: center;">
                                <input id="cfg-skip-dalieu" type="checkbox" ${cfg.skipDaLieu ? 'checked' : ''}>
                            </td>
                        </tr>
                        <!-- 4. Sản phụ khoa -->
                        <tr style="background: #fff1f0;">
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0; color: #cf1322;"><b>4. Sản phụ khoa</b></td>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0; text-align: center;">
                                <input id="cfg-doc-san" type="text" value="${cfg.docSanPhuKhoa}" placeholder="Trống" style="width: 65px; padding: 2px; text-align: center; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </td>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0; text-align: center;">
                                <input id="cfg-skip-san" type="checkbox" ${cfg.skipSanPhuKhoa ? 'checked' : ''} title="Bỏ qua không điền">
                            </td>
                        </tr>
                        <!-- 5. Mắt -->
                        <tr>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0;">
                                <b>5. Mắt</b><br>
                                <span style="font-size: 9px; color: #666;">K.kính: P <input id="cfg-mat-phai" type="text" value="${cfg.matPhai}" style="width: 24px; text-align: center; padding: 1px;"> T <input id="cfg-mat-trai" type="text" value="${cfg.matTrai}" style="width: 24px; text-align: center; padding: 1px;"></span>
                            </td>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0; text-align: center;">
                                <input id="cfg-doc-mat" type="text" value="${cfg.docMat}" placeholder="Mã BS" style="width: 65px; padding: 2px; text-align: center; border: 1px solid #d9d9d9; border-radius: 3px; font-weight: bold;">
                            </td>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0; text-align: center;">
                                <input id="cfg-skip-mat" type="checkbox" ${cfg.skipMat ? 'checked' : ''}>
                            </td>
                        </tr>
                        <!-- 6. Tai - Mũi - Họng -->
                        <tr style="background: #fafafa;">
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0;">
                                <b>6. Tai - Mũi - Họng</b><br>
                                <span style="font-size: 9px; color: #666;">Thính lực: P 5/0.5 | T 5/0.5</span>
                            </td>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0; text-align: center;">
                                <input id="cfg-doc-tmh" type="text" value="${cfg.docTmh}" placeholder="Mã BS" style="width: 65px; padding: 2px; text-align: center; border: 1px solid #d9d9d9; border-radius: 3px; font-weight: bold;">
                            </td>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0; text-align: center;">
                                <input id="cfg-skip-tmh" type="checkbox" ${cfg.skipTmh ? 'checked' : ''}>
                            </td>
                        </tr>
                        <!-- 7. Răng - Hàm - Mặt -->
                        <tr>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0;"><b>7. Răng - Hàm - Mặt</b></td>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0; text-align: center;">
                                <input id="cfg-doc-rhm" type="text" value="${cfg.docRhm}" placeholder="Mã BS" style="width: 65px; padding: 2px; text-align: center; border: 1px solid #d9d9d9; border-radius: 3px; font-weight: bold;">
                            </td>
                            <td style="padding: 3px 4px; border: 1px solid #f0f0f0; text-align: center;">
                                <input id="cfg-skip-rhm" type="checkbox" ${cfg.skipRhm ? 'checked' : ''}>
                            </td>
                        </tr>
                    </table>

                    <!-- TÙY CHỈNH 16 NỘI DUNG KHÁM MẪU -->
                    <details id="details-exam-texts" style="margin-top: 6px; background: #ffffff; border: 1px dashed #52c41a; border-radius: 6px; padding: 6px;">
                        <summary style="font-weight: bold; color: #237804; cursor: pointer; font-size: 11px; user-select: none;">
                            📝 Tùy chỉnh 16 Nội dung khám lâm sàng (Xem / Sửa)
                        </summary>
                        <div style="margin-top: 6px; max-height: 200px; overflow-y: auto; font-size: 10px; display: flex; flex-direction: column; gap: 4px;">
                            <div>
                                <span style="color: #595959;">Tuần hoàn:</span>
                                <input id="cfg-txt-tuanhoan" type="text" value="${texts.tuanHoan}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div>
                                <span style="color: #595959;">Hô hấp:</span>
                                <input id="cfg-txt-hohap" type="text" value="${texts.hoHap}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div>
                                <span style="color: #595959;">Tiêu hóa:</span>
                                <input id="cfg-txt-tieuhoa" type="text" value="${texts.tieuHoa}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div>
                                <span style="color: #595959;">Thận - Tiết niệu:</span>
                                <input id="cfg-txt-thantn" type="text" value="${texts.thanTietNieu}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div>
                                <span style="color: #595959;">Nội tiết:</span>
                                <input id="cfg-txt-noitiet" type="text" value="${texts.noiTiet}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div>
                                <span style="color: #595959;">Cơ - Xương - Khớp:</span>
                                <input id="cfg-txt-coxuongkhop" type="text" value="${texts.coXuongKhop}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div>
                                <span style="color: #595959;">Thần kinh:</span>
                                <input id="cfg-txt-thankinh" type="text" value="${texts.thanKinh}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div>
                                <span style="color: #595959;">Tâm thần:</span>
                                <input id="cfg-txt-tamthan" type="text" value="${texts.tamThan}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div>
                                <span style="color: #595959;">Ngoại khoa:</span>
                                <input id="cfg-txt-ngoaikhoa" type="text" value="${texts.ngoaiKhoa}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div>
                                <span style="color: #595959;">Da liễu:</span>
                                <input id="cfg-txt-dalieu" type="text" value="${texts.daLieu}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div>
                                <span style="color: #595959;">Sản phụ khoa:</span>
                                <input id="cfg-txt-sanphukhoa" type="text" value="${texts.sanPhuKhoa}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div>
                                <span style="color: #595959;">Mắt (Bệnh khác):</span>
                                <input id="cfg-txt-matkhac" type="text" value="${texts.matKhac}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div>
                                <span style="color: #595959;">Tai Mũi Họng (Bệnh khác):</span>
                                <input id="cfg-txt-tmhkhac" type="text" value="${texts.tmhKhac}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div>
                                <span style="color: #595959;">RHM - Hàm trên:</span>
                                <input id="cfg-txt-rhmhamtren" type="text" value="${texts.rhmHamTren}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div>
                                <span style="color: #595959;">RHM - Hàm dưới:</span>
                                <input id="cfg-txt-rhmhamduoi" type="text" value="${texts.rhmHamDuoi}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div>
                                <span style="color: #595959;">Răng Hàm Mặt (Bệnh khác):</span>
                                <input id="cfg-txt-rhmkhac" type="text" value="${texts.rhmKhac}" style="width: 100%; padding: 2px 4px; font-size: 10px; border: 1px solid #d9d9d9; border-radius: 3px;">
                            </div>
                            <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
                                <button id="btn-reset-exam-texts" type="button" style="font-size: 10px; padding: 2px 8px; background: #fafafa; border: 1px solid #d9d9d9; border-radius: 4px; cursor: pointer;">🔄 Khôi phục chuẩn</button>
                            </div>
                        </div>
                    </details>
                </div>

                <!-- 3. BẢNG KẾT LUẬN -->
                <div style="background: #fff7e6; border: 1px solid #ffd591; padding: 8px 10px; border-radius: 8px; margin-bottom: 8px;">
                    <b style="color: #d46b08; font-size: 12px;">📋 3. KẾT LUẬN & HOÀN TẤT</b>
                    <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 6px; margin-top: 5px;">
                        <div>
                            <label style="font-size: 10px; color: #595959;">Phân loại KSK:</label>
                            <select id="cfg-pl-ketluan" style="width: 100%; padding: 4px; border-radius: 4px; border: 1px solid #d9d9d9; font-weight: bold; font-size: 11px;">
                                <option value="Loại I: Rất khỏe" ${cfg.plKetLuan.includes('Loại I:') ? 'selected' : ''}>Loại I: Rất khỏe</option>
                                <option value="Loại II: Khỏe" ${cfg.plKetLuan.includes('Loại II') ? 'selected' : ''}>Loại II: Khỏe</option>
                                <option value="Loại III: Trung bình" ${cfg.plKetLuan.includes('Loại III') ? 'selected' : ''}>Loại III: Trung bình</option>
                                <option value="Loại IV: Yếu" ${cfg.plKetLuan.includes('Loại IV') ? 'selected' : ''}>Loại IV: Yếu</option>
                                <option value="Loại V: Rất yếu" ${cfg.plKetLuan.includes('Loại V') ? 'selected' : ''}>Loại V: Rất yếu</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">BS Kết luận:</label>
                            <input id="cfg-doc-ketluan" type="text" value="${cfg.docKetLuan}" placeholder="Mã BS" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; font-size: 11px; text-align: center;">
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">Giờ kết thúc:</label>
                            <input id="cfg-gio-kt" type="text" value="${cfg.gioKetThuc}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; font-size: 11px; text-align: center;">
                        </div>
                    </div>
                    <div style="margin-top: 5px;">
                        <label style="font-size: 11px; color: #262626; cursor: pointer; font-weight: 500;">
                            <input id="cfg-auto-save" type="checkbox" ${cfg.autoSave ? 'checked' : ''}> Tự động bấm Lưu (F11) sau khi điền
                        </label>
                    </div>
                </div>

                <!-- 4. NÚT ĐIỀU KHIỂN ĐA TÁC VỤ -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                    <button id="btn-fill-td-only" style="padding: 8px 4px; background: #fa8c16; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; box-shadow: 0 2px 6px rgba(250,140,22,0.35);">
                        ⚡ 1. Điền Tiếp Đón (*)
                    </button>
                    <button id="btn-full-flow" style="padding: 8px 4px; background: #722ed1; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; box-shadow: 0 2px 6px rgba(114,46,209,0.35);">
                        🔄 2. Tiếp Đón ➔ Khám ➔ Lưu
                    </button>
                </div>

                <button id="his-panel-run-btn" style="width: 100%; padding: 11px; background: #52c41a; color: white; border: none; border-radius: 7px; font-size: 13px; font-weight: bold; cursor: pointer; box-shadow: 0 3px 10px rgba(82,196,26,0.4);">
                    🚀 ĐIỀN KHÁM THEO BẢNG & LƯU (F9)
                </button>

                <div id="his-panel-status" style="text-align: center; margin-top: 8px; font-weight: bold; color: #52c41a; font-size: 11px;"></div>
            </div>
        `;

        document.body.appendChild(panel);

        updateQuickPlUI(cfg.selectedLevel || '1');

        const btnPl1 = document.getElementById('btn-quick-pl1');
        if (btnPl1) btnPl1.onclick = () => applyCategoryLevel('1');

        const btnPl2 = document.getElementById('btn-quick-pl2');
        if (btnPl2) btnPl2.onclick = () => applyCategoryLevel('2');

        const inputs = panel.querySelectorAll('input, select');
        inputs.forEach(inp => {
            inp.addEventListener('change', () => {
                const updated = readConfigFromUI();
                saveConfig(updated);
                updateQuickPlUI(updated.selectedLevel);
            });
        });

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

        const reloadBtn = document.getElementById('his-panel-reload-btn');
        if (reloadBtn) {
            reloadBtn.onclick = () => {
                panel.remove();
                mountControlPanel();
            };
        }

        const btnTdOnly = document.getElementById('btn-fill-td-only');
        if (btnTdOnly) btnTdOnly.onclick = handleTiepDonOnlyClick;

        const btnFullFlow = document.getElementById('btn-full-flow');
        if (btnFullFlow) btnFullFlow.onclick = handleFullFlowClick;

        const runBtn = document.getElementById('his-panel-run-btn');
        if (runBtn) runBtn.onclick = handleSmartRun;
    }

    // Quản lý event listener keydown sạch, tránh đăng ký trùng lặp
    if (window._hisKeydownHandler) {
        window.removeEventListener('keydown', window._hisKeydownHandler);
    }
    window._hisKeydownHandler = (e) => {
        if (e.key === 'F9') {
            e.preventDefault();
            handleSmartRun();
        } else if (e.key === 'F10') {
            e.preventDefault();
            handleFullFlowClick();
        }
    };
    window.addEventListener('keydown', window._hisKeydownHandler);

    mountControlPanel();
    if (window._hisAutoRemountTimer) clearInterval(window._hisAutoRemountTimer);
    window._hisAutoRemountTimer = setInterval(mountControlPanel, 1500);

})();
