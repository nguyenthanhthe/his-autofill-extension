// ==UserScript==
// @name         HIS V2 - Bảng Điều Khiển Khám Sức Khỏe & Tiếp Đón Đa Chuyên Khoa
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Bảng giao diện tùy biến hoàn toàn cho bác sĩ: Thể lực (Cao, Nặng, Mạch, HA), 7 Chuyên khoa Lâm sàng (Nội, Ngoại, Da liễu, Sản phụ khoa, Mắt, TMH, RHM), Kết luận & Tự động lưu không hardcode thông tin
// @author       ThanhThe
// @match        https://v20.ytecoso.vn/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG_KEY = 'his_v2_autofill_config_v6';

    const defaultCfg = {
        // Thể lực
        height: '150',
        weight: '48',
        pulse: '80',
        bp: '100/60',
        theLucRadio: 'Loại 2',

        // 7 Chuyên khoa lâm sàng (Mã bác sĩ & Trạng thái bỏ qua)
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

        // Phân loại chung & Kết luận
        plChuyenKhoa: 'Loại II: Khỏe',
        plKetLuan: 'Loại II: Khỏe',
        docKetLuan: '02',
        gioKetThuc: '07:45',
        autoSave: true
    };

    function loadConfig() {
        try {
            const saved = localStorage.getItem(CONFIG_KEY);
            if (saved) return Object.assign({}, defaultCfg, JSON.parse(saved));
        } catch (e) {
            console.warn('Lỗi đọc config:', e);
        }
        return Object.assign({}, defaultCfg);
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

        for (let i = 0; i < 25; i++) {
            await delay(80);
            const options = Array.from(document.querySelectorAll('.ant-select-item-option'));
            const match = options.find(o => o.innerText.toLowerCase().includes(textMatch.toLowerCase()));
            if (match) {
                match.click();
                await delay(120);
                return true;
            }
        }
        document.body.click();
        return false;
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
        if (selects[10]) await selectOption(selects[10], "từ đủ 18 tuổi trở lên");
        if (selects[11]) await selectOption(selects[11], "Các đối tượng khác");
        if (selects[12]) await selectOption(selects[12], "Xã hội hoá");

        const taLyDo = pane.querySelector('textarea[name="lyDoVaoVien"]') || pane.querySelector('textarea');
        if (taLyDo) setAngularValue(taLyDo, "Khám sức khoẻ định kỳ");

        if (statusEl) statusEl.innerText = '✅ Đã điền xong Tiếp đón (Nghề nghiệp, Mẫu KSK, Đối tượng, Kinh phí, Lý do)!';
    }

    // ----------------------------------------------------
    // 2. KHÂU 2: ĐIỀN THỂ LỰC, 7 CHUYÊN KHOA LÂM SÀNG & KẾT LUẬN
    // ----------------------------------------------------
    async function fillKhamTheoBangGiaoDien(statusEl) {
        const cfg = readConfigFromUI();
        saveConfig(cfg);

        if (statusEl) statusEl.innerText = '⏳ Đang mở Khám sức khỏe định kỳ...';
        await clickMainTab('Khám sức khỏe định kỳ');

        // 1. THỂ LỰC
        if (cfg.height || cfg.weight || cfg.pulse || cfg.bp) {
            if (statusEl) statusEl.innerText = `⏳ Đang điền Thể lực (Cao ${cfg.height}cm, Nặng ${cfg.weight}kg, Mạch ${cfg.pulse}, HA ${cfg.bp})...`;
            await clickSubTab('THỂ LỰC');
            const paneTL = document.querySelector('.vertical-tabs .ant-tabs-tabpane-active') || document;
            const inputsTL = Array.from(paneTL.querySelectorAll('input'));

            if (cfg.height && inputsTL[0]) setAngularValue(inputsTL[0], cfg.height);
            if (cfg.weight && inputsTL[1]) setAngularValue(inputsTL[1], cfg.weight);
            if (cfg.pulse && inputsTL[3]) setAngularValue(inputsTL[3], cfg.pulse);

            const bpHolder = paneTL.querySelector('input[name="huyet_ap"]') || inputsTL[4];
            if (cfg.bp && bpHolder) setAngularValue(bpHolder, cfg.bp);

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
        if (statusEl) statusEl.innerText = '⏳ Đang điền Khám Lâm Sàng 7 chuyên khoa...';
        await clickSubTab('KHÁM LÂM SÀNG');
        const paneLS = document.querySelector('.vertical-tabs .ant-tabs-tabpane-active') || document;

        const textareasLS = Array.from(paneLS.querySelectorAll('textarea'));
        const selectsLS = Array.from(paneLS.querySelectorAll('nz-select'));

        // 2.1 NỘI KHOA (8 chuyên khoa: Tuần hoàn, Hô hấp, Tiêu hóa, Thận, Nội tiết, Cơ xương khớp, Thần kinh, Tâm thần)
        if (!cfg.skipNoiKhoa) {
            const defaultNoiKhoaTexts = [
                "T1T2 đều rõ không có tiếng bệnh lý",
                "Lồng ngực cân đối di động đều theo nhịp thở,phổi không có ral",
                "Bụng mềm không chướng,gan lách không to",
                "Hiện tại bình thường",
                "Hiện tại bình thường",
                "Hiện tại bình thường",
                "Không có dấu hiệu liệt thần kinh khu trú",
                "Không có dấu hiệu tâm thần kinh"
            ];
            for (let i = 0; i < 8; i++) {
                if (textareasLS[i]) setAngularValue(textareasLS[i], defaultNoiKhoaTexts[i]);
            }
            // Điền 8 cặp dropdown Nội khoa (selects 0..15)
            for (let i = 0; i < 16; i += 2) {
                if (selectsLS[i]) await selectOption(selectsLS[i], cfg.plChuyenKhoa || "Loại II: Khỏe");
                if (selectsLS[i + 1] && cfg.docNoiKhoa) await selectOption(selectsLS[i + 1], cfg.docNoiKhoa);
            }
        }

        // 2.2 NGOẠI KHOA (textarea 8, selects 16, 17)
        if (!cfg.skipNgoaiKhoa) {
            if (textareasLS[8]) setAngularValue(textareasLS[8], "Hiện tại bình thường");
            if (selectsLS[16]) await selectOption(selectsLS[16], cfg.plChuyenKhoa || "Loại II: Khỏe");
            if (selectsLS[17] && cfg.docNgoaiKhoa) await selectOption(selectsLS[17], cfg.docNgoaiKhoa);
        }

        // 2.3 DA LIỄU (textarea 9, selects 18, 19)
        if (!cfg.skipDaLieu) {
            if (textareasLS[9]) setAngularValue(textareasLS[9], "Hiện tại bình thường");
            if (selectsLS[18]) await selectOption(selectsLS[18], cfg.plChuyenKhoa || "Loại II: Khỏe");
            if (selectsLS[19] && cfg.docDaLieu) await selectOption(selectsLS[19], cfg.docDaLieu);
        }

        // 2.4 SẢN PHỤ KHOA (textarea 10, selects 20, 21)
        if (!cfg.skipSanPhuKhoa) {
            if (textareasLS[10]) setAngularValue(textareasLS[10], "Hiện tại bình thường");
            if (selectsLS[20]) await selectOption(selectsLS[20], cfg.plChuyenKhoa || "Loại II: Khỏe");
            if (selectsLS[21] && cfg.docSanPhuKhoa) await selectOption(selectsLS[21], cfg.docSanPhuKhoa);
        }

        // 2.5 MẮT (inputs thị lực, textarea 11, selects 22, 23)
        if (!cfg.skipMat) {
            const inpKKPhai = paneLS.querySelector('input[name="khong_kinh_mat_phai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[0];
            const inpKKTrai = paneLS.querySelector('input[name="khong_kinh_mat_trai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[1];
            const inpCKPhai = paneLS.querySelector('input[name="co_kinh_mat_phai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[2];
            const inpCKTrai = paneLS.querySelector('input[name="co_kinh_mat_trai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[3];

            if (inpKKPhai) setAngularValue(inpKKPhai, cfg.matPhai || "6");
            if (inpKKTrai) setAngularValue(inpKKTrai, cfg.matTrai || "7");
            if (inpCKPhai) setAngularValue(inpCKPhai, cfg.coKinhPhai || "");
            if (inpCKTrai) setAngularValue(inpCKTrai, cfg.coKinhTrai || "");

            if (textareasLS[11]) setAngularValue(textareasLS[11], "Hiện tại bình thường");
            if (selectsLS[22]) await selectOption(selectsLS[22], cfg.plChuyenKhoa || "Loại II: Khỏe");
            if (selectsLS[23] && cfg.docMat) await selectOption(selectsLS[23], cfg.docMat);
        }

        // 2.6 TAI - MŨI - HỌNG (inputs thính lực, textarea 12, selects 24, 25)
        if (!cfg.skipTmh) {
            const inputsTai = Array.from(paneLS.querySelectorAll('input[placeholder="m"]'));
            if (inputsTai[0]) setAngularValue(inputsTai[0], cfg.thinhLucPThuong || "5");
            if (inputsTai[1]) setAngularValue(inputsTai[1], cfg.thinhLucPTham || "0.5");
            if (inputsTai[2]) setAngularValue(inputsTai[2], cfg.thinhLucTThuong || "5");
            if (inputsTai[3]) setAngularValue(inputsTai[3], cfg.thinhLucTTham || "0.5");

            if (textareasLS[12]) setAngularValue(textareasLS[12], "Hiện tại bình thường");
            if (selectsLS[24]) await selectOption(selectsLS[24], cfg.plChuyenKhoa || "Loại II: Khỏe");
            if (selectsLS[25] && cfg.docTmh) await selectOption(selectsLS[25], cfg.docTmh);
        }

        // 2.7 RĂNG - HÀM - MẶT (textareas 13..15, selects 26, 27)
        if (!cfg.skipRhm) {
            if (textareasLS[13]) setAngularValue(textareasLS[13], "Bình thường");
            if (textareasLS[14]) setAngularValue(textareasLS[14], "Bình thường");
            if (textareasLS[15]) setAngularValue(textareasLS[15], "Hiện tại bình thường");
            if (selectsLS[26]) await selectOption(selectsLS[26], cfg.plChuyenKhoa || "Loại II: Khỏe");
            if (selectsLS[27] && cfg.docRhm) await selectOption(selectsLS[27], cfg.docRhm);
        }

        // 3. KẾT LUẬN
        if (statusEl) statusEl.innerText = '⏳ Đang điền Kết Luận...';
        await clickSubTab('KẾT LUẬN');
        const paneKL = document.querySelector('.vertical-tabs .ant-tabs-tabpane-active') || document;

        // 3.1 Phân loại chung
        const cbsKL = Array.from(paneKL.querySelectorAll('.ant-checkbox-wrapper'));
        const targetCb = cbsKL.find(c => c.innerText.includes(cfg.plKetLuan) || (cfg.plKetLuan.includes('Loại II') && c.innerText.includes('Loại II')));
        if (targetCb && !targetCb.classList.contains('ant-checkbox-wrapper-checked')) {
            targetCb.click();
        }
        const otherCbs = cbsKL.filter(c => c !== targetCb && (c.innerText.includes('Loại I:') || c.innerText.includes('Loại II') || c.innerText.includes('Loại III') || c.innerText.includes('Loại IV') || c.innerText.includes('Loại V')));
        otherCbs.forEach(c => {
            if (c.classList.contains('ant-checkbox-wrapper-checked') && !c.innerText.includes(cfg.plKetLuan)) {
                c.click();
            }
        });

        // 3.2 Xác nhận kết thúc khám
        const cbKetThuc = cbsKL.find(c => c.innerText.includes('Xác nhận kết thúc khám') || c.closest('div')?.innerText?.includes('Xác nhận kết thúc khám')) || cbsKL[cbsKL.length - 1];
        if (cbKetThuc && !cbKetThuc.classList.contains('ant-checkbox-wrapper-checked')) {
            cbKetThuc.click();
        }

        // 3.3 Bác sĩ kết luận
        const selectsKL = Array.from(paneKL.querySelectorAll('nz-select'));
        const docSelectKL = selectsKL[1] || selectsKL[selectsKL.length - 1];
        if (docSelectKL && cfg.docKetLuan) {
            await selectOption(docSelectKL, cfg.docKetLuan);
        }

        // 3.4 Giờ kết thúc
        const timeInput = paneKL.querySelector('input[placeholder="__:__"]');
        if (timeInput) {
            setAngularValue(timeInput, cfg.gioKetThuc || '07:45');
        }

        // 3.5 Bấm Lưu
        if (cfg.autoSave) {
            if (statusEl) statusEl.innerText = '⏳ Đang bấm Lưu...';
            await delay(350);
            const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Lưu' || b.innerText.includes('Lưu (F11)'));
            if (saveBtn) {
                saveBtn.click();
                if (statusEl) statusEl.innerText = `✅ ĐÃ ĐIỀN XONG & ĐÃ LƯU (Cao ${cfg.height}, Nặng ${cfg.weight}, Mạch ${cfg.pulse}, HA ${cfg.bp})!`;
            } else {
                if (statusEl) statusEl.innerText = '✅ ĐÃ ĐIỀN XONG (Vui lòng bấm Lưu)!';
            }
        } else {
            if (statusEl) statusEl.innerText = '✅ ĐÃ ĐIỀN XONG THEO THÔNG SỐ (Chưa bấm Lưu)!';
        }
    }

    function readConfigFromUI() {
        return {
            height: document.getElementById('cfg-height')?.value?.trim() || '150',
            weight: document.getElementById('cfg-weight')?.value?.trim() || '48',
            pulse: document.getElementById('cfg-pulse')?.value?.trim() || '80',
            bp: document.getElementById('cfg-bp')?.value?.trim() || '100/60',
            theLucRadio: document.getElementById('cfg-theluc-pl')?.value || 'Loại 2',

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

            plChuyenKhoa: document.getElementById('cfg-pl-ck')?.value || 'Loại II: Khỏe',
            plKetLuan: document.getElementById('cfg-pl-ketluan')?.value || 'Loại II: Khỏe',
            docKetLuan: document.getElementById('cfg-doc-ketluan')?.value?.trim() || '',
            gioKetThuc: document.getElementById('cfg-gio-kt')?.value?.trim() || '07:45',
            autoSave: document.getElementById('cfg-auto-save')?.checked ?? true
        };
    }

    let isRunning = false;

    async function handleRunClick() {
        if (isRunning) return;
        isRunning = true;
        const statusEl = document.getElementById('his-panel-status');
        const runBtn = document.getElementById('his-panel-run-btn');
        if (runBtn) {
            runBtn.disabled = true;
            runBtn.innerText = '⏳ Đang điền theo thông số...';
        }

        try {
            const activeTopTab = document.querySelector('.tab-app-main .ant-tabs-tab-active')?.innerText || '';
            if (activeTopTab.includes('Tiếp đón')) {
                await fillTiepDonConfig(statusEl);
                await delay(500);
            }
            await fillKhamTheoBangGiaoDien(statusEl);
        } catch (e) {
            console.error('Lỗi tự động hóa:', e);
            if (statusEl) statusEl.innerText = '❌ Lỗi: ' + e.message;
        } finally {
            isRunning = false;
            if (runBtn) {
                runBtn.disabled = false;
                runBtn.innerText = '🚀 ĐIỀN KHÁM THEO BẢNG & LƯU (F9)';
            }
        }
    }

    // ----------------------------------------------------
    // 3. BẢNG ĐIỀU KHIỂN GIAO DIỆN CHUYÊN NGHIỆP
    // ----------------------------------------------------
    function mountControlPanel() {
        if (document.getElementById('his-tool-control-panel')) return;

        const cfg = loadConfig();

        const panel = document.createElement('div');
        panel.id = 'his-tool-control-panel';
        panel.style.position = 'fixed';
        panel.style.bottom = '15px';
        panel.style.right = '15px';
        panel.style.width = '440px';
        panel.style.backgroundColor = '#ffffff';
        panel.style.borderRadius = '12px';
        panel.style.boxShadow = '0 12px 35px rgba(0,0,0,0.4)';
        panel.style.zIndex = '2147483647';
        panel.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
        panel.style.border = '2px solid #fa8c16';
        panel.style.overflow = 'hidden';

        panel.innerHTML = `
            <div style="background: linear-gradient(135deg, #fa8c16, #ff7a45); color: white; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 13px;">
                <span>⚙️ BẢNG CẤU HÌNH & TỰ ĐỘNG ĐIỀN HIS V2</span>
                <div>
                    <button id="his-panel-reload-btn" title="Nạp lại bảng điều khiển" style="background: rgba(255,255,255,0.25); border: none; color: white; font-size: 12px; cursor: pointer; border-radius: 4px; padding: 2px 7px; margin-right: 4px;">🔄</button>
                    <button id="his-panel-toggle-btn" style="background: rgba(255,255,255,0.25); border: none; color: white; font-size: 12px; cursor: pointer; border-radius: 4px; padding: 2px 8px;">➖ Thu nhỏ</button>
                </div>
            </div>
            <div id="his-panel-body" style="padding: 12px; font-size: 12px; color: #262626; line-height: 1.4; max-height: 540px; overflow-y: auto;">
                
                <!-- 1. BẢNG THỂ LỰC -->
                <div style="background: #f0f5ff; border: 1px solid #adc6ff; padding: 8px 10px; border-radius: 8px; margin-bottom: 8px;">
                    <b style="color: #1d39c4; font-size: 12px;">🏋️ 1. THỂ LỰC</b>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; margin-top: 5px;">
                        <div>
                            <label style="font-size: 10px; color: #595959;">Cao (cm):</label>
                            <input id="cfg-height" type="text" value="${cfg.height}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; text-align: center; color: #1d39c4;">
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">Nặng (kg):</label>
                            <input id="cfg-weight" type="text" value="${cfg.weight}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; text-align: center; color: #1d39c4;">
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
                        <select id="cfg-theluc-pl" style="padding: 2px 6px; border-radius: 4px; border: 1px solid #d9d9d9; font-weight: bold; font-size: 11px; color: #1d39c4;">
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
                                <option value="Loại II: Khỏe" ${cfg.plChuyenKhoa.includes('Loại II') ? 'selected' : ''}>Loại II: Khỏe</option>
                                <option value="Loại I: Rất khỏe" ${cfg.plChuyenKhoa.includes('Loại I:') ? 'selected' : ''}>Loại I: Rất khỏe</option>
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

                <!-- 4. NÚT ĐIỀU KHIỂN -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                    <button id="btn-fill-td-only" style="padding: 9px 6px; background: #fa8c16; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; box-shadow: 0 2px 6px rgba(250,140,22,0.35);">
                        ⚡ Điền Tiếp Đón (*)
                    </button>
                    <button id="btn-save-cfg-only" style="padding: 9px 6px; background: #1890ff; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; box-shadow: 0 2px 6px rgba(24,144,255,0.35);">
                        💾 Lưu Thông Số
                    </button>
                </div>

                <button id="his-panel-run-btn" style="width: 100%; padding: 11px; background: #52c41a; color: white; border: none; border-radius: 7px; font-size: 13px; font-weight: bold; cursor: pointer; box-shadow: 0 3px 10px rgba(82,196,26,0.4);">
                    🚀 ĐIỀN KHÁM THEO BẢNG & LƯU (F9)
                </button>

                <div id="his-panel-status" style="text-align: center; margin-top: 8px; font-weight: bold; color: #52c41a; font-size: 11px;"></div>
            </div>
        `;

        document.body.appendChild(panel);

        const inputs = panel.querySelectorAll('input, select');
        inputs.forEach(inp => {
            inp.addEventListener('change', () => {
                const updated = readConfigFromUI();
                saveConfig(updated);
            });
        });

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

        const statusEl = document.getElementById('his-panel-status');

        const btnTdOnly = document.getElementById('btn-fill-td-only');
        if (btnTdOnly) btnTdOnly.onclick = () => fillTiepDonConfig(statusEl);

        const btnSaveCfg = document.getElementById('btn-save-cfg-only');
        if (btnSaveCfg) {
            btnSaveCfg.onclick = () => {
                const c = readConfigFromUI();
                saveConfig(c);
                if (statusEl) statusEl.innerText = '💾 Đã lưu cấu hình thông số thành công!';
            };
        }

        const runBtn = document.getElementById('his-panel-run-btn');
        if (runBtn) runBtn.onclick = handleRunClick;
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'F9') {
            e.preventDefault();
            handleRunClick();
        }
    });

    mountControlPanel();
    if (window._hisAutoRemountTimer) clearInterval(window._hisAutoRemountTimer);
    window._hisAutoRemountTimer = setInterval(mountControlPanel, 1500);

})();
