// ==UserScript==
// @name         HIS V2 - Bảng Điều Khiển Điền Khám Lâm Sàng & Kết Luận
// @namespace    http://tampermonkey.net/
// @version      3.6
// @description  Chỉ điền Khám lâm sàng & Kết luận: Loại II Khỏe, Ngoại/Da liễu BS 06, Sản phụ khoa bỏ trống, Mắt 6 7 6 7 BS 24, TMH BS 24, RHM BS 24, Kết luận BS 02.
// @author       Antigravity
// @match        https://v20.ytecoso.vn/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const delay = ms => new Promise(r => setTimeout(r, ms));
    const getActivePane = () => document.querySelector('.ant-tabs-tabpane-active') || document;

    const setAngularValue = (el, value) => {
        if (!el) return;
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
    };

    const clickTab = async (tabName) => {
        const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab'));
        const tab = tabs.find(t => t.innerText.trim() === tabName || t.innerText.includes(tabName));
        if (tab) {
            tab.click();
            await delay(250);
        }
    };

    const selectOptionByText = async (selectEl, targetText, fallbackText = '') => {
        if (!selectEl) return false;
        const topControl = selectEl.querySelector('nz-select-top-control') || selectEl;
        topControl.click();
        await delay(120);

        const input = selectEl.querySelector('.ant-select-selection-search-input');
        if (input) {
            input.focus();
            input.value = targetText;
            input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            input.dispatchEvent(new KeyboardEvent('keydown', { key: targetText[0], bubbles: true }));
            input.dispatchEvent(new KeyboardEvent('keyup', { key: targetText[0], bubbles: true }));
        }

        for (let i = 0; i < 20; i++) {
            await delay(90);
            const options = Array.from(document.querySelectorAll('.ant-select-item-option'));
            const match = options.find(o => o.innerText.includes(targetText) || (fallbackText && o.innerText.includes(fallbackText)));
            if (match) {
                match.click();
                await delay(120);
                return true;
            }
        }
        document.body.click();
        return false;
    };

    let isRunning = false;

    // ----------------------------------------------------
    // CHỈ ĐIỀN KHÁM LÂM SÀNG & KẾT LUẬN THEO YÊU CẦU MỚI
    // ----------------------------------------------------
    async function fillKhamLamSangVaKetLuan(statusEl) {
        if (statusEl) statusEl.innerText = '⏳ Đang điền Khám Lâm Sàng...';

        // 1. CHUYỂN SANG TAB KHÁM LÂM SÀNG
        await clickTab('KHÁM LÂM SÀNG');
        const paneLS = getActivePane();

        // 1.1 Điền nội dung khám textareas
        const textareasLS = Array.from(paneLS.querySelectorAll('textarea'));
        const defaultTexts = [
            "T1T2 đều rõ không có tiếng bệnh lý",                               // 0: Tuần hoàn
            "Lồng ngực cân đối di động đều theo nhịp thở,phổi không có ral",   // 1: Hô hấp
            "Bụng mềm không chướng,gan lách không to",                          // 2: Tiêu hóa
            "Hiện tại bình thường",                                             // 3: Thận - Tiết niệu
            "Hiện tại bình thường",                                             // 4: Nội tiết
            "Hiện tại bình thường",                                             // 5: Cơ - Xương - Khớp
            "Không có dấu hiệu liệt thần kinh khu trú",                         // 6: Thần kinh
            "Không có dấu hiệu tâm thần kinh",                                  // 7: Tâm thần
            "Hiện tại bình thường",                                             // 8: Ngoại khoa
            "Hiện tại bình thường",                                             // 9: Da liễu
            "",                                                                 // 10: Sản phụ khoa -> KHÔNG ĐIỀN
            "Hiện tại bình thường",                                             // 11: Mắt khác
            "Hiện tại bình thường",                                             // 12: TMH
            "Bình thường",                                                      // 13: Hàm trên
            "Bình thường",                                                      // 14: Hàm dưới
            "Hiện tại bình thường"                                              // 15: RHM
        ];
        for (let i = 0; i < defaultTexts.length; i++) {
            if (i === 10) continue; // Sản phụ khoa: BỎ QUA KHÔNG ĐIỀN
            if (textareasLS[i]) setAngularValue(textareasLS[i], defaultTexts[i]);
        }

        // 1.2 Điền thị lực Mắt: 6 7 6 7
        const inputsMat = Array.from(paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]'));
        if (inputsMat[0]) setAngularValue(inputsMat[0], "6");
        if (inputsMat[1]) setAngularValue(inputsMat[1], "7");
        if (inputsMat[2]) setAngularValue(inputsMat[2], "6");
        if (inputsMat[3]) setAngularValue(inputsMat[3], "7");

        // 1.3 Điền thính lực Tai Mũi Họng (5m / 0.5m)
        const inputsTai = Array.from(paneLS.querySelectorAll('input[placeholder="m"]'));
        if (inputsTai[0]) setAngularValue(inputsTai[0], "5");
        if (inputsTai[1]) setAngularValue(inputsTai[1], "0.5");
        if (inputsTai[2]) setAngularValue(inputsTai[2], "5");
        if (inputsTai[3]) setAngularValue(inputsTai[3], "0.5");

        // 1.4 Điền tất cả Dropdown
        const selectsLS = Array.from(paneLS.querySelectorAll('nz-select'));
        for (let i = 0; i < selectsLS.length; i += 2) {
            if (i === 20) continue; // Sản phụ khoa: BỎ QUA

            // Phân loại: Loại II: Khỏe
            if (selectsLS[i]) {
                await selectOptionByText(selectsLS[i], "Loại II: Khỏe");
            }

            // Bác sĩ chuyên khoa:
            if (selectsLS[i + 1]) {
                let docCode = "04";
                let docName = "Tô Chí Sơn";

                if (i === 16 || i === 18) {
                    docCode = "06";
                    docName = "Mai Ngọc Tuấn";
                } else if (i === 22 || i === 24 || i === 26) {
                    docCode = "24";
                    docName = "Nguyễn Thị Dung";
                }

                await selectOptionByText(selectsLS[i + 1], docCode, docName);
            }
        }

        // 2. CHUYỂN SANG TAB KẾT LUẬN
        if (statusEl) statusEl.innerText = '⏳ Đang điền Kết Luận...';
        await clickTab('KẾT LUẬN');
        const paneKL = getActivePane();

        // 2.1 Chọn Phân loại sức khỏe: Loại II: Khỏe
        const cbsKL = Array.from(paneKL.querySelectorAll('.ant-checkbox-wrapper'));
        const cbLoai2 = cbsKL.find(c => c.innerText.includes('Loại II: Khỏe') || c.innerText.includes('Loại II:'));
        if (cbLoai2 && !cbLoai2.classList.contains('ant-checkbox-wrapper-checked')) {
            cbLoai2.click();
        }
        const otherCbs = cbsKL.filter(c => c.innerText.includes('Loại I:') || c.innerText.includes('Loại III') || c.innerText.includes('Loại IV') || c.innerText.includes('Loại V'));
        otherCbs.forEach(c => {
            if (c.classList.contains('ant-checkbox-wrapper-checked')) c.click();
        });

        // 2.2 Tick "Xác nhận kết thúc khám"
        const cbKetThuc = cbsKL.find(c => c.innerText.includes('Xác nhận kết thúc khám') || c.closest('div')?.innerText?.includes('Xác nhận kết thúc khám')) || cbsKL[cbsKL.length - 1];
        if (cbKetThuc && !cbKetThuc.classList.contains('ant-checkbox-wrapper-checked')) {
            cbKetThuc.click();
        }

        // 2.3 Bác sĩ kết luận: Chính xác là selectsKL[1] (select thứ 2 trong tab KẾT LUẬN)
        const selectsKL = Array.from(paneKL.querySelectorAll('nz-select'));
        const docSelectKL = selectsKL[1] || selectsKL[selectsKL.length - 1];
        if (docSelectKL) {
            await selectOptionByText(docSelectKL, "02", "Nguyễn Thị Nga");
        }

        // 2.4 Thời gian kết thúc khám (Giờ 24h)
        const timeInput = paneKL.querySelector('input[placeholder="__:__"]');
        if (timeInput) {
            const curVal = timeInput.value || '';
            const morningVal = curVal.includes(':') ? curVal.replace(/^\d{1,2}/, '07') : '07:45';
            setAngularValue(timeInput, morningVal);
        }

        // 3. TỰ ĐỘNG BẤM LƯU
        if (statusEl) statusEl.innerText = '⏳ Đang bấm Lưu...';
        await delay(350);
        const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Lưu' || b.innerText.includes('Lưu (F11)'));
        if (saveBtn) {
            saveBtn.click();
            if (statusEl) statusEl.innerText = '✅ ĐÃ ĐIỀN XONG & ĐÃ LƯU (Loại II - BS 06/24/02)!';
        } else {
            if (statusEl) statusEl.innerText = '✅ ĐÃ ĐIỀN XONG (Vui lòng bấm Lưu)!';
        }
    }

    async function masterAutoFill() {
        if (isRunning) return;
        isRunning = true;
        const statusEl = document.getElementById('his-panel-status');
        const runBtn = document.getElementById('his-panel-run-btn');
        if (runBtn) {
            runBtn.disabled = true;
            runBtn.innerText = '⏳ Đang điền tự động...';
        }

        try {
            await fillKhamLamSangVaKetLuan(statusEl);
        } catch (e) {
            console.error('Lỗi tự động hóa:', e);
            if (statusEl) statusEl.innerText = '❌ Lỗi: ' + e.message;
        } finally {
            isRunning = false;
            if (runBtn) {
                runBtn.disabled = false;
                runBtn.innerText = '⚡ BẮT ĐẦU ĐIỀN TỰ ĐỘNG (F9)';
            }
        }
    }

    // ----------------------------------------------------
    // BẢNG ĐIỀU KHIỂN GIAO DIỆN (PANEL) TRỰC QUAN
    // ----------------------------------------------------
    function createControlPanel() {
        if (document.getElementById('his-tool-control-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'his-tool-control-panel';
        panel.style.position = 'fixed';
        panel.style.bottom = '20px';
        panel.style.right = '20px';
        panel.style.width = '390px';
        panel.style.backgroundColor = '#ffffff';
        panel.style.borderRadius = '12px';
        panel.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';
        panel.style.zIndex = '2147483647';
        panel.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
        panel.style.border = '2px solid #fa8c16';
        panel.style.overflow = 'hidden';

        panel.innerHTML = `
            <div style="background: linear-gradient(135deg, #fa8c16, #ff7a45); color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 14px;">
                <span>⚡ BẢNG ĐIỀU KHIỂN - TỰ ĐỘNG ĐIỀN HIS</span>
                <button id="his-panel-toggle-btn" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 13px; cursor: pointer; border-radius: 4px; padding: 2px 8px;">➖ Thu nhỏ</button>
            </div>
            <div id="his-panel-body" style="padding: 14px; font-size: 12px; color: #262626; line-height: 1.6; max-height: 420px; overflow-y: auto;">
                <div style="background: #e6f7ff; border: 1px solid #91d5ff; padding: 10px; border-radius: 6px; margin-bottom: 12px;">
                    <b style="color: #096dd9;">🎯 Cấu hình mới cập nhật:</b><br>
                    • Phân loại: <b>Loại II: Khỏe</b><br>
                    • Ngoại khoa & Da liễu: <b>BS 06 (Mai Ngọc Tuấn)</b><br>
                    • Sản phụ khoa: <b>BỎ TRỐNG (Không điền)</b><br>
                    • Mắt: <b>6 - 7 - 6 - 7</b> | Bác sĩ: <b>BS 24 (Nguyễn Thị Dung)</b><br>
                    • Tai Mũi Họng: <b>BS 24</b> | Răng Hàm Mặt: <b>BS 24</b><br>
                    • Bác sĩ kết luận: <b>BS 02 (Nguyễn Thị Nga)</b>
                </div>

                <button id="his-panel-run-btn" style="width: 100%; padding: 12px; background: #fa8c16; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(250,140,22,0.4); transition: 0.2s;">
                    🚀 BẮT ĐẦU ĐIỀN TỰ ĐỘNG (F9)
                </button>
                <div id="his-panel-status" style="text-align: center; margin-top: 8px; font-weight: bold; color: #52c41a; font-size: 13px;"></div>
            </div>
        `;

        document.body.appendChild(panel);

        let isCollapsed = false;
        const body = document.getElementById('his-panel-body');
        const toggleBtn = document.getElementById('his-panel-toggle-btn');
        toggleBtn.onclick = () => {
            isCollapsed = !isCollapsed;
            body.style.display = isCollapsed ? 'none' : 'block';
            toggleBtn.innerText = isCollapsed ? '➕ Mở rộng' : '➖ Thu nhỏ';
        };

        const runBtn = document.getElementById('his-panel-run-btn');
        runBtn.onclick = masterAutoFill;
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'F9') {
            e.preventDefault();
            masterAutoFill();
        }
    });

    createControlPanel();
    setInterval(createControlPanel, 1500);
})();
